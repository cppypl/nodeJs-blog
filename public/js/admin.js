$(function () {

    //添加分类弹框
    $('.addClass').click(function(){
        $('.addClassBox').show();
        $('.heimu').show();

    });
    $('.heimu').click(function(){
        $('.addClassBox').hide();
        $('.heimu').hide();

    });

    //添加分类
    $('.addClassBox .add').on('click',function(){
        $.ajax({
            type:'post',
            url:'/admin/class/add',
            data:{
                classname:$('.addClassBox').find('[name="classname"]').val()
            },
            dataType:'json',
            success:function (res) {
                if(!res.code){
                    alert(res.message);
                    window.location.reload();
                }else {
                    alert(res.message);
                }
            }
        })
    });

    //删除分类
    $('.del').on('click',function () {
        if(confirm('确认删除?')){
            $.ajax({
                url:'/admin/class/del?id='+$(this).attr('id'),
                success:function (res) {
                    window.location.reload()
                }
            });
        }
    });

    //修改分类


    $('.editBtn').on('click',function () {
        var id=window.location.href.split('=');
        $.ajax({
            type: 'post',
            url:'/admin/class_edit',
            data: {
                id:id[1],
                name:$('.editName').val()
            },
            dataType: 'json',
            success:function (res) {

                    alert(res.message)

            }
        })
    })


    //删除文章
    $('.delContent').on('click',function () {
        if(confirm('确认删除?')){
            $.ajax({
                url:'/admin/content/del?id='+$(this).attr('id'),
                success:function (res) {
                    if(!res.code){
                        window.location.reload()
                    }
                }
            });
        }
    });


});