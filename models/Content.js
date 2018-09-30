//数据库model
var mongoose=require('mongoose');

var contentsSchema = require('../schemas/contents');

module.exports = mongoose.model('Content',contentsSchema);