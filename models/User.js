//数据库model
var mongoose=require('mongoose');

var userSchema = require('../schemas/users');

module.exports = mongoose.model('user',userSchema);  //取名为user