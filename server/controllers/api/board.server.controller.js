var express = require('express');
var router = express.Router();
var multipart = require('connect-multiparty');
var multipartyMiddleware = multipart();
var fs = require('fs');
var uuid = require('uuid');
var User = require('../../models/user.server.model');
var path = require('path');
var Article = require('../../models/board.server.model');

/*var userService = require('../../services/user.server.service');*/

router.get('/',listArticle)
	  .get('/:page',pagingArticle)
	  .post('/',multipartyMiddleware,createArticle);
router.get('/view/:id',readArticle)
	  router.put('/:id',multipartyMiddleware,updateArticle)
      .delete('/:id',deleteArticle);
router.post('/:id/comment',createComment)
	  .delete('/:id/comment/:commentId',deleteComment);
router.post('/:id/like',initLike)
	  .put('/:id/like',like);

module.exports = router;



function listArticle(req,res){
/*	Post.find({},function(err,data){
		if(err){
			res.send('Error');
			return;
		}
		res.send(data);
	})*/
	console.log(req.params);
	Article.find({},[],{sort:{uploadTime: -1}}).populate(['creator','comments.creator'])
	.exec(function(err,article,next){
		if(err){
			return next(err);
		}

		res.send(article);
	})
}
function pagingArticle(req,res){
	console.log(req.params.page)
	var page = req.params.page;
	Article.paginate({},{page: page, limit:1, populate:'creator',sort:'-uploadTime'},function(err,result){
		console.log(result);
		if(err){
			console.log(err);
		}
		res.send(result);
	})
}
function createArticle(req,res){

/*	var file = req.files.file;*/

	var pathDir = path.join(__dirname,'../../../app/static/uploads/board');
	
	var coverDir = 'static/uploads/board';

	if(!fs.existsSync(pathDir)){
		fs.mkdirSync(pathDir);
	}

	/*if(file !== undefined){
		console.log(file);
		console.log(file.name);
		console.log(file.path);
		console.log(uploadPath);

		var ext = file.name.substr(file.name.lastIndexOf('.'),file.name.length);

		var uploadFileName = uuid.v4()+ext;

        var uploadPath = pathDir+"/"+uploadFileName;

		req.body.cover = coverDir+"/"+uploadFileName;

		fs.readFile(file.path,function(err,data){
			fs.writeFile(uploadPath, data, function(err){
				fs.unlink(file.path,function(err){
					if(err){
						res.status(500);
						res.send('500 Error');
					}else{
						
					}
				})
			})
		})
	}*/

	var article = new Article(req.body);


	article.save(function(err){
		if(err){
			res.send('Error');

			return;
		}else{
			console.log("created");
			res.send('created');
		}

	})
	console.log(req.body);
	
}
function readArticle(req,res){
	var id = req.params.id;

	Article.findById(id).populate(['creator','comments.creator'])
	.exec(function(err,article){
		if(err){
			return next(err);
		}
		if(!article){
			return (new Error('Failed to load article '+id));
		}
		console.log("read article")
		
		article.hit++;

		article.save(function(err){
			if(err){
				res.send('Error');
				return;
			}
		})
		
		res.json(article);
	})

}
function updateArticle(req,res){
	Article.findById(req.params.id,function(err,article){
		if(!article){
			return res.status(400).send({message: '해당 게시물이 존재하지 않습니다.'});
		}

		article.title = req.body.title || article.title;

		article.content = req.body.content || article.content;

		/*var pathDir = path.join(__dirname,'../../../app/static/uploads/board');
	
		var coverDir = 'static/uploads/board';

		if(!fs.existsSync(pathDir)){
			fs.mkdirSync(pathDir);
		}

		var file = req.files.file;

 		console.log(req.files.file);

		var originalFilePath = "";

		if(post.cover !== ""){
			originalFilePath = pathDir + "/" + post.cover.substr(post.cover.lastIndexOf('/')+1,post.cover.length);
		}

		if(file !== undefined){
			console.log(file);
			console.log(file.name);
			console.log(file.path);
			console.log(uploadPath);

			var ext = file.name.substr(file.name.lastIndexOf('.'),file.name.length);

			var uploadFileName = uuid.v4()+ext;

	        var uploadPath = pathDir+"/"+uploadFileName;

	        post.cover = coverDir+"/"+uploadFileName;

			fs.readFile(file.path,function(err,data){
				fs.writeFile(uploadPath, data, function(err){
					fs.unlink(file.path,function(err){
						if(err){
							res.status(500);
							res.send('500 Error');
						}else{
							
						}
					})
				})
			})
		}else{
			if(req.body.cover === post.cover){
				post.cover = req.body.cover;
			}else{
				post.cover = undefined;
			}
		}
		fs.stat(originalFilePath,function(err,stat){
			if(err == null){
				fs.unlink(originalFilePath, function(err){
					if(err){
						res.status(500);
						res.send('500 Error');
					}
				})
			}
		})*/
		article.save(function(err){
			res.status(200).send("updated");
		})
	})

}
function deleteArticle(req,res){
	var id = req.params.id;
	Article.findById(id, function(err,article){
		if(!article){
			return res.status(400).send({message: "해당 게시물이 존재하지 않습니다."});
		}

		/*var originalFilePath = "";

		var pathDir = path.join(__dirname,'../../../app/static/uploads/post');
		
		if(post.cover !== "" && post.cover !== null){
			originalFilePath = pathDir + "/" + post.cover.substr(post.cover.lastIndexOf('/')+1,post.cover.length);
		}
*/
		article.remove(function(err){
			if(err){
				res.send("Error");
			}else{
				res.status(200).send("deleted");

				/*if(originalFilePath !== ""){
					fs.stat(originalFilePath,function(err,stat){
						if(err == null){
							fs.unlink(originalFilePath, function(err){
								if(err){
									res.status(500);
									res.send('500 Error');
								}
							})
						}
					})
				}*/
			}
		})
		
	})
}
function createComment(req,res){
	var newComment = req.body;

	console.log(req.body);

	Article.update({_id : req.params.id},{$push : {comments:newComment}},function(err,post){
		if(err){
			return res.send("Error");
		}
		res.status(200).send("created");
	})
}
function deleteComment(req,res){
	console.log(req.body);
	Article.update({_id:req.params.id},{$pull:{comments:{_id:req.params.commentId}}},
		function(err,board){
			if(err){
				return res.send("Error");
			}

			res.status(200).send("deleted");
		}
	)
}

