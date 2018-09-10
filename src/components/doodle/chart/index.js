console.log("this is main js for piece - chart in project doodle")

//maybe exsit as static code
window.onload = function(){

    setTimeout(() => {
        function turnArrayToStringInString(array){
            return array.concat().map(function(item){
                return `"${item}"`;
            });
        }

        let data = [220, 180, 190, 230, 290, 330, 310, 120, 440, 320, 90, 150];
        content.addCustomStyle('#chartLabel');
        this.setListData('bar-value', data);
        this.setListData('bar-value-string', turnArrayToStringInString(propertyList));
        doodle.setListData('bar-label',turnArrayToStringInString(['aaa', 'bbb', 'ccc', 'ddd', 'eee', 'fff', 'ggg', 'hhh', 'iii', 'jjj']));
        doodle.style.setProperty('--bar-max-value', 500);
        doodle.update();
    })
}

document.addEventListener('click', function(e) {
    doodle.update();
})