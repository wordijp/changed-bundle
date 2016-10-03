'use strict';

var through = require('through2');
var crypto = require('crypto');

// watchify plugin

module.exports = changedBundle;
module.exports.util = require('./lib/util');

function sha1(buf) {
	return crypto.createHash('sha1').update(buf).digest('hex');
}

//////////////////////////////////////////////////////////////////////////////

function changedBundle(browserify, options) {
	var current_bundle;
	browserify.on('bundle', function(bundle) {
		current_bundle = bundle;
	});

	// key: file, value: hash
	var file_hash_cache = {};
	// key: file, value: true(dummy)
	var prev_files = {};

	var update_files = {};
	browserify.on('update', function (files) {
		// replace update files
		update_files = {};
		files.forEach(function (file) {
			update_files[file] = true;
		});
	});

	browserify.on('reset', reset);
	reset();

	function reset() {
		var time = null;
		browserify.pipeline.get('record').on('end', function () {
			time = Date.now();
		});

		var modified = false;

		// create event, for canceling output bundle file
		browserify.pipeline.get('pack').once('readable', function () {
			if (modified) return;

			// NOTE : waiting until emitted, for all 'readable' event
			process.nextTick(function() {
				// clear all stream
				// NOTE : remove output bundle file stream
				//        see) node_modules/watchify/bin/cmd.js
				//             writer.once('readable', function() { <- remove target
				//             ...
				while (current_bundle._readableState.pipesCount > 0) current_bundle.unpipe();

				var outfile = browserify.argv && (browserify.argv.o || browserify.argv.outfile) || 'bundle file';
				var delta = Date.now() - time;
				var seconds = ' (' + (delta / 1000).toFixed(2) + ' seconds)';
				var label = options.label ? (options.label + ': ') : '';
				console.error('*** ' + label + 'skip write to ' + outfile + seconds + ' ***');

				current_bundle.emit('end');
			});
		});

		// first phase (deps)
		// key: file: value: row
		var file_rows = {};
		var check_modified_stream = through.obj(
			function transform(row, enc, next) {
				var file = row.expose ? browserify._expose[row.id] : row.file;
				if (update_files[file] || !file_hash_cache[file]) {
					// check: 'add' or 'change source'
					var hash = sha1(row.source);
					if (file_hash_cache[file] !== hash) {
						file_hash_cache[file] = hash;
						modified = true;
					}
				}
				file_rows[file] = row;
				next();
			},
			function flush(done) {
				// check: 'add' or 'unlink'
				if (!modified) {
					if (!_isSameKey(prev_files, file_rows)) {
						modified = true;
					}
				}

				// replace current files
				prev_files = {};
				for (var key in file_rows) prev_files[key] = true;

				if (modified) {
					for (var key in file_rows) this.push(file_rows[key]);
				}
				done();
			});
		browserify.pipeline.get('deps').push(check_modified_stream);

		// second phase (pack)
		var maybe_skip_stream = through.obj(
			function transform(row, enc, next) {
				if (modified) this.push(row);
				next();
			});
		browserify.pipeline.get('pack').push(maybe_skip_stream);
	}

	return browserify;
};
function _isSameKey(o1, o2) {
	if (_size(o1) !== _size(o2)) return false;
	for (var key in o1) if (!o2[key]) return false;

	return true;
}
function _size(o) {
	var n = 0;
	for (var key in o) ++n;
	return n;
}

