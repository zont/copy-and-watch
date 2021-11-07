# copy-and-watch

[!['Build status'][travis_image_url]][travis_page_url]

[travis_image_url]: https://api.travis-ci.org/zont/copy-and-watch.svg
[travis_page_url]: https://travis-ci.org/zont/copy-and-watch

Synchronize files and folders locally by glob patterns, watch option included.

## Install

```sh
npm i -D copy-and-watch
```

## Usage

```sh
copy-and-watch [options] <sources> <target>

options:
  --watch - enable file watcher
  --clean - clean target folder on start
  --skip-initial-copy - skip copying files initially, only copy if they change. Must be used with `--watch` argument.
```

### In your `package.json`

You may have some build script in your package.json involving mirroring folders (let's say, static assets), that's a good use-case for `copy-and-watch`:

```json
{
  "devDependencies": {
    "copy-and-watch": "latest"
  },
  "scripts": {
    "build": "copy-and-watch src/**/*.{html,json} src/**/fonts/* dist/",
    "watch": "copy-and-watch --watch src/**/*.{html,json} src/**/{fonts,images}/* dist/"
  }
}
```

## Changelog

##### 0.1.4
- Added support for `—skip-initial-copy` argument (by mugli)

##### 0.1.2
- Fixed copy on dir bug (by arnarthor)
