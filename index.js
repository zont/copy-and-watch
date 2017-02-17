#!/usr/bin/env node

/* IMPORTS */

const fs = require('fs-extra');
const path = require('path');
const chokidar = require('chokidar');
const glob = require('glob');
const globParent = require('glob-parent');
require('colors');

/* CODE */

const args = process.argv.slice(2);
const watch = args.includes('--watch');

if (watch) {
  args.splice(args.indexOf('--watch'), 1);
}

if (args.length < 2) {
  console.error('Not enough arguments: copy-and-watch [--watch] <sources> <target>'.red);
  process.exit(1);
}

const target = args.pop();
const sources = args;
const parents = [...new Set(sources.map(globParent))];

const findTarget = from => {
  const parent = parents
    .filter(p => from.includes(p))
    .sort()
    .reverse()[0];
  return path.join(target, path.relative(parent, from));
};
const copy = from => {
  const to = findTarget(from);
  fs.copySync(from, to);
  console.log('[COPY]'.yellow, from, 'to'.yellow, to);
};
const remove = from => {
  const to = findTarget(from);
  fs.remove(to);
  console.log('[DELETE]'.yellow, to);
};

// initial copy
fs.ensureDirSync(target);
sources.forEach(s => glob.sync(s).forEach(copy));

// watch
if (watch) {
  chokidar.watch(sources, {
    ignoreInitial: true
  })
    .on('ready', () => sources.forEach(s => console.log('[WATCH]'.yellow, s)))
    .on('add', copy)
    .on('addDir', copy)
    .on('change', copy)
    .on('unlink', remove)
    .on('unlinkDir', remove)
    .on('error', e => console.log('error', e));
}
