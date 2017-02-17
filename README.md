# copy-and-watch

Synchronize files and folders locally by glob patterns, watch option included.

## Install

```sh
npm i -D copy-and-watch
```

## Usage

```sh
copy-and-watch [--watch] <sources> <target>
```

### In your `package.json`

You may have some build script in your package.json involving mirroring folders (let's say, static assets), that's a good use-case for `copy-and-watch`:

```json
{
  "devDependencies": {
    "copy-and-watch": "latest"
  },
  "scripts": {
    "build": "copy-and-watch src/**/*.{html,json} src/**/fonts/* dist",
    "watch": "copy-and-watch --watch src/**/*.{html,json} src/**/{fonts,images}/* dist"
  }
}
```
