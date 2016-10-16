var express = require('express');
var router = express.Router();
var ls = require('list-directory-contents');

router.get('/', function(req, res) {
	ls('./public/pictures/pics/', function(err, tree) {
		if (err) {
			res.status(200).send(err);
		} else {
			var files = [];
			tree.forEach(function(file, index) {
				if (file.indexOf('.jpg') != -1 || file.indexOf('.jpeg') != -1 || file.indexOf('.png]') != -1) {
					files.push(file.replace(/\\/g, '/').replace('public/pictures/', ''));
				}
			});
			res.json({
				data: files
			});
		}
	});
});

module.exports = router;