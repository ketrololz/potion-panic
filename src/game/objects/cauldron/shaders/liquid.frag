precision highp float;
in vec2 vTextureCoord;
in vec2 vSurfaceCoord;
out vec4 finalColor;
uniform sampler2D uTexture;
uniform vec4 uInputSize;
uniform vec4 uInputClamp;
uniform vec4 uOutputFrame;
uniform float uTime;
uniform float uPadding;
uniform float uEdgeAmplitude;
uniform float uAmplitudeX;
uniform float uAmplitudeY;
uniform float uShimmer;
uniform float uBoilAmplitude;
uniform float uBoilSpeed;
uniform float uImpactAge;
uniform float uImpactDuration;
uniform float uImpactAmplitude;

void main() {
    vec2 p = (vSurfaceCoord - 0.5) * 2.0;
    float radius = length(p);
    // Keep currents active at the rim, with gentler distortion of the silhouette.
    float surface = 1.0 - smoothstep(1.05, 1.3, radius);
    float edge = smoothstep(0.55, 0.95, radius);
    float movement = mix(1.0, 0.04, edge) * surface;
    vec2 flow = vec2(
        sin(p.y * 7.0 + uTime) * cos(p.x * 4.0 - uTime * 0.6),
        cos(p.x * 6.0 - uTime * 0.8) * sin(p.y * 4.0 + uTime * 0.5)
    );
    // Staggered local bubbles keep the surface boiling between impacts.
    vec2 boiling = vec2(0.0);
    float boilLight = 0.0;
    for (int i = 0; i < 9; i++) {
        float seed = float(i);
        float cycle = uTime * uBoilSpeed + seed * 0.37;
        float phase = fract(cycle);
        float generation = floor(cycle);
        float angle = seed * 2.39996 + generation * 1.73;
        float orbit = 0.12 + 0.76 * fract(seed * 0.61 + generation * 0.27);
        vec2 center = vec2(cos(angle), sin(angle)) * orbit;
        vec2 offset = p - center;
        float distance = length(offset);
        float envelope = sin(phase * 3.14159265);
        envelope *= envelope;
        float ring = distance - (0.025 + phase * 0.3);
        float ripple = exp(-ring * ring * 650.0) * envelope;
        float dome = exp(-distance * distance * 100.0) * envelope;
        boiling += offset / max(distance, 0.001) * (ripple - dome * 0.5);
        boilLight += ripple * 0.6 + dome * 0.2;
    }
    float age = clamp(uImpactAge / uImpactDuration, 0.0, 1.0);
    float front = age * 1.5;
    float wave = sin((radius - front) * 34.0)
        * exp(-pow((radius - front) * 7.0, 2.0))
        * pow(1.0 - age, 2.0);
    vec2 direction = p / max(radius, 0.001);
    vec2 displacement = (flow * vec2(uAmplitudeX, uAmplitudeY)
        + boiling * uBoilAmplitude
        + direction * wave * uImpactAmplitude) * movement;
    float edgeWave = sin(p.x * 11.0 + p.y * 8.0 - uTime * 1.4)
        * 0.6 + sin(p.y * 15.0 - p.x * 6.0 + uTime * 1.1) * 0.4;
    displacement += direction * edgeWave * uEdgeAmplitude * edge * surface;
    vec2 uvScale = max(uOutputFrame.zw - vec2(uPadding * 2.0), vec2(1.0)) * uInputSize.zw;
    vec2 uv = clamp(vTextureCoord + displacement * uvScale, uInputClamp.xy, uInputClamp.zw);
    vec4 water = texture(uTexture, uv);
    float light = sin(p.x * 9.0 + p.y * 5.0 - uTime * 1.3)
        * cos(p.y * 8.0 + uTime * 0.7) * uShimmer
        + boilLight * uShimmer * 2.0 + wave * 0.1;
    // Sample alpha at the displaced UV too, so the water edge follows the waves.
    vec3 color = water.rgb + vec3(0.2, 0.9, 0.75) * light * surface * water.a;
    finalColor = vec4(clamp(color, vec3(0.0), vec3(water.a)), water.a);
}
