var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var bookSchema = new Schema({
	title : String,
	author : String,
	price : Number
});

module.exports = mongoose.model('books',bookSchema);