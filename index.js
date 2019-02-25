/* IMPORTS */
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const glob = require('glob');
const globParent = require('glob-parent');
require('colors');


/* EVIL GLOBALS */
var destination, parents;


/* CODE */
const args = process.argv.slice(2);

let watch = false, clean = false;
const sourceGlobs = [];

for (let arg of args) {
	if (arg === '--watch') {
		watch = true;
	} else if (arg === '--clean') {
		clean = true;
	} else {
		sourceGlobs.push(arg);
	}
}

destination = sourceGlobs.pop(); //pick last path as destination

if (sourceGlobs.length === 0 || destination === undefined) {
	console.error('Not enough arguments: copy-and-watch [options] <sources> <target>'.red);
	process.exit(1);
}

parents = [...new Set(sourceGlobs.map(globParent))];

if (clean) {
	console.log('Cleaning...');
	rimraf(destination);
}

// initial copy
sourceGlobs.forEach(s => glob.sync(s).forEach(copy));

// watch
if (watch) {
	chokidar.watch(sourceGlobs, {
		ignoreInitial: true
	})
		.on('ready', () => sourceGlobs.forEach(s => console.log('[WATCHING]'.cyan, s)))
		.on('add', copy)
		.on('addDir', copy)
		.on('change', copy)
		.on('unlink', remove)
		.on('unlinkDir', remove)
		.on('error', e => console.log('[ERROR]'.red, e));
}







/* FUNCTIONS */
function findTarget(from) {
	const parent = parents
		.filter(p => from.indexOf(p) >= 0)
		.sort()
		.reverse()[0];
	return path.join(destination, path.relative(parent, from));
}

function createDirIfNotExist(to) {
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
}

function copy(from) {
	const to = findTarget(from);
	createDirIfNotExist(to);
	
	const stats = fs.statSync(from);
	
	if (stats.isDirectory()) {
		fs.readdirSync(from).map(fileName => from+fileName).forEach(copy); //recursively copy directory contents
	} else {
		fs.writeFileSync(to, fs.readFileSync(from));
		console.log('[COPY]'.yellow, from, 'to'.yellow, to);
	}
}

function remove(from) {
	const to = findTarget(from);
	fs.unlinkSync(to);
	console.log('[DELETE]'.red, to);
}

function rimraf(dir) {
	if (fs.existsSync(dir)) {
		fs.readdirSync(dir).forEach(entry => {
			const entryPath = path.join(dir, entry);
			if (fs.lstatSync(entryPath).isDirectory()) {
				rimraf(entryPath);
			} else {
				console.log('[CLEAN]'.magenta, entryPath);
				fs.unlinkSync(entryPath);
			}
		});
		fs.rmdirSync(dir);
	}
}