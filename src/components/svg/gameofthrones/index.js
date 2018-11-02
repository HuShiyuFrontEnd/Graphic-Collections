//仿自https://codepen.io/Cedrick/pen/zaqeLz
console.log("this is main js for piece - gameofthrones in project svg")

import $ from 'jquery';
import imgData from './data.js';
let {
    TweenMax, TimelineMax, Power0, Power3, Power4
} = require('../../gsap/lib/tweenmax.1.18.js');
let SplitText = require('../../gsap/lib/splitText.min.js'); // 这个插件是收费的

// Variables globales
var carouselMasterTl = null;
var carouselItemIsHover = false;
var carouselItemPauseDuration = 2;
// var imgDataString = "";
// var imgData = {};

// **** Initialisation des fonctions **** //
$(function () { 
	carousel3dFx();
	// getImgData(function(response){
	// 	imgDataString = response.replace(/"/g, "\\\"").replace(/'/g, "\"");
	// 	imgData = JSON.parse(imgDataString);
	carouselSlider();
	// });
});
// ************************************** //

// function getImgData(callback){
// 	$.ajax({
// 		type: "GET",
// 		dataType: "text",
// 		url: "https://gist.githubusercontent.com/Cedrickdai/b0bce8279dacfe336ccad3bf72285500/raw/8262dd18744abd0e63f1f07e63e283037b23df1f/codepen-GoT-imgData.txt",
// 		success: callback,
// 		error: function(response){console.log("error");}
// 	});
// }

function carousel3dFx(){
	var el = $("#bg .inner, .item .inner");
	$(document).on("mousemove",function(e) {
		var ax = -($("#hero").innerWidth()/2- e.pageX)/35;
		var ay = ($("#hero").innerHeight()/2- e.pageY)/25;
		el.removeClass("reset").attr("style", "transform: rotateY("+ax+"deg) rotateX("+ay+"deg);-webkit-transform: rotateY("+ax+"deg) rotateX("+ay+"deg);-moz-transform: rotateY("+ax+"deg) rotateX("+ay+"deg)");
	})
	.on("mouseout",function(e) { 
		el.addClass("reset");
	});
}
function carouselSlider(){
	carouselMasterTl = new TimelineMax({repeat: -1});

	// $("#carousel .item").hover(function(){carouselItemIsHover = true;},function(){carouselItemIsHover = false; carouselMasterTl.resume();});

	$("#carousel").parent().append('<div id="carousel-nav"></div><div id="carousel-wp"></div>');

	$("#carousel .item").each(function(i){
		var thisId = $(this).attr("id");
		// console.log(thisId);
		var splitText = new SplitText("#"+thisId+" .txt", {type:"chars"});
		var line1Chars = $("#"+thisId+" .txt .line-1 div");
		var line1EvenChars = getEvenInArray(line1Chars);
		var line1OddChars = getOddInArray(line1Chars);
		var introTimeline = getIntroTimeline(thisId, line1OddChars, line1EvenChars);
		var outroTimeline = getOutroTimeline(thisId);

		carouselMasterTl.add(introTimeline, "intro-"+ thisId);

		carouselMasterTl.add(outroTimeline, "outro-"+ thisId);

		if(imgData[thisId]){
			$(this).find(".blazon").html(thisId +imgData[thisId].blazon);
			$(this).find(".blazon-shadow").html(thisId +imgData[thisId].shadow);
			$("#carousel-wp").append('<img id="wp-'+ thisId +'" src="'+ imgData[thisId].wp +'"></img>');
			$("#carousel-nav").append('<button id="goto-'+ thisId +'">'+ imgData[thisId].icon +'</button>');
		}
		else{
			$("#carousel-nav").append('<button id="goto-'+ thisId +'">'+thisId+'</button>');
		}


		$("#goto-"+ thisId).click(function(){
			carouselMasterTl.seek("intro-"+ thisId);
		});

	});
}

function getEvenInArray(a) {
	var ar = [];
	for (var i = 0; i < a.length; i++) {
      if(i % 2 === 0) { // index is even
      	ar.push(a[i]);
      }
  }
  return ar;
}
function getOddInArray(a) {
	var ar = [];
	for (var i = 0; i < a.length; i++) {
      if(i % 2 === 1) { // index is even
      	ar.push(a[i]);
      }
  }
  return ar;
}

function getIntroTimeline(thisId, line1OddChars, line1EvenChars){
	var introTl = new TimelineMax();

	introTl.eventCallback("onStart", function(){
		$("#carousel-nav button").removeClass("active");
		$("#carousel-nav button#goto-"+ thisId).addClass("active");
		$("#carousel-wp img").removeClass("active");
		$("#carousel-wp img#wp-"+ thisId).addClass("active");

		$("#hero").removeClass("arryn baratheon greyjoy lannister stark targaryen tully martell tyrell");
		$("#hero").addClass(thisId);
	});

	introTl.eventCallback("onComplete", function(){
		if (carouselItemIsHover) {
			carouselMasterTl.pause();
		}
	});

	function getStaggerline1(line1OddChars, line1EvenChars){
		var tl = new TimelineMax();

		tl.staggerFrom(line1OddChars, 1.4, {
			opacity: 0,
			scale: 5,
			y: "+=200",
			ease: Power4.easeOut,
			// delay: 0.2,
		}, 0.2)
		.staggerFrom(line1EvenChars, 0.8, {
			opacity: 0,
			y: "-=180",
			scale: 2,
			ease: Power4.easeOut,
		}, 0.2, 0);

		return tl;
	}

	introTl.set($("#"+ thisId), {
		opacity: 1,
		visibility: "visible",
	})
	.from($("#"+ thisId +" .img .blazon"), 1, {
		opacity: 0,
		y: "-=250",
		scale: 0.4,
		rotationX: "+=50deg",
		ease: Power4.easeOut,
	})
	.from($("#"+ thisId +" .img .blazon-shadow"), 0.8, {
		opacity: 0,
		y: "-=100",
		scale: 0.7,
		ease: Power4.easeOut,
	}, "-=0.8")
	.from($("#"+ thisId +" .txt .line-2"), 1.6, {
		opacity: 0,
		scale: 0.3,
		y: "+=150",
		rotationX: "-=50deg",
		ease: Power4.easeOut,
	}, "-=0.8")
	.add(getStaggerline1(line1OddChars, line1EvenChars))
	.set({}, {}, "+="+ (carouselItemPauseDuration || 3));
	return introTl;
}

function getOutroTimeline(thisId){
	var outroTl = new TimelineMax();

	outroTl.to($("#"+ thisId +" .txt .line-2"), 0.6, {
		opacity: 0,
		y: "+=80",
		rotationX: "-=50deg",
		ease: Power3.easeIn,
	})
	.to($("#"+ thisId +" .txt .line-1"), 0.6, {
		opacity: 0,
		y: "+=80",
		rotationX: "-=20deg",
		ease: Power3.easeIn,
	}, "-=0.4")
	.to($("#"+ thisId +" .img .blazon-shadow"), 0.5, {
		opacity: 0,
		ease: Power3.easeIn,
	}, "-=0.7")
	.to($("#"+ thisId +" .img .blazon"), 1, {
		y: "+=500",
		scale: 0.8,
		rotationX: "-=50deg",
		ease: Power3.easeIn,
	}, "-=0.4")
	.to($("#"+ thisId +" .img .blazon"), 0.4, {
		opacity: 0,
		ease: Power0.easeNone,
	}, "-=0.5")
	.set($("#"+ thisId), {
		opacity: 0,
		visibility: "hidden",
	});
	return outroTl;
}