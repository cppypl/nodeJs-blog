
var express=require('express');
var router=express.Router();
var User= require('../models/User');
var Content= require('../models/Content');

//统一返回格式
var resData;
router.use(function(req,res,next){
    resData={
        code:0,
        message:''
    }
    return next();
})

//注册
router.post('/user/register',function(req,res){

    //读取views目录下指定的文件，第二个参数：传递给模板使用的数据
    var username=req.body.username;
    var password=req.body.password;
    var repassword=req.body.repassword;


    //用户名是否为空
    if(username==''){
        resData.code=1;
        resData.message="用户名不能为空";
        res.json(resData);
        return;
    }
    //密码是否为空
    if(password==''){
        resData.code=1;
        resData.message="密码不能为空";
        res.json(resData);
        return;
    }
    //密码不一致
    if(password!=repassword){
        resData.code=1;
        resData.message="密码不一致";
        res.json(resData);
        return;
    }
    //查询数据库是否已存在
    User.findOne({
        username:username
    }).then(function(userInfo){
        //没有为NULL，有则返回json
        if(userInfo){
            //表示已经被注册
            resData.code=4;
            resData.message='用户名已经被注册了';
            res.json(resData);
            return;
        }
        //保存用户名、密码到数据库
        var user=new User({
            username:username,
            password:password
        });
        return user.save();
    }).then(function (newUserInfo) {
        resData.message='注册成功';
        req.cookies.set('userinfo',JSON.stringify({
            _id:newUserInfo._id,
            username:newUserInfo.username
        }));
        res.json(resData)
    });

});

//登录
router.post('/user/login',function(req,res){
   var username=req.body.username;
   var password=req.body.password;

   if(username==''||password==''){
       resData.code=1;
       resData.message='账户名或密码不能为空';
       res.json(resData);
       return;
   }
   //查询数据库有没有用户名
    User.findOne({
        username:username,
        password:password
    }).then(function (userInfo) {
        if(!userInfo){
            resData.code=2;
            resData.message='用户名或密码错误';
            res.json(resData);
            return;
        }
        //登录成功
        resData.message='登录成功';
        resData.usercontent={
            _id:userInfo._id,
            username:username
        }
        //设置cookie
        req.cookies.set('userinfo',JSON.stringify({
            _id:userInfo._id,
            username:userInfo.username
        }),{expires:new Date(Date.now() + 900000)});
        res.json(resData);
        return;
    });


});

//退出登录
router.get('/user/logout',function (req,res) {
    req.cookies.set('userinfo',null);
    res.json(resData);
})



//评论
router.post('/comment',function (req,res) {
    var contentid=req.body.commentId || '';

    var postData={
        commentCon:req.body.commentCon,
        username:req.userinfo.username,
        postTime:new Date()
    }

    Content.findOne({
        _id:contentid
    }).then(function (content) {
        content.comments.push(postData);

        return content.save()
    }).then(function (newContent) {

        resData.message='评论成功';
        resData.username=req.userinfo.username;
        res.json(resData)
    })

})


module.exports=router;

