//数据库model
var mongoose=require('mongoose');

var classSchema = require('../schemas/class');

module.exports = mongoose.model('Class',classSchema);