import * as THREE from 'https://cdn.skypack.dev/pin/three@v0.137.0-X5O2PK3x44y1WRry67Kr/mode=imports/optimized/three.js';
const EffectShader = {

    uniforms: {

        'sceneDiffuse': { value: null },
        'sceneDepth': { value: null },
        'bloomDiffuse': { value: null },
        'bloomDepth': { value: null },
        'resolution': { value: new THREE.Vector2() },
        'lightPos': { value: new THREE.Vector3() },
        'projMat': { value: new THREE.Matrix4() },
        'viewMat': { value: new THREE.Matrix4() },
        'time': { value: 0 }
    },

    vertexShader: /* glsl */ `
		varying vec2 vUv;
		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,

    fragmentShader: /* glsl */ `
		uniform sampler2D sceneDiffuse;
    uniform sampler2D sceneDepth;
    uniform sampler2D bloomDiffuse;
    uniform sampler2D bloomDepth;
    uniform vec2 resolution;
    uniform vec3 lightPos;
    uniform mat4 projMat;
    uniform mat4 viewMat;
    uniform float time;
        varying vec2 vUv;
        float seed = 0.0;
    highp float random(vec2 co)
{
    highp float a = 12.9898;
    highp float b = 78.233;
    highp float c = 43758.5453;
    highp float dt= dot(co.xy ,vec2(a,b));
    highp float sn= mod(dt,3.14);
    return fract(sin(sn) * c);
}
        float rand()
        {
            /*float result = fract(sin(seed + mod(time, 1000.0) + dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
            //_Seed += 1.0;
            seed += 1.0;
            return result;*/
            float result = random(vUv + seed / 10.0 + mod(time / 100.0, 100.0));
            seed += 1.0;
            return result;
        }
        
		void main() {
            vec4 diffuse = texture2D(sceneDiffuse, vUv);
            vec4 lightCenter = projMat * viewMat * vec4(lightPos, 1.0);
            lightCenter.xyz /= lightCenter.w;
            lightCenter.xyz = lightCenter.xyz * 0.5 + 0.5;
            float accumulate = 0.0;
            float samples =  round(95.0 + 10.0 * rand());
            float iterations = 0.0;
            for(float i = 0.0; i < samples; i++) {
              vec2 samplePos = mix(vUv, lightCenter.xy, (i / samples));
              if (texture2D(bloomDepth, samplePos).r - 0.0001 <= texture2D(sceneDepth, samplePos).r) {
              accumulate += texture2D(bloomDiffuse, samplePos).r;
              }
              iterations += 1.0;
            }
            if (iterations >= 1.0) {
              accumulate /= iterations;
          }
            gl_FragColor = vec4(mix(diffuse.rgb, vec3(1.0, 1.0, 1.0), accumulate), 1.0);
		}`

};

export { EffectShader };