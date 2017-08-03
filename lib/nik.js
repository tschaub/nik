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
      args.push(pkg, '--save');
    }
    args.push('--loglevel', 'error');
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

function runInit(dir) {
  return new Promise((resolve, reject) => {
    const args = ['init', '--yes'];
    const message = `spawning 'npm ${args.join(' ')}' in ${dir}`;
    log.verbose('nik', message);
    const init = cp.spawn('npm', args, {
      cwd: dir,
      stdio: 'ignore'
    });
    init.on('close', code => {
      if (code !== 0) {
        reject(new Error(message));
        return;
      }
      resolve(dir);
    });
  });
}

async function installToTmpDir(pkg) {
  const dir = tmp.dirSync().name;
  await runInit(dir);
  return await runInstall(dir, pkg);
}

async function getInstalledModule(dir) {
  const manifest = require(path.join(dir, 'package.json'));
  const candidates = Object.keys(manifest.dependencies);
  if (candidates.length === 1) {
    return path.join(dir, 'node_modules', candidates[0]);
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

  log.info('nik', 'Installing dependencies');
  await runInstall(moduleDir);
  const manifest = path.join(moduleDir, 'package.json');
  await overwritePackageConfig(manifest, overrides);
  await fse.copy(moduleDir, dest);
  await fse.remove(tmpDir);
}

module.exports = nik;
