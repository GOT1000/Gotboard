var express = require('express');
var router = express.Router();

router.get('/',function(req,res){

})



router.use('/',express.static('./app'));

module.exports = router;