changed-bundle
================

[![NPM](https://nodei.co/npm/changed-bundle.png)](https://nodei.co/npm/changed-bundle/)

Let `changed-bundle` plugin for watchify, provides to re bundle only when files changed.

# install

```
npm install changed-bundle
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
	.plugin('changed-bundle', {
		label: 'LABEL' // optional. distinction with other skip messages
	});
```

## Command Line

```shell
$ watchify entry.js -v -p [changed-bundle --label LABEL] > bundle.js
```

### running demo

first time bundle is output bundle file.

```shell
567 bytes written to bundle.js (0.12 seconds)
```

bundle from the second time, skip re bundle if no change in the files.

```shell
*** LABEL: skip write to bundle file (0.01 seconds) ***
```

# license

MIT
