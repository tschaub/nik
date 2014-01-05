var cp = require('child_process');
var fse = require('fs-extra');
var path = require('path');

var async = require('async');
var log = require('npmlog');
var promzard = require('promzard');
var tmp = require('tmp');

tmp.setGracefulCleanup();


/**
 * Assign properties of one object to another.
 * @param {Object} obj The target object.
 * @param {Object} source The source object.
 * @return {Object} The target object.
 */
function assign(obj, source) {
  Object.keys(source).forEach(function(key) {
    obj[key] = source[key];
  });
  return obj;
}


/**
 * Assign properties of one object to another if the properties don't already
 * exist on the target.
 * @param {Object} obj The target object.
 * @param {Object} source The source object.
 * @return {Object} The target object.
 */
function assignIf(obj, source) {
  Object.keys(source).forEach(function(key) {
    if (!obj.hasOwnProperty(key)) {
      obj[key] = source[key];
    }
  });
  return obj;
}


/**
 * Create a shallow clone of an object.
 * @param {Object} obj Source object.
 * @return {Object} The clone.
 */
function clone(obj) {
  return assign({}, obj);
}


/**
 * Install the given package to a temporary directory.
 * @param {string} pkg Package arg for `npm install`.
 * @param {function(Error, string)} callback Called with any error or the path
 *     to the temp directory on success.
 */
var installToTmpDir = exports.installToTmpDir = function(pkg, callback) {
  tmp.dir(function(err, dir) {
    if (err) {
      return callback(err);
    }
    var install = cp.spawn('npm', ['install', pkg],
        {cwd: dir, stdio: 'inherit'});
    install.on('close', function(code) {
      if (code !== 0) {
        callback(new Error('Failed to install ' + pkg));
      } else {
        callback(null, dir);
      }
    });
  });
};


/**
 * Get the single installed module in a directory.  The `npm install` command
 * doesn't provide a deterministic way to get the name of the installed module.
 * When a module has peer dependencies, multiple modules may be installed at
 * once, and the names for all are returned (it seems the order has no meaning).
 * So we have to scan through all installed modules and try to determine which
 * one relates to the argument provided to `npm install` (in the case of a URL
 * or file path, the module name may not be in the argument provided to the
 * command).
 * @param {string} dir Path to directory.
 * @param {function(Error, string)} callback Called with an error if there are
 *     no installed modules or if the desired module cannot be identified.
 *     The callback will be called with the path to the installed module if one
 *     can be derived.
 */
var getInstalledModule = exports.getInstalledModule = function(dir, callback) {
  var modules = path.join(dir, 'node_modules');
  fse.readdir(modules, function(err, files) {
    if (err) {
      return callback(err);
    }
    if (files.length === 1) {
      return callback(null, path.join(modules, files[0]));
    } else {
      var deps = {};
      try {
        files.forEach(function(filepath) {
          var pkg = require(path.join(modules, filepath, 'package.json'));
          if (pkg.peerDependencies) {
            assign(deps, pkg.peerDependencies);
          }
        });
      } catch (e) {
        callback(new Error('Failed to get installed module: ' + e.message));
      }
      var candidates = files.filter(function(filepath) {
        return !deps.hasOwnProperty(filepath);
      });
      if (candidates.length === 1) {
        callback(null, path.join(modules, candidates[0]));
      } else {
        callback(new Error('Could not resolve installed module: ' + dir));
      }
    }
  });
};


/**
 * Run `npm install` in the provided directory.
 * @param {string} dir Directory path.
 * @param {function(Error, string)} callback Callback.
 */
var runInstall = exports.runInstall = function(dir, callback) {
  var install = cp.spawn('npm', ['install'],
      {cwd: dir, stdio: 'inherit'});
  install.on('close', function(code) {
    if (code !== 0) {
      callback(new Error('Failed to install ' + dir));
    } else {
      callback(null, dir);
    }
  });
};


/**
 * Overwrite the provided package.json with user provided overrides.
 * @param {string} manifest Path to a package.json file.
 * @param {Object} overrides Overrides to apply.
 * @param {function(Error, string)} callback Called with any errors or the path
 *     to the newly written package.json on success.
 */
var overwritePackageConfig = exports.overwritePackageConfig =
    function(manifest, overrides, callback) {
  var config = assign(require(manifest), overrides);
  var ignores = [
    'homepage', 'repository', 'readme', 'readmeFilename', 'bugs', '_id', '_from'
  ];
  ignores.forEach(function(ignore) {
    delete config[ignore];
  });
  var json = JSON.stringify(config, null, 2) + '\n';
  fse.writeFile(manifest, json, function(err) {
    callback(err, manifest);
  });
};


/**
 * Nik a package.
 * @param {string} pkg The package name (same syntax as `npm install`).
 * @param {string} dest The path to the destination directory.
 * @param {function(Error)} callback Called with any errors or null on success.
 */
exports.nik = function(pkg, dest, callback) {
  var overrides, tmpDir, moduleDir;
  async.waterfall([
    function(done) {
      fse.readdir(dest, done);
    },
    function(files, done) {
      if (files.length !== 0) {
        done(new Error('Destination directory must be empty'));
      } else {
        done(null);
      }
    },
    function(done) {
      var inputs = require.resolve('./inputs.js');
      process.stdout.write('Provide some details for your package.json:\n');
      promzard(inputs, {name: path.basename(dest)}, done);
    },
    function(config, done) {
      overrides = config;
      done();
    },
    function(done) {
      log.info('nik', 'Fetching ' + pkg);
      installToTmpDir(pkg, done);
    },
    function(dir, done) {
      tmpDir = dir;
      getInstalledModule(dir, done);
    },
    runInstall,
    function(dir, done) {
      moduleDir = dir;
      var manifest = path.join(dir, 'package.json');
      overwritePackageConfig(manifest, overrides, done);
    },
    function(manifest, done) {
      fse.copy(moduleDir, dest, done);
    },
    function(done) {
      fse.remove(tmpDir, done);
    }
  ], callback);
};
