var express = require('express');
var mongoose = require('mongoose');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

mongoose.connect(process.env.MONGODB_URI);

var Books = require('.models/books');

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.get('/books',function(req,res){
	Books.find(function(err,books){
		if(err) return res.status(500).send({error:"An Error has occured"});
		res.json(books);
	})
})

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
