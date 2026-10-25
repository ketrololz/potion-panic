precision highp float;
in vec2 aPosition;
out vec2 vTextureCoord;
out vec2 vSurfaceCoord;
uniform vec4 uInputSize;
uniform vec4 uOutputFrame;
uniform vec4 uOutputTexture;
uniform float uPadding;
void main() {
    vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;
    position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0 * uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;
    gl_Position = vec4(position, 0.0, 1.0);
    vTextureCoord = aPosition * (uOutputFrame.zw * uInputSize.zw);
    vSurfaceCoord = (aPosition * uOutputFrame.zw - vec2(uPadding))
        / max(uOutputFrame.zw - vec2(uPadding * 2.0), vec2(1.0));
}
