const cp = require('child_process');
const fse = require('fs-extra');
const inquirer = require('inquirer');
const log = require('npmlog');
const path = require('path');
const tmp = require('tmp');

tmp.setGracefulCleanup();

function runInstall(dir, pkg) {
  return new Promise((resolve, reject) => {
    const args = ['install'];
    if (pkg) {
      args.push(pkg);
    }
    const message = `spawning 'npm ${args.join(' ')}' in ${dir}`;
    log.verbose('nik', message);
    const install = cp.spawn('npm', args, {
      cwd: dir,
      stdio: 'inherit'
    });
    install.on('close', code => {
      if (code !== 0) {
        reject(new Error(message));
        return;
      }
      resolve(dir);
    });
  });
}

async function installToTmpDir(pkg) {
  const dirObj = tmp.dirSync();
  return await runInstall(dirObj.name, pkg);
}

async function getInstalledModule(dir) {
  const modules = path.join(dir, 'node_modules');
  const files = await fse.readdir(modules);
  if (files.length === 1) {
    return path.join(modules, files[0]);
  }
  const deps = {};
  try {
    files.forEach(filepath => {
      const pkg = require(path.join(modules, filepath, 'package.json'));
      if (pkg.peerDependencies) {
        Object.assign(deps, pkg.peerDependencies);
      }
    });
  } catch (err) {
    throw new Error(`Failed to get installed module: ${err.message}`);
  }
  const candidates = files.filter(filepath => deps.hasOwnProperty(filepath));
  if (candidates.length === 1) {
    return path.join(modules, candidates[0]);
  }
  throw new Error(`Could not resovle installed module: ${dir}`);
}

var ignores = [
  'bugs',
  'dist',
  'homepage',
  'readme',
  'readmeFilename',
  'repository',
  '_from',
  '_fromGithub',
  '_id',
  '_inBundle',
  '_integrity',
  '_location',
  '_phantomChildren',
  '_requested',
  '_requiredBy',
  '_resolved',
  '_shasum',
  '_spec',
  '_where'
];

async function overwritePackageConfig(manifest, overrides) {
  const config = Object.assign(require(manifest), overrides);
  ignores.forEach(ignore => delete config[ignore]);
  const json = JSON.stringify(config, null, 2) + '\n';
  await fse.writeFile(manifest, json);
  return manifest;
}

async function nik(pkg, dest) {
  await fse.mkdirs(dest);
  const files = await fse.readdir(dest);
  if (files.length !== 0) {
    throw new Error('Destination directory must be empty');
  }

  process.stdout.write('Provide some details for your package.json:\n');
  const questions = [
    {
      type: 'input',
      name: 'name',
      message: 'name',
      default: path.basename(path.resolve(dest))
    },
    {
      type: 'input',
      name: 'description',
      message: 'description',
      default: ''
    }
  ];
  const overrides = await inquirer.prompt(questions);
  overrides.version = '0.0.0';

  log.info('nik', `Fetching ${pkg}`);
  const tmpDir = await installToTmpDir(pkg);
  const moduleDir = await getInstalledModule(tmpDir);
  await runInstall(moduleDir);
  const manifest = path.join(moduleDir, 'package.json');
  await overwritePackageConfig(manifest, overrides);
  await fse.copy(moduleDir, dest);
  await fse.remove(tmpDir);
}

module.exports = nik;
