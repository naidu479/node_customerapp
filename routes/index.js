var express = require('express');
var router = express.Router();
var mongojs = require('mongojs')
var db = mongojs('customerapp', ['users'])

/* GET home page. */
router.get('/', function(req, res, next) {
	db.users.find(function (err, docs) {
	  res.render('index', { title: 'Express', users: docs });
	})
});

module.exports = router;
