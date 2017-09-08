var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcryptjs')
    ;

var userSchema = new Schema({
    email : {type : String, unique : true, lowercase: true,required:true,trim:true},
    password : {type : String, select : false,trim:true},
    displayName : {type:String,required:true},
    level : {type:String,default:"guest"},
    joinTime : {type:Date, default:Date.now()},
    profilePic : {type:String,default:"/static/img/profile_default.png"},
    facebook : String,
    google : String
});

userSchema.pre('save',function(next){
    var user = this;
    if(!user.isModified('password')){
        return next();
    }
    bcrypt.genSalt(10,function(err,salt){
        bcrypt.hash(user.password, salt, function(err,hash){
            user.password = hash;
            next();
        });
    });
});

userSchema.methods.comparePassword = function(password,done){
    bcrypt.compare(password, this.password, function(err,isMatch){
        done(err, isMatch);
    });
};

module.exports = mongoose.model('User',userSchema);