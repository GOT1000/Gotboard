var express = require('express');
var router = express.Router();
var multipart = require('connect-multiparty');
var multipartyMiddleware = multipart();
var fs = require('fs');
var uuid = require('uuid');
var User = require('../../models/user.server.model');
var path = require('path');
var Post = require('../../models/post.server.model');
/*var userService = require('../../services/user.server.service');*/

router.get('/',listPost)
	  .post('/',multipartyMiddleware,createPost);
router.get('/:id',readPost)
	  .put('/:id',multipartyMiddleware,updatePost)
      .delete('/:id',deletePost);
router.post('/:id/comment',createComment)
	  .delete('/:id/comment/:commentId',deleteComment);
router.post('/:id/like',initLike)
	  .put('/:id/like',like);

module.exports = router;

function listPost(req,res){
/*	Post.find({},function(err,data){
		if(err){
			res.send('Error');
			return;
		}
		res.send(data);
	})*/
	Post.find({},[],{sort:{uploadTime: -1}}).populate(['creator','comments.creator'])
	.exec(function(err,post,next){
		if(err){
			return next(err);
		}
		res.send(post);
	})
}
function createPost(req,res){

	var file = req.files.file;

	var pathDir = path.join(__dirname,'../../../app/static/uploads/post');
	
	var coverDir = 'static/uploads/post';

	if(!fs.existsSync(pathDir)){
		fs.mkdirSync(pathDir);
	}

	if(file !== undefined){
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
	}

	var post = new Post(req.body);


	post.save(function(err){
		if(err){
			res.send('Error');

			return;
		}else{
			res.send('created');
		}

	})
	console.log(req.body);
	
}
function readPost(req,res){
	var id = req.params.id;

	Post.findById(id).populate(['creator','comments.creator'])
	.exec(function(err,post){
		if(err){
			return next(err);
		}
		if(!post){
			return (new Error('Failed to load post '+id));
		}
		console.log("read post")
		
		post.hit++;

		post.save(function(err){
			if(err){
				res.send('Error');
				return;
			}
		})
		
		res.json(post);
	})

}
function updatePost(req,res){
	Post.findById(req.params.id,function(err,post){
		if(!post){
			return res.status(400).send({message: '해당 게시물이 존재하지 않습니다.'});
		}

		post.title = req.body.title || post.title;

		post.content = req.body.content || post.content;

		var pathDir = path.join(__dirname,'../../../app/static/uploads/post');
	
		var coverDir = 'static/uploads/post';

		if(!fs.existsSync(pathDir)){
			fs.mkdirSync(pathDir);
		}

		var file = req.files.file;

 		console.log(req.files.file);

 		console.log(req.body.cover);

 		console.log(post.cover);
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
		})
		post.save(function(err){
			res.status(200).send("updated");
		})
	})

}
function deletePost(req,res){
	var id = req.params.id;
	Post.findById(id, function(err,post){
		if(!post){
			return res.status(400).send({message: "해당 게시물이 존재하지 않습니다."});
		}

		var originalFilePath = "";

		var pathDir = path.join(__dirname,'../../../app/static/uploads/post');
		
		if(post.cover !== "" && post.cover !== null){
			originalFilePath = pathDir + "/" + post.cover.substr(post.cover.lastIndexOf('/')+1,post.cover.length);
		}

		post.remove(function(err){
			if(err){
				res.send("Error");
			}else{
				res.status(200).send("deleted");

				if(originalFilePath !== ""){
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
				}
			}
		})
		
	})
}
function createComment(req,res){
	var newComment = req.body;

	console.log(req.body);

	Post.update({_id : req.params.id},{$push : {comments:newComment}},function(err,post){
		if(err){
			return res.send("Error");
		}
		res.status(200).send("created");
	})
}
function deleteComment(req,res){
	console.log(req.body);
	Post.update({_id:req.params.id},{$pull:{comments:{_id:req.params.commentId}}},
		function(err,post){
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
	Post.find({"_id":req.params.id,"likes.userId":req.body._id},function(err,post){
		if(err){
			return res.send("Error");
		}
		console.log("like 들어옴");
		console.log(post.length);
		console.log(post);
		if(post.length > 0){
			console.log("dfsfds");
			return res.status(200).send("liked");
		}

		res.status(200).send("nodata")
	})

}
function like(req,res){
	console.log(req.body);

	if(req.body.hasliked){
		Post.update({_id:req.params.id},{$pull:{likes:{userId:req.body.userId}}},
			function(err,post){
				if(err){
					return res.send("Error");
				}
				console.log("canceled");
				return res.status(200).send("canceled");
			}
		)
	}else{
		Post.update({_id : req.params.id},{$push : {likes : {userId:req.body.userId}}},function(err,post){
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
	if(req.post.creator.id !== req.user.id){
		return res.status(403).send({message:'해당 게시물에 대한 권한이 없습니다.'});
	}

	next();
}
