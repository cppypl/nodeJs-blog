
$(function () {
    //手机菜单
    $('.menu_icon').on('click',function () {
        $('.head_nav').toggle();
        $('.heimu').show()
    });
    //改变登录框
    $('#register .change').click(function(){
        $('#login').show();
        $('#register').hide();

    });
    $('#login .change').click(function(){
        $('#login').hide();
        $('#register').show();

    });
    $('.now_class').html( $('.head_nav .active').html())
    
    $('.login_register').on('click',function () {
        $('.index_right').show();
        $('.heimu').show()
    })
    $('.heimu').on('click',function () {
        $('.index_right').hide();
        $('.heimu').hide()
        $('.head_nav').hide();
    })

    //按回车登录\注册
    $('input[name="password"]').keyup(function (ev) {
        if(ev.keyCode==13){
            $(this).next('button').click();
        }
    });
    $('input[name="repassword"]').keyup(function (ev) {
        if(ev.keyCode==13){
            $(this).next('button').click();
        }
    });

    //注册
    $('#register').find('button').on('click',function(){
        $.ajax({
            type:'post',
            url:'/api/user/register',
            data:{
                username:$('#register').find('[name="username"]').val(),
                password:$('#register').find('[name="password"]').val(),
                repassword:$('#register').find('[name="repassword"]').val(),
            },
            dataType:'json',
            success:function (res) {

                if(!res.code){
                    $('.error').html('注册成功，3秒后自动登录...');
                    setTimeout(function(){
                        window.location.reload();
                    },1000)
                }else{
                    $('.error').html(res.message);
                }
            }
        })
    });

    //登录
    $('#login').find('button').on('click',function(){
        $.ajax({
            type:'post',
            url:'/api/user/login',
            data:{
                username:$('#login').find('[name="username"]').val(),
                password:$('#login').find('[name="password"]').val()
            },
            dataType:'json',
            success:function (res) {

                if(!res.code){
                    window.location.reload()
                }else{
                    $('.error').html(res.message);
                }
            }
        })
    });
    //退出登录
    $('.logout').on('click',function(){
        $.ajax({
            url:'/api/user/logout',
            success:function (res) {
                if(!res.code){
                    window.location.reload()
                }
            }
        })
    });




});

