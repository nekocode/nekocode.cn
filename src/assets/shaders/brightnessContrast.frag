varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform float brightness;
uniform float contrast;

void main() {
    vec4 color = texture2D(uSampler, vTextureCoord);
    color.rgb += brightness;
    if (contrast > 0.0) {
        color.rgb = (color.rgb - 0.5) / (1.0 - contrast) + 0.5;
    } else {
        color.rgb = (color.rgb - 0.5) * (1.0 + contrast) + 0.5;
    }
    gl_FragColor = color;
}