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
//加载数据库
var User= require('./models/User');


//加载百度富文本框
var ueditor = require("ueditor");
//加载body-parser,用来处理POST提交的数据
var bodyParser=require('body-parser');
//bodyParser设置
app.use(bodyParser.urlencoded({extend:true}));
app.use(bodyParser.json());
//加载PATH模块
var path= require('path');

app.use("/ueditor/ue", ueditor(path.join(__dirname, 'public'), function(req, res, next) {
    // ueditor 客户发起上传图片请求
    if(req.query.action === 'uploadimage'){
        // 这里你可以获得上传图片的信息
        var foo = req.ueditor;
        console.log(foo.filename); // exp.png
        console.log(foo.encoding); // 7bit
        console.log(foo.mimetype); // image/png

        // 下面填写你要把图片保存到的路径 （ 以 path.join(__dirname, 'public') 作为根路径）
        var img_url = '/images/ueditor';
        res.ue_up(img_url); //你只要输入要保存的地址 。保存操作交给ueditor来做
    }
    //  客户端发起图片列表请求
    else if (req.query.action === 'listimage'){
        var dir_url = '/images/ueditor'; // 要展示给客户端的文件夹路径
        res.ue_list(dir_url) // 客户端会列出 dir_url 目录下的所有图片
    }
    // 客户端发起其它请求
    else {

        res.setHeader('Content-Type', 'application/json');
        // 这里填写 ueditor.config.json 这个文件的路径
        res.redirect('/ueditor/ueditor.config.json')
    }}));

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
        app.listen(80);
    }
})