precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform float amount;

float rand(vec2 co) {
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}
void main() {
    vec4 color = texture2D(uSampler, vTextureCoord);
    
    float diff = (rand(vTextureCoord) - 0.5) * amount;
    color.r += diff;
    color.g += diff;
    color.b += diff;
    
    gl_FragColor = color;
}