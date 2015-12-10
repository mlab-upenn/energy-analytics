var express = require('express');
var router = express.Router();
var dashboard = require('./dashboard');

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('homepage');
});

router.get('/dashboard', function(req, res, next) {
	dashboard.displayResponse(req,res);
	//res.render('dashboard', {results: null});
});

module.exports = router;