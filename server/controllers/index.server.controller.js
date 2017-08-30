var express = require('express');
var router = express.Router();
var Post = require('../models/post.server.model');
var Article = require('../models/board.server.model');
var async = require('async');

router.get('/recentComment',function(req,res){
	async.concat([Post,Article],function(model,callback) {
	  var query = model.find({}).populate(['creator','comments.creator']);
	  query.exec(function(err,docs) {
	    if (err) throw err;
	    callback(err,docs);
	  });
	},
	function(err,result) {
	  if (err) throw err;
	  // results are merged, now sort by date
	  result = result.sort(function(a,b) {
	    return (a.comments.uploadTime < b.comments.uploadTime) 
	      ? 1 : (a.comments.uploadTime > b.comments.uploadTime) ? -1 : 0;
	  });
	  
		res.send(result);
	});

})



router.use('/',express.static('./app'));

module.exports = router;