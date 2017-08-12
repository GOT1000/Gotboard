var mongoose = require('mongoose'),
    Schema = mongoose.Schema
    ;

var postSchema = new Schema({
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
    cover : {
        type : String,
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
        postId : {type:String,required:true},
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


module.exports = mongoose.model('Post',postSchema);