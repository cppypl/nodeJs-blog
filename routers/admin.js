
var express=require('express');

var router=express.Router();

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


//链接数据库的表
var User=require('../models/User');
var Class=require('../models/Class');
var Content=require('../models/Content');
//判断是否是管理员/否则去首页
router.use(function (req,res,next) {
    if(!req.userinfo.isAdmin){
        res.send('抱歉，您不是管理员！');
        return;
    }
    next();
})

//统一返回格式
var resData;
router.use(function(req,res,next){
    resData={
        code:0,
        message:''
    }
    return next();
})



//后台首页
router.get('/',function(req,res,next){

    //读取views目录下指定的文件，第二个参数：传递给模板使用的数据
    res.render('admin/index.html',{
        userinfo:req.userinfo
    });
})

//用户管理
router.get('/user',function(req,res){

    /*limit(number)：限制获取条数  （当前页-1）*limit
    * skip(2)：忽略数据的条数
    * User.count() 数据总条数 改用countDocuments
    * */
    var page=Number(req.query.page || 1);
    var limit=20;
    var pages=0;
    User.countDocuments().then(function (count) {
        //计算总页数
        pages=Math.ceil(count/limit);
        //取值不能超过总页数pages
        page=Math.min(page,pages);
        //取值不能小于1
        page=Math.max(page,1);
        var skip=(page-1)*limit;

        //1:升序, -1 降序
        User.find().sort({_id:-1}).limit(limit).skip(skip).then(function (users) {
            res.render('admin/user_index.html',{
                userinfo:req.userinfo,
                users:users,
                count:count,
                limit:limit,
                totalPage:pages,
                page:page
            });
        });
    })
});

//分类管理
router.get('/class',function (req,res) {
    Class.countDocuments().then(function (count) {

        Class.find().sort({_id:-1}).then(function (classes) {
            res.render('admin/class_index.html',{
                userinfo:req.userinfo,
                classes:classes
            });
        });
    })
})

//分类添加
router.post('/class/add',function (req,res) {


    var classname=req.body.classname;

    //类名是否为空
    if(classname==''){
        resData.code=1;
        resData.message="分类名不能为空";
        res.json(resData);
        return;
    }
    Class.findOne({
        classname:classname
    }).then(function(rs){
        if(rs){
            //类名已存在
            resData.code=4;
            resData.message='类名已经存在';
            res.json(resData);
            return
        }

        //保存类名到数据
        var _class=new Class({
            classname:classname
        });
        return _class.save();
    }).then(function () {
        resData.message='添加成功';
        res.json(resData);
    });
});


//分类删除
router.get('/class/del',function (req,res) {
    //获取要删除的ID
    var classId=req.query.id;

    Class.deleteOne({
        _id:classId
    }).then(function (rs) {
        resData.message='删除成功'
        res.json(resData);
    })
});

//分类修改
router.get('/class_edit',function (req,res) {

    //获取要修改的ID
    var classId=req.query.id;
    Class.findOne({
        _id:classId
    }).then(function (rs) {

        if(rs){
            res.render('admin/class_edit.html',{
                userinfo:req.userinfo,
                className:rs.classname
            });
        }
    })
});

//分类修改保存
router.post('/class_edit',function (req,res) {
    //获取要保存的ID和名字
    var classId=req.body.id;
    var name=req.body.name;

    Class.findOne({
        _id:classId
    }).then(function (rs) {
        if(rs){
            if(name==rs.classname){
                resData.code=0;
                resData.message='没做任何修改';
                res.json(resData);
                return;
            }else{
                //要修改的名字已经存在,$ne是mongodb中找不同的方法
                return Class.findOne({
                    _id:{$ne:classId},
                    classname:name
                })
            }
        }else{
            resData.code=1;
            resData.message='没有找到该ID下的分类';
            res.json(resData);
        }
    }).then(function (samClass) {
        if(samClass){
            resData.code=1;
            resData.message='该名称已经存在了';
            res.json(resData);
            return;
        }else{
            return Class.updateOne({
                _id:classId
            },{
                classname:name
            })
        }
    }).then(function () {
        resData.code=0;
        resData.message='修改成功';
        res.json(resData);
    })
});

