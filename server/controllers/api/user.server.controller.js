var express = require('express');
var router = express.Router();
var multipart = require('connect-multiparty');
var multipartyMiddleware = multipart();
var uuid = require('uuid');
var path = require('path');
var fs = require('fs');
var userService = require('../../services/user.server.service');
var User = require('../../models/user.server.model')


router.get('/currentUser',userService.ensureAuthenticated, getCurrentUser);

router.put('/currentUser',userService.ensureAuthenticated, multipartyMiddleware,updateCurrentUser);

router.post('/removeUser',userService.ensureAuthenticated, removeCurrentUser)

module.exports = router;

function getCurrentUser(req,res){
    User.findById(req.user, function(err,user){
        console.log(user);
        res.send(user);
    })
}

function updateCurrentUser(req,res){
    User.findById(req.user, '+password',function(err,user){
        if(!user){
            return res.status(400).send({message: '사용자를 찾을 수 없습니다.'})
        }

        user.displayName = req.body.displayName || user.displayName;

        var pathDir = path.join(__dirname,'../../../app/static/uploads/profile');
        
        var picDir = 'static/uploads/profile';

        if(!fs.existsSync(pathDir)){
            fs.mkdirSync(pathDir);
        }

        var file = req.files.file;

        var originalFilePath = "";

        console.log(req.files.file);

        console.log(req.body.profilePic + " 프로필");
        console.log(user.profilePic + " 현재 프로필");

        if(user.profilePic !== "/static/img/profile_default.png" || req.body.profilePic === "/static/img/profile_default.png"){
            originalFilePath = pathDir + "/" + user.profilePic.substr(user.profilePic.lastIndexOf('/')+1,user.profilePic.length);
            console.log("들어옴 1");
        }


        console.log(user.profilePic.substr(user.profilePic.lastIndexOf('/')+1,user.profilePic.length))

     /*   user.profilePic = req.body.newPic || user.profilePic;*/
        user.comparePassword(req.body.password,function(err,isMatch){
            if(req.body.password === undefined){

                return res.status(401).send({message:'패스워드를 입력해주세요'});
            }
            if(!isMatch){
                return res.status(401).send({message:'패스워드가 올바르지 않습니다.'});
            }
            if(file !== undefined){

                var ext = file.name.substr(file.name.lastIndexOf('.'),file.name.length);

                var uploadFileName = uuid.v4()+ext;
                
                var uploadPath = pathDir+"/"+uploadFileName;

                user.profilePic = picDir+"/"+uploadFileName;

                fs.readFile(file.path,function(err,data){
                    fs.writeFile(uploadPath, data, function(err){
                        fs.unlink(file.path,function(err){
                            if(err){
                                res.status(500);
                                res.send('500 Error');
                            }
                        })
                        
                    })
                })
            }else{
                if(req.body.profilePic === "/static/img/profile_default.png"){
                    console.log("들어옴 2 "+originalFilePath);
                    
                    user.profilePic = req.body.profilePic;
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
            user.save(function(err){
                res.status(200).end();
            })
        })

    })
}

function removeCurrentUser(req,res){
    if(req.body.password){
        User.findById(req.user, '+password',function(err,user){
                user.comparePassword(req.body.password,function(err,isMatch){
                    if(!isMatch){
                        return res.status(401).send({message:'패스워드가 올바르지 않습니다.'});
                    }
                     User.remove({email : req.body.email},function(err){
                        if(err){
                             return res.status(500).send(err);
                        }
                        console.log("deleted");
                        res.send("deleted");
                    })
                })
            })
    }else{
        User.remove({_id : req.body._id},function(err){
            if(err){
                return res.status(500).send(err);
            }
            console.log("deleted");
            res.send("deleted");
        })
    }
   
   
}
