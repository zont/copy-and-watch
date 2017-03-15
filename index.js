/* IMPORTS */

const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const glob = require('glob');
const globParent = require('glob-parent');
require('colors');

/* CODE */

const args = process.argv.slice(2);
const options = {};

['watch', 'clean'].forEach(key => {
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
const copy = from => {
  const to = findTarget(from);
  fs.writeFileSync(to, fs.readFileSync(from));
  console.log('[COPY]'.yellow, from, 'to'.yellow, to);
};
const remove = from => {
  const to = findTarget(from);
  fs.unlinkSync(to);
  console.log('[DELETE]'.yellow, to);
};

// clean
if (options.clean) {
  fs.rmdirSync(target)
}

// initial copy
if (!fs.existsSync(target)) {
  fs.mkdirSync(target);
}
sources.forEach(s => glob.sync(s).forEach(copy));

// watch
if (options.watch) {
  chokidar.watch(sources, {
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
