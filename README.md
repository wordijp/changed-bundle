maybe-bundle
================

[![NPM](https://nodei.co/npm/maybe-bundle.png)](https://nodei.co/npm/maybe-bundle/)

Let `maybe-bundle` plugin for watchify, provides to re bundle only when files changed.

# install

```
npm install maybe-bundle
```

# usage
## Programmatic API

In your task runner like gulp, add this plugin to browserify:

```
var b = browserify({
	entries: ['entry.js'],
	cache: {},
	packageCache: {},
	plugin: [watchify],
})
	.plugin('maybe-bundle', {
		label: 'LABEL' // optional. distinction with other skip messages
	});
```

## Command Line

```shell
$ watchify entry.js -v -p [maybe-bundle --label LABEL] > bundle.js
```

### running demo

first time bundle is output bundle file.

```shell
567 bytes written to bundle.js (0.12 seconds)
```

bundle from the second time, skip re bundle if no change in the files.

```shell
*** LABEL: skip write to bundle file ***
```

# license

MIT
