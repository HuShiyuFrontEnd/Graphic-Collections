require('../../common/jquery.js');

let $li = $('.select-value');

$li.each(function(i, v){
    $(v).click(function(){
        if($(this).hasClass('select'))
            return false;
        $('.select').removeClass('select');
        $(v).addClass('select');
    })
})