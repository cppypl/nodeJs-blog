/*应用程序的启动入口文件*/

var express =require('express');

//创建APP应用,相当于http.createServer()
var app=express();
//加载模块处理模块
var swig=require('swig');
//加载数据库模块
var mongoose=require('mongoose');
//加载cookie模块
var cookies=require('cookies');
//加载body-parser,用来处理POST提交的数据
var bodyParser=require('body-parser');
var User= require('./models/User');//加载数据库
//bodyParser设置
app.use(bodyParser.urlencoded({extend:true}));

//设置静态文件托管,可以直接访问public下的文件
app.use('/public',express.static(__dirname+'/public'));

//第一个参数：模板文件的后缀，第二个参数：解析处理模板内容的方法
app.engine('html',swig.renderFile);
//注册所使用的模板引擎，第一个参数必须是views engine,第二个和app.engine的第一个参数一致
app.set('views engine','html');

//设置模板文件存放的目录，第一个必须是views
app.set('views','./views');

//设置cookie
app.use(function (req,res,next) {
    req.cookies= new cookies(req,res);

    //解析用户登录的cookie信息
    req.userinfo={};
    if(req.cookies.get('userinfo')){
        req.userinfo=JSON.parse(req.cookies.get('userinfo'));

        //获取当前登录用户的类型，是否是管理员
        User.findById(req.userinfo._id).then(function(userInfo){
            req.userinfo.isAdmin=Boolean(userInfo.isAdmin);
            next();
        })
    }else{
        next();
    }

});

//开发环境下取消缓存机制
swig.setDefaults({cache:false});





app.use('/admin',require('./routers/admin'));
app.use('/api',require('./routers/api'));
app.use('/',require('./routers/main'));

mongoose.connect('mongodb://localhost:27017/blog',{useNewUrlParser:true},function(err){
    if(err){
        console.log('数据库连接失败');
    }else{
        console.log('数据库连接成功')
        app.listen(8888);
    }
})


