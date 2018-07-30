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
