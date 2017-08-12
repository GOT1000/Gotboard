require('rootpath')();
var path = require('path');
var express = require('express');
var app = express();
var cors = require('cors');
var logger = require('morgan');
var session = require('express-session');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var expressJwt = require('express-jwt');
var config = require('./config');
var mongoose = require('mongoose');
var cool = require('cool-ascii-faces');
var app = express();

app.set('port', (process.env.PORT || 3000));

app.use(express.static(__dirname + '/public'));
app.use(logger('dev'));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(express.static(path.join(__dirname,'/app')));
app.use(session({secret : config.TOKEN_SECRET,resave : false,saveUninitialized:true}));

mongoose.connect(config.MONGODB);
mongoose.connection.on('error',function(err){
    console.log('Error : mongod 커맨드를 입력했나요?')
});

app.get('/cool',function(req,res){
	res.send(cool());
})

if(app.get('env') === 'production'){
    app.use(function(req,res,next){
        var protocol = req.get('x-forwarded-proto');
        protocol == 'https' ? next() : res.redirect('https://'+req.hostname + req.url);
    })
}



app.listen(app.get('port'), function() {
  console.log('Server Listening on port', app.get('port'));
});
