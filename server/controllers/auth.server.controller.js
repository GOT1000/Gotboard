var express = require('express');
var router = express.Router();
var userService = require('../services/user.server.service');
var User = require('mongoose').model('User');


router.post('/login', authenticate);
router.post('/signup',signup);

module.exports = router;

function authenticate(req,res){
    User.findOne({email : req.body.email}, '+password',function(err,user){
        if(!user){
            return res.status(401).send({message:'아이디 또는 패스워드가 올바르지 않습니다.'});
        }
        user.comparePassword(req.body.password,function(err,isMatch){
            if(!isMatch){
                return res.status(401).send({message:'아이디 또는 패스워드가 올바르지 않습니다.'});
            }
            res.send({token:userService.createJWT(user)});
        })
    })
}

function  signup(req,res) {
    User.findOne({email:req.body.email},function(err,existingUser){
        if(existingUser){
            return res.status(409).send({message:'해당 이메일이 이미 등록되어 있습니다.'});
        }
        var user = new User({
            email:req.body.email,
            password : req.body.password,
            displayName : req.body.displayName
        });
        user.save(function(err,result){
            if(err){
                res.status(500).send({message: err.message});
            }
            res.send({token:userService.createJWT(result)})
        })
    })
}