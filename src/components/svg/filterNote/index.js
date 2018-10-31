console.log("this is main js for piece - filterNote in project svg")
//sRGB 和 linearRGB 相互转换的操作：
//https://www.zhangxinxu.com/wordpress/2017/12/linear-rgb-srgb-js-convert/
// 这里的转化使用0到1范围示意。

// LinearRGB转换为sRGB：

// var linear = xxx;  // xxx是0-1的数值
// var s;
// if (linear <= 0.0031308) {
//   s = linear * 12.92;
// } else {
//   s = 1.055 * Math.pow(linear, 1.0/2.4) - 0.055;
// }
// sRGB转换为LinearRGB：

// var s = xxx;    // xxx是0-1的数值
// var linear;
// if (s <= 0.04045) {
//   linear = s / 12.92;
// } else {
//   linear = Math.pow((s + 0.055) / 1.055, 2.4);
// }