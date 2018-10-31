console.log("this is main js for piece - pointcollector in project cssonly")
require('../../common/jquery.js');

//点采集器
let points = {},
    currentName = '',
    current = null,
    $uploader = $('#uploader'),
    $uploaderFace = $('#uploaderFace'),
    $add = $('#addBranch'),
    $output = $('#output'),
    img = $('img');

$uploaderFace.on('click', function(e){
    $uploader.click();
})
$uploader.on('change', function(e){
    let imgUrl = window.URL.createObjectURL(e.target.files[0]);

    img[0].src = imgUrl;
    img.addClass('show');
    setTimeout(function(){img.addClass('visible');});
});
$add.on('click', function(){
    let name = $('#branchName').val();
    if(!name) return false;
    if(current) points[currentName] = current;
    currentName = name, current = [];
    $('#branchName').val('');
});
img.on('click', function(e){
    if(!current) return false;
    current.push([e.offsetX, e.offsetY]);
})
$output.on('click', function(){
    if(current){
        points[currentName] = current;
        current = null;
    }
    console.log(JSON.stringify(points));
})

