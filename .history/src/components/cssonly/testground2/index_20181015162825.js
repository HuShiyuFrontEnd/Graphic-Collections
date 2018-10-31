console.log("this is main js for piece - testground2 in project cssonly")

let bars = document.querySelectorAll('.bar');

setTimeout(function(){
    for(let i = 0; i < 5;i++){
        bars[i].style.height = (100 + i * 50) + 'px';
    }
}, 1000)