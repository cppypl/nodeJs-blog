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
//封装分页方法
function pageListShow(res,page){
    var commentsList=res.comments;
    var html='';
    for(var i=0;i<commentsList.length;i++){
        html+='<li><div class="author">'+commentsList[i].username +' </div><div>'+commentsList[i].commentCon+'</div><p class="t_right">'+formatData(commentsList[i].postTime)+'</p></li>'
    }
    var pre=Math.max(page-1,1);
    var next=Math.min(parseInt(page)+1,res.pages);




    if(res.pages>1){
        $('#commentPage').html('<a href="javascript:" page="'+pre+'">上一页</a><span> '+page+' / '+res.pages+' </span><a href="javascript:" page="'+next+'">下一页</a>');
    }
    $('.commentList').html(html);
}
//格式化时间
function formatData(d) {
    var myDate = new Date(d);
    return myDate.getFullYear()+"-"+(myDate.getMonth()+1)+'-'+myDate.getDate()+' '+myDate.getHours()+':'+myDate.getMinutes()+':'+myDate.getSeconds();
}

$(function () {




    //提交评论
    $('#commentBtn').on('click',function () {
        var myDate = new Date();
        var month=(myDate.getMonth()+1) <10? '0'+(myDate.getMonth()+1):(myDate.getMonth()+1);
        var postData= myDate.getFullYear()+"-"+month+'-'+myDate.getDate()+' '+myDate.getHours()+':'+myDate.getMinutes()+':'+myDate.getSeconds();

        if($('#comment_con').val()==''){
            $('.error').html('评论不能为空。');
            return;
        }
        if($('#comment_con').val().length<5){
            $('.error').html('评论不能少于5个字。');
            return;
        }

        var strContent=getFormatCode(document.getElementById("comment_con").value)

        $.ajax({
            type:'post',
            url:'api/comment',
            data:{
                commentCon:strContent,
                commentId:$('#comment_id').val()
            },
            dataType:'json',
            success:function (res) {
                if(!res.code){
                    $('.lingshiBox').html('');
                    $('.lingshiBox,.commentList').prepend('<li><div class="author">'+res.username +' </div><div>'+strContent+'</div><p class="t_right">'+postData+'</p></li>');
                    $('#commentNum').html(parseInt($('#commentNum').html())+1);
                    $('#comment_con').val('')
                }else{
                    alert(res.message)
                }
                $('.error').html('')
            }
        });
    });





    //评论分页
    var contentId=$('#commentsId').val();
    var commentList;
    $('#commentPage').delegate('a','click',function () {
        var page=$(this).attr('page');
        $.ajax({
            url: '/views/commentsList?contentId='+ contentId+'&pageNum='+page,
            success:function (res) {
                if(!res.code){
                    pageListShow(res,page)
                }
            }
        })
    });

    //获取第一页评论
    $.ajax({
        url: '/views/commentsList?contentId='+ contentId+'&pageNum=1',
        success:function (res) {
            if(!res.code){
                pageListShow(res,1)
            }
        }
    })



});