//内容首页
router.get('/content',function (req,res) {
    var page=Number(req.query.page || 1);
    var limit=20;
    var pages=0;
    Content.countDocuments().then(function (count) {
        //计算总页数
        pages=Math.ceil(count/limit);
        //取值不能超过总页数pages
        page=Math.min(page,pages);
        //取值不能小于1
        page=Math.max(page,1);
        var skip=(page-1)*limit;

        //1:升序, -1 降序
        //populate('class')关联的表
        Content.find().sort({_id:-1}).limit(limit).skip(skip).populate(['class','user']).then(function (content) {
            res.render('admin/content_index.html',{
                userinfo:req.userinfo,
                contents:content,
                count:count,
                limit:limit,
                totalPage:pages,
                page:page
            });
        });
    })
})

//内容添加页
router.get('/content/add',function (req,res) {

    Class.find().sort({_id:-1}).then(function (classList) {
        res.render('admin/content_add.html',{
            userinfo:req.userinfo,
            classList:classList
        })
    })
});


//内容提交
router.post('/content/add',function (req,res) {

    if(req.body.title==''){
        res.render('admin/tips.html',{
            userinfo:req.userinfo,
            message:'标题不能为空'
        });
        return
    }
    if(req.body.description==''){
        res.render('admin/tips.html',{
            userinfo:req.userinfo,
            message:'简介不能为空'
        });
        return
    }
    if(req.body.content==''){
        res.render('admin/tips.html',{
            userinfo:req.userinfo,
            message:'内容不能为空'
        });
        return
    }

    //保存内容到数据库
    new Content({
        class:req.body.classname,
        title:req.body.title,
        user:req.userinfo._id.toString(),
        description:getFormatCode(req.body.description),
        content:getFormatCode(req.body.content)
    }).save().then(function () {
        res.render('admin/tips.html',{
            userinfo:req.userinfo,
            message:'保存成功！'
        });
    });
});


//内容修改

router.get('/content/edit',function (req,res) {
    var id=req.query.id;
    var classNameList=[];
    Class.find().sort({_id:-1}).then(function (classList) {
        classNameList=classList;
        return Content.findOne({
            _id:id
        }).populate('class');
    }).then(function (rs) {
        if(!rs){
            res.render('admin/tips.html',{
                userinfo:req.userinfo,
                message:'指定内容不存在'
            });
        }else{
            res.render('admin/content_edit.html',{
                userinfo:req.userinfo,
                content:rs,
                classList:classNameList
            });
        }
    });
});


//保存修改内容
router.post('/content/edit',function (req,res) {
    var id=req.query.id;

    if(req.body.title==''){
        res.render('admin/tips.html',{
            userinfo:req.userinfo,
            message:'标题不能为空'
        });
        return
    }
    if(req.body.description==''){
        res.render('admin/tips.html',{
            userinfo:req.userinfo,
            message:'简介不能为空'
        });
        return
    }
    if(req.body.content==''){
        res.render('admin/tips.html',{
            userinfo:req.userinfo,
            message:'内容不能为空'
        });
        return
    }
    Content.updateOne({
        _id:id
    },{
        class:req.body.classname,
        title:req.body.title,
        description:req.body.description,
        content:req.body.content
    }).then(function (rs) {
        res.render('admin/tips.html',{
            userinfo:req.userinfo,
            message:'保存成功！'
        });
    })

});

//删除内容

router.get('/content/del',function (req,res) {
    var id= req.query.id;

    Content.deleteOne({
        _id:id
    }).then(function () {
        resData.message='删除成功'
        res.json(resData);
    })
})

module.exports=router;

