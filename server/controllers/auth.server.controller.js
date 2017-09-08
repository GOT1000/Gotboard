var express = require('express');
var router = express.Router();
var userService = require('../services/user.server.service');
var User = require('mongoose').model('User');
var config = require('../../config.js');
var request = require('request');
var userService = require('../services/user.server.service');
var jwt = require('jwt-simple');

router.post('/login', authenticate);
router.post('/signup',signup);
router.get('/login',login);
router.post('/facebook',signupWithFacebook);
router.post('/google',signupWithGoogle);

module.exports = router;

function login(req,res){
    console.log(req.body);
    res.send(req.body);
}
function authenticate(req,res){
    User.findOne({email : req.body.email}, '+password',function(err,user){
        if(!user){
            return res.status(401).send({message:'아이디 또는 패스워드가 올바르지 않습니다.'});
        }
        user.comparePassword(req.body.password,function(err,isMatch){
            if(!isMatch){
                return res.status(401).send({message:'아이디 또는 패스워드가 올바르지 않습니다.'});
            }
            console.log(userService.createJWT(user));
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

function signupWithFacebook(req,res){
    console.log("facebook 들어옴")
     var fields = ['id', 'email', 'first_name', 'last_name', 'link', 'name'];
  var accessTokenUrl = 'https://graph.facebook.com/v2.5/oauth/access_token';
  var graphApiUrl = 'https://graph.facebook.com/v2.5/me?fields=' + fields.join(',');
  var params = {
    code: req.body.code,
    client_id: req.body.clientId,
    client_secret: config.FACEBOOK_SECRET,
    redirect_uri: req.body.redirectUri
  };

  // Step 1. Exchange authorization code for access token.
  request.get({ url: accessTokenUrl, qs: params, json: true }, function(err, response, accessToken) {
    if (response.statusCode !== 200) {
      return res.status(500).send({ message: accessToken.error.message });
    }

    // Step 2. Retrieve profile information about the current user.
    request.get({ url: graphApiUrl, qs: accessToken, json: true }, function(err, response, profile) {
      if (response.statusCode !== 200) {
        return res.status(500).send({ message: profile.error.message });
      }
      if (req.header('Authorization')) {
        User.findOne({ facebook: profile.id }, function(err, existingUser) {
          if (existingUser) {
            return res.status(409).send({ message: 'There is already a Facebook account that belongs to you' });
          }
          var token = req.header('Authorization').split(' ')[1];
          var payload = jwt.decode(token, config.TOKEN_SECRET);
          User.findById(payload.sub, function(err, user) {
            if (!user) {
              return res.status(400).send({ message: 'User not found' });
            }
            user.facebook = profile.id;
            user.picture = user.picture || 'https://graph.facebook.com/v2.3/' + profile.id + '/picture?type=large';
            user.displayName = user.displayName || profile.name;
            user.save(function() {
              var token = createJWT(user);
              res.send({ token: token });
            });
          });
        });
      } else {
        // Step 3. Create a new user account or return an existing one.
        User.findOne({ facebook: profile.id }, function(err, existingUser) {
          if (existingUser) {
            var token = createJWT(existingUser);
            return res.send({ token: token });
          }
          var user = new User();
          user.facebook = profile.id;
          user.profilePic = 'https://graph.facebook.com/' + profile.id + '/picture?type=large';
          user.displayName = profile.name;
          user.email = profile.email;
          console.log(user);
          user.save(function() {
            console.log('3들어옴')
            var token = userService.createJWT(user);
            res.send({ token: token,user:user });
          });
        });
      }
    });
  });
}

function signupWithGoogle(req,res){
    console.log("google 들어옴")
  var accessTokenUrl = 'https://accounts.google.com/o/oauth2/token';
  var peopleApiUrl = 'https://www.googleapis.com/plus/v1/people/me/openIdConnect';
  var params = {
    code: req.body.code,
    client_id: req.body.clientId,
    client_secret: config.GOOGLE_SECRET,
    redirect_uri: req.body.redirectUri,
    grant_type: 'authorization_code'
  };

  // Step 1. Exchange authorization code for access token.
  request.post(accessTokenUrl, { json: true, form: params }, function(err, response, token) {
    console.log("1 들어옴");
    var accessToken = token.access_token;
    var headers = { Authorization: 'Bearer ' + accessToken };

    // Step 2. Retrieve profile information about the current user.
    request.get({ url: peopleApiUrl, headers: headers, json: true }, function(err, response, profile) {
      if (profile.error) {
        return res.status(500).send({message: profile.error.message});
      }
      // Step 3a. Link user accounts.
      if (req.header('Authorization')) {
        User.findOne({ google: profile.sub }, function(err, existingUser) {
          if (existingUser) {
            return res.status(409).send({ message: 'There is already a Google account that belongs to you' });
          }
          var token = req.header('Authorization').split(' ')[1];
          var payload = jwt.decode(token, config.TOKEN_SECRET);
          User.findById(payload.sub, function(err, user) {
            if (!user) {
              return res.status(400).send({ message: 'User not found' });
            }
            user.google = profile.sub;
            user.picture = user.picture || profile.picture.replace('sz=50', 'sz=200');
            user.displayName = user.displayName || profile.name;
            user.save(function() {
              var token = createJWT(user);
              res.send({ token: token });
            });
          });
        });
      } else {
        // Step 3b. Create a new user account or return an existing one.
        User.findOne({ google: profile.sub }, function(err, existingUser) {
          if (existingUser) {
            return res.send({ token: createJWT(existingUser) });
          }
          var user = new User();
          user.google = profile.sub;
          user.profilePic = profile.picture.replace('sz=50', 'sz=200');
          user.displayName = profile.name;
          user.save(function(err) {
            console.log(userService.createJWT(user));
            console.log("들어옴")
            var token = userService.createJWT(user);
            res.send({ token: token });
          });
        });
      }
    });
  });
}