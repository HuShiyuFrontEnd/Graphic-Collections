#define PI 3.14159265359
#define PI2 6.28318530718

varying float vProgress;

varying vec3 e;
varying vec3 n;
varying vec3 vEndColor;

uniform float uTime;
uniform float uTimeReverse;
attribute vec3 aStartPosition;
attribute vec3 aEndPosition;
attribute vec3 aControlPoint1;
attribute vec3 aStartColor;
attribute vec3 aEndColor;
attribute vec3 aFaceCenter;
attribute vec4 aAxisAngle;

float easeQuadInOut(float t) {
  float p = 2.0 * t * t;
  return t < 0.5 ? p : -p + (4.0 * t) - 1.0;
}

vec3 rotateVector(vec4 q, vec3 v) {
  return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v);
}

vec4 quatFromAxisAngle(vec3 axis, float angle) {
  float halfAngle = angle * 0.5;
  return vec4(axis.xyz * sin(halfAngle), cos(halfAngle));
}

void main() {

  float tProgress = clamp(uTime, 0.0, 1.0) / 1.0;
  float tProgressReverse = clamp(uTimeReverse, 0.0, 1.0) / 1.0;

  vProgress = tProgress;
  vEndColor = aEndColor;

  vec3 objectNormal = vec3( normal );
  vec3 transformedNormal = normalMatrix * objectNormal;
  vec3 transformed = vec3( position );

  if(tProgress < 0.5) {
    transformed = mix(aStartPosition, aControlPoint1, easeQuadInOut(tProgress*2.0));

    vec4 tQuat = quatFromAxisAngle(aAxisAngle.xyz, aAxisAngle.w * easeQuadInOut((tProgress*2.0)));
    transformed = rotateVector(tQuat, transformed);
  } else {
    transformed = mix(aControlPoint1, aEndPosition, easeQuadInOut((tProgress-0.5)*2.0));

    vec4 tQuat = quatFromAxisAngle(aAxisAngle.xyz, aAxisAngle.w * easeQuadInOut((tProgressReverse*2.0)));
    transformed = rotateVector(tQuat, transformed);
  }

  e = normalize( vec3( modelViewMatrix * vec4( position, 1.0 ) ) );
  n = normalize( normalMatrix * normal );

  vec4 mvPosition = modelViewMatrix * vec4( transformed, 1.0 );
  gl_Position = projectionMatrix * mvPosition;
}
