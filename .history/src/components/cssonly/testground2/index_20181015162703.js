console.log("this is main js for piece - testground2 in project cssonly")

let bars = document.querySelectorAll('.bar');

for(let i = 0; i < 5;i++){
    bars[i].style.height = i * 100 + 'px';
}