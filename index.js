const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const glob = require('glob');
const globParent = require('glob-parent');
require('colors');

/* CODE */

const args = process.argv.slice(2);
const options = {};

['watch', 'clean', 'skip-initial-copy'].forEach(key => {
  const index = args.indexOf(`--${key}`);
  if (index >= 0) {
    options[key] = true;
    args.splice(index, 1);
  }
});

if (args.length < 2) {
  console.error('Not enough arguments: copy-and-watch [options] <sources> <target>'.red);
  process.exit(1);
}

if (options['skip-initial-copy'] && !options['watch']) {
  console.error('--skip-initial-copy argument is meant to be used with --watch, otherwise no files will be copied'.red);
  process.exit(1);
}

const target = args.pop();
const sources = args;
const parents = [...new Set(sources.map(globParent))];

const findTarget = from => {
  const parent = parents
    .filter(p => from.indexOf(p) >= 0)
    .sort()
    .reverse()[0];
  return path.join(target, path.relative(parent, from));
};
const createDirIfNotExist = to => {
  'use strict';

  const dirs = [];
  let dir = path.dirname(to);

  while (dir !== path.dirname(dir)) {
    dirs.unshift(dir);
    dir = path.dirname(dir);
  }

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
  });
};
const copy = from => {
  const to = findTarget(from);
  createDirIfNotExist(to);
  const stats = fs.statSync(from);
  if (stats.isDirectory()) {
    return;
  }
  fs.writeFileSync(to, fs.readFileSync(from));
  console.log('[COPY]'.yellow, from, 'to'.yellow, to);
};
const remove = from => {
  const to = findTarget(from);
  if(fs.existsSync(to)) {
    fs.unlinkSync(to);
    console.log('[DELETE]'.yellow, to);
  }else{
    console.log('[DELETE FAILED]'.yellow, to);
  }  
};
const rimraf = dir => {
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach(entry => {
      const entryPath = path.join(dir, entry);
      if (fs.lstatSync(entryPath).isDirectory()) {
        rimraf(entryPath);
      } else {
        fs.unlinkSync(entryPath);
      }
    });
    fs.rmdirSync(dir);
  }
};

// clean
if (options.clean) {
  rimraf(target);
}

// initial copy
if (!options['skip-initial-copy']) {
  sources.forEach(s => glob.sync(s).forEach(copy));
}

// watch
if (options.watch) {
  chokidar
    .watch(sources, {
      ignoreInitial: true
    })
    .on('ready', () => sources.forEach(s => console.log('[WATCH]'.yellow, s)))
    .on('add', copy)
    .on('addDir', copy)
    .on('change', copy)
    .on('unlink', remove)
    .on('unlinkDir', remove)
    .on('error', e => console.log('[ERROR]'.red, e));
}
