$(function () {
    $('.ucenter_bottom .head li').on('click',function () {
        var index=$('.ucenter_bottom .head li').index(this);
        $(this).addClass('active').siblings().removeClass();
        $('.ucenter_bottom .content').hide();
        $('.ucenter_bottom .content').eq(index).show()
    });
});
