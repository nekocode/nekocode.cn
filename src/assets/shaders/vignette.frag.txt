varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform float size;
uniform float amount;

void main() {
    vec4 color = texture2D(uSampler, vTextureCoord);

    float dist = distance(vTextureCoord, vec2(0.5, 0.5));
    color.rgb *= smoothstep(0.8, size * 0.799, dist * (amount + size));

    gl_FragColor = color;
}