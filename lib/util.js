'use strict';

module.exports = {
	onChangedLog: function (browserify, cb) {
		var bytes;
		browserify.on('bytes', function (_bytes) {
			bytes = _bytes;
		});
		browserify.on('log', function (msg) {
			if (bytes > 0) cb(msg);
		});
	},
};
