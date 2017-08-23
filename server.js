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
var forceSsl = require('force-ssl-heroku');
var app = express();

process.env.NODE_ENV = (process.env.NODE_ENV && (process.env.NODE_ENV).trim().toLowerCase() == 'production') ? 'production' : 'development';

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(express.static(path.join(__dirname,'/app')));
app.use(session({secret : config.TOKEN_SECRET,resave : false,saveUninitialized:true}));
app.use(forceSsl);

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

if(process.env.NODE_ENV == 'production'){
	console.log("production");
}else if(process.env.NODE_ENV == 'development'){
	console.log("dev");
}

console.log(process.env.NODE_ENV);

app.use('/api/users',require('./server/controllers/api/user.server.controller'));
app.use('/api/posts',require('./server/controllers/api/post.server.controller'));
app.use('/api/articles',require('./server/controllers/api/board.server.controller'));
app.use('/auth',require('./server/controllers/auth.server.controller'));

app.listen(app.get('port'), function() {
  console.log('Server Listening on port', app.get('port')); 
});
