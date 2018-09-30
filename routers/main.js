
var express=require('express');

var router=express.Router();

var Class= require('../models/Class');
var Content= require('../models/Content');
var User= require('../models/User');
/*
 * 根据Value格式化为带有换行、空格格式的HTML代码
 * @param strValue {String} 需要转换的值
 * @return  {String}转换后的HTML代码
 * @example
 * getFormatCode("测\r\n\s试")  =>  “测<br/> 试”
 */
var getFormatCode=function(strValue){
    return strValue.replace(/\r\n/g, '<br/>').replace(/\n/g, '<br/>').replace(/\s/g, ' ');
}

var data;
//统一返回格式
var resData;
router.use(function(req,res,next){
    resData={
        code:0,
        message:''
    }
    return next();
})

//处理首页通用数据
router.use(function (req, res, next) {
     data={
        classList:[],
        userinfo:req.userinfo,

    };
    Class.find().then(function (rs) {
        data.classList=rs;
         next();
    });
})

//首页
router.get('/',function(req,res,next){

    data.classType=req.query.class || '';
    data.page=Number(req.query.page || 1);
    data.limit=10;
    data.pages=0;
    data.count=0;

    var where={};
    if(data.classType){
        where.class=data.classType;
    }
    Content.where(where).countDocuments().then(function (count) {
        data.count=count;
        //计算总页数
        data.pages=Math.ceil(data.count/data.limit);
        //取值不能超过总页数pages
        data.page=Math.min(data.page,data.pages);
        //取值不能小于1
        data.page=Math.max(data.page,1);
        var skip=(data.page-1)*data.limit;

        return Content.where(where).find().sort({_id:-1}).limit(data.limit).skip(skip).populate(['class','user'])

    }).then(function (contents) {

        data.contents=contents;
        res.render('main/index.html',data);
    });
});

//详情页
router.get('/views',function (req,res) {
    var contentid=req.query.contentid;
    Content.findOne({
        _id:contentid
    }).then(function (content) {
        data.content=content;
        content.views++;//阅览+1
        content.save();
        return User.findOne({ //继续查找作者
            _id:content.user
        })
    }).then( function (author) {
        data.author=author;
        res.render('main/views.html',data);
    })
});


//评论分页
router.get('/views/commentsList',function (req,res) {

    var id=req.query.contentId;
    var pageNum=req.query.pageNum;
    var limit=10;
    var start=(pageNum-1)*limit;
    var end=start+limit;
    var pages;
    Content.findOne({
        _id:id
    }).then(function (con) {
        var newCommentsList=con.comments.slice(start,end);
        resData.comments=newCommentsList;
        resData.pages=Math.ceil(con.comments.length/limit);
        resData.pageNum=pageNum;
        res.json(resData)
    })

});


//发帖页路由
router.get('/add_content',function (req,res) {

    res.render('main/content_add.html',data)

});

//发帖
router.post('/add_content',function (req,res) {


    Content.findOne({
        title:req.body.title
    }).then(function (rs) {
        if(rs){
            data.message='标题已存在！'
            res.render('main/complate.html',data);
        }else{
            //保存内容到数据库
            new Content({
                class:req.body.classname,
                title:req.body.title,
                user:req.userinfo._id.toString(),
                description:getFormatCode(req.body.description),
                content:getFormatCode(req.body.content)
            }).save().then(function () {
                data.message='恭喜您，发布成功！'
                res.render('main/complate.html',data);
            });
        }
    })
})


module.exports=router;

