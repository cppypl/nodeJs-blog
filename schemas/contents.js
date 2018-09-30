var mongoose=require('mongoose');

//内容的表结构
module.exports=new mongoose.Schema({
    //关联字段 - 内容分类的ID
    class:{
        //类型
        type: mongoose.Schema.Types.ObjectId,
        //引用
        ref:'Class'
    },
    //用户
    user:{
        //类型
        type: mongoose.Schema.Types.ObjectId,
        //引用
        ref:'user'
    },
    //添加时间
    addTime:{
        type:Date,
        default:new Date()
    },
    //阅读量
    views:{
        type:String,
        default:0
    },
    //标题
    title: String,

    //简介
    description:{
        type: String,
        default:''
    },
    //内容
    content:{
        type:String,
        default:''
    },

    //评论
    comments:{
        type:Array,
        default:[]
    }

});