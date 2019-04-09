uniform sampler2D tMatCap;

varying vec3 e;
varying vec3 n;
varying float vProgress;
varying vec3 vEndColor;

void main() {

  vec3 r = reflect( e, n );
  float m = 2.8284271247461903 * sqrt( r.z + 2. );
  vec2 vN = r.xy / m + .5;

  vec3 base = texture2D( tMatCap, vN ).rgb;

  vec3 tdfColor = mix(base, vEndColor, vProgress);

  gl_FragColor = vec4( tdfColor, 1. );
}
