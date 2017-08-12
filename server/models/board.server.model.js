var mongoose = require('mongoose'),
    autoIncrement = require('mongoose-auto-increment'),
    Schema = mongoose.Schema
    ;

var articleSchema = new Schema({
    title : {
        type:String,
        required : "제목을 입력하세요.",
        trim : true,
        default : ""
    },
    content : {
        type : String,
        required : "내용을 입력하세요.",
        trim : true,
        default : ""
    },
    creator : {
        type : Schema.ObjectId,
        ref : 'User'
    },
    uploadTime : {
        type : Date,
        default : Date.now
    },
    comments : [{
        creator : {type: Schema.ObjectId, ref : 'User', required: true},
        articleId : {type:String,required:true},
        content : {type:String,required:true},
        like : {type:Number,default:0},
        uploadTime : {type:Date, default:Date.now}
    }],
    likes : [{
        userId : {type:Schema.ObjectId, ref: 'User', required: true}
    }],
    hit : {
        type : Number,
        default : 0
    }
});

autoIncrement.initialize(mongoose.connection);
articleSchema.plugin(autoIncrement.plugin,{
    model : 'Article',
    field : 'numId',
    startAt : 1
});
module.exports = mongoose.model('Article',articleSchema);