function initLike(req,res){
	var like = req.body;
	console.log(like);
	Article.find({"_id":req.params.id,"likes.userId":req.body._id},function(err,board){
		if(err){
			return res.send("Error");
		}
		console.log("like 들어옴");
		console.log(board.length);
		console.log(board);
		if(board.length > 0){
			console.log("dfsfds");
			return res.status(200).send("liked");
		}

		res.status(200).send("nodata")
	})

}
function like(req,res){
	console.log(req.body);

	if(req.body.hasliked){
		Article.update({_id:req.params.id},{$pull:{likes:{userId:req.body.userId}}},
			function(err,post){
				if(err){
					return res.send("Error");
				}
				console.log("canceled");
				return res.status(200).send("canceled");
			}
		)
	}else{
		Article.update({_id : req.params.id},{$push : {likes : {userId:req.body.userId}}},function(err,post){
			if(err){
				return res.send("Error");
			}
			console.log("liked");
			return res.status(200).send("liked");
		})
	}
	
	
}
function ensureAuthenticated(req, res, next) {
  if (!req.header('Authorization')) {
    return res.status(401).send({ message: 'Please make sure your request has an Authorization header' });
  }
  var token = req.header('Authorization').split(' ')[1];

  var payload = null;
  try {
    payload = jwt.decode(token, config.TOKEN_SECRET);
  }
  catch (err) {
    return res.status(401).send({ message: err.message });
  }

  if (payload.exp <= moment().unix()) {
    return res.status(401).send({ message: 'Token has expired' });
  }
  req.user = payload.sub;
  next();
}
function getCurrentUser(req,res){
    User.findById(req.user, function(err,user){
    	console.log('Loading Current User');
        res.send(user);
    })
}


function hasAuthorization(req,res,next,id){
	if(req.board.creator.id !== req.user.id){
		return res.status(403).send({message:'해당 게시물에 대한 권한이 없습니다.'});
	}

	next();
}
