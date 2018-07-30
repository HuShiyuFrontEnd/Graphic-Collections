顶点着色器的工作，主要是生成裁剪控件坐标值
顶点着色器的数据，主要有以下三种新式：
Attributes 属性，从缓冲中获取的数据
Uniforms 全局变量，在一次绘制中，对所有顶点保持一致值
Textures 纹理，从像素或者纹理元素中获取的数据

Attributes 常用数据类型float vec2~4 mat2~4（方阵）
Uniform float vec2~4(uniform[i]fv/uniform[i]f) mat2~4(uniformMatrix[i]fv)
        f换成i 变成int
        uniform1i /v sampler2D（texture）
        samplerCube

一个数组可以一次性设置所有的全局变量，例如：
uniform vec2 u_someVec2[3];

//js
var someVec2Loc = gl.getUniformLocation(someProgram, 'u_someVec2');

gl.uniform2fv(someVec2Loc, [1,2,3,4,5,6]);

//若要单独设置，则需要单独为其找到地址

var someVec2LocEle1 = gl.getUniformLocation(someProgram, 'u_someVec2[0]');

//对于一个结构体
struct SomeStruct{
    bool active;
    vec2 someVec2;
}
uniform SomeStruct u_someThing;

var someThingActiveLoc = gl.getUniformLocation(someProgram, 'u_someThing.active');

片断着色器（也有叫做 片元着色器）的主要工作是为当前的光栅化的像素提供颜色值
每个像素都将调用一次片元着色器
片元着色器所需的数据，主要通过以下三种方式获取 全局变量（Uniform） 纹理（Texture） Varyings（可变量）

在着色器中获取纹理信息，可以先创建一个sampler2D类型的全局变量，然后用GLSL方法texture2D从中获取信息
关于纹理：从纹理中获取数据，取决于很多设置，例如
var tex = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, tex);
var level = 0;
var width = 2;
var height = 1;
var data = new Uint8Array([
    255, 0, 0, 255,
    0, 255, 0 ,255,
]);
gl.texImage2D(gl.TEXTURE_2D, level, gl.RGBA, width, height, 0, gl.RGBA, gl.UNISIGNED_BYTE,data);
在初始化时，找到全局变量的地址：
var someSamplerLoc = gl.getUniformLocation(someProgram, "u_texture");
在渲染的时候，WebGL要求纹理必须绑定到一个纹理单元上
var unit = 5;
gl.activeTexture(gl.TEXTURE_2D, tex);
gl.bindTexture(gl.TEXTURE_2D, tex);
然后告诉着色器你要使用的纹理在哪个纹理单元
gl.uniform1i(someSamplerLoc, unit);
Varyings 可变量是一种顶点着色器给片元着色器传值的方式，使用时，两个着色器要定义相同的varying变量

GLSL Graphics Library Shader Language 图形库着色器语言
常见的类型 vec2~4 mat2~4
对于一个 vec4 v; 一下四种表达方式是等价的：
v.x/y/z/w v.s/t/p/q v.r/g/b/a v[0~4]
还支持矢量调制，例如 v.yyyy 等价于 vec4(v.y, v.y, v.y, v.y);
vec4(1) 等价于 vec4(1, 1, 1, 1);
需要注意的是，GLSL是一个强类型的语言
float a = 1;//错误
float f = 1.0;//正确
float f = float(1);//正确
而之前的vec4方法中使用1，则不会报错，该方法内置了类型转换
GLSL有一系列的内置方法，其中大多数支持多种数据类型，并且可以一次运算多个分量，例如：
T sin(T angle)
vec4 s = sin(v);等价于 vec4 s = vec4(sin(v.x), sin(v.y), sin(v.z), sin(v.w))
vec4 m = mix(v1, v2, f);等价于 
vec4 m = vec4(
    mix(v1.x, v2.x, f),
    mix(v1.y, v2.y, f),
    mix(v1.z, v2.z, f),
    mix(v1.w, v2.w, f));
mix(x,y,a) 对x,y做线性混合 结果是 x * (1-a) + y * a