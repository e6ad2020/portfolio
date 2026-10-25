precision highp float;

uniform sampler2D uColor;
uniform sampler2D uDepth;
uniform vec2 uPointer;       // Normalized [-1, 1] smoothed mouse/gyro
uniform float uStrength;     // Parallax displacement intensity (0.042)
uniform float uFocus;        // Focal plane depth (0.65)
uniform float uExposure;     // Exposure multiplier (0.95)
uniform float uRim;          // Dynamic rim strength (0.9)
uniform vec3 uRimColorWarm;  // Amber accent (#ff5500)
uniform vec3 uRimColorCool;  // Cyan accent (#00d2ff)
uniform float uReveal;       // Intro reveal 0.0 -> 1.0
uniform float uTime;         // Time for subtle idle breathing

varying vec2 vUv;

void main() {
  vec2 uv = vUv;

  // Gentle organic breathing drift with edge boundary safety
  vec2 breathing = vec2(sin(uTime * 0.7) * 0.0012, cos(uTime * 0.5) * 0.0016);
  vec2 ptr = clamp(uPointer + breathing, vec2(-0.88), vec2(0.88));

  // Stable silhouette: the feathered cutout alpha is read at the UNDISPLACED uv,
  // so the outline never moves, tears, or breaks into fragments at max tilt.
  vec4 baseSample = texture2D(uColor, uv);
  if (baseSample.a < 0.004) {
    discard;
  }

  // Depth texture: R = depth, A = wide blurred subject mask (~0.5 on the outline, 1.0 deep inside)
  vec4 depthSample = texture2D(uDepth, uv);
  float rawDepth = depthSample.r;

  // Interior weight: parallax fades smoothly to zero over a wide band inside the outline,
  // so displaced lookups near the edge can never reach outside the subject.
  float edgeWeight = smoothstep(0.5, 0.95, depthSample.a) * smoothstep(0.02, 0.14, rawDepth);

  // Parallax displacement with isotropic aspect ratio correction (1536 / 1024 = 1.5)
  // Ensures horizontal displacement in pixels matches vertical displacement 1:1,
  // completely eliminating oval face stretching on mobile screens.
  vec2 aspectCorrection = vec2(1.0 / 1.5, 1.0);
  vec2 parallaxOffset = ptr * aspectCorrection * (rawDepth - uFocus) * uStrength * edgeWeight;
  vec2 sampleUv = clamp(uv + parallaxOffset, vec2(0.001), vec2(0.999));

  // Secondary depth sample with boundary clamp to prevent angular creases and edge tearing
  vec4 refinedSample = texture2D(uDepth, sampleUv);
  float depthDelta = clamp(refinedSample.r - rawDepth, -0.08, 0.08);
  float refinedDepth = rawDepth + depthDelta * smoothstep(0.5, 0.95, refinedSample.a);
  vec2 refinedOffset = ptr * aspectCorrection * (refinedDepth - uFocus) * uStrength * edgeWeight;
  vec2 finalSampleUv = clamp(uv + refinedOffset, vec2(0.001), vec2(0.999));

  // Sample portrait at displaced coordinates; if that lookup lands outside the subject,
  // fall back to the undisplaced pixel instead of punching a hole.
  vec4 colorSample = texture2D(uColor, finalSampleUv);
  vec3 photo = mix(baseSample.rgb, colorSample.rgb, smoothstep(0.2, 0.9, colorSample.a));

  vec3 baseColor = photo * uExposure;

  // Soft highlight compression:
  // Tames harsh blown-out whites in the studio hair/backlight for a rich cinematic grade
  float photoLuma = max(baseColor.r, max(baseColor.g, baseColor.b));
  float highlightBurn = smoothstep(0.68, 0.98, photoLuma);
  baseColor -= baseColor * highlightBurn * 0.18;

  // --- Volumetric 3D Normal Reconstruction from Depth with Boundary Safeguards ---
  vec2 texel = vec2(1.0 / 768.0, 1.0 / 512.0) * 1.5;
  vec2 uvL = clamp(finalSampleUv - vec2(texel.x, 0.0), vec2(0.002), vec2(0.998));
  vec2 uvR = clamp(finalSampleUv + vec2(texel.x, 0.0), vec2(0.002), vec2(0.998));
  vec2 uvD = clamp(finalSampleUv - vec2(0.0, texel.y), vec2(0.002), vec2(0.998));
  vec2 uvU = clamp(finalSampleUv + vec2(0.0, texel.y), vec2(0.002), vec2(0.998));

  float dL = texture2D(uDepth, uvL).r;
  float dR = texture2D(uDepth, uvR).r;
  float dD = texture2D(uDepth, uvD).r;
  float dU = texture2D(uDepth, uvU).r;

  // Gradients weighted to prevent silhouette border outlines and jagged angle spikes
  float dX = clamp((dR - dL) * edgeWeight, -0.06, 0.06) * 4.5;
  float dY = clamp((dU - dD) * edgeWeight, -0.06, 0.06) * 4.5;
  vec3 surfNormal = normalize(vec3(-dX, -dY, 1.0));

  // --- Cinematic Interactive Relighting (Warm Amber + Cool Teal) ---
  vec3 viewDir = vec3(0.0, 0.0, 1.0);
  
  // Highlight mask for rim illumination
  float highlightMask = smoothstep(0.35, 0.85, photoLuma);

  // Directional amber/teal rim tint that follows cursor position
  float dirFactor = clamp((uv.x - 0.5) * 1.8 + ptr.x * 0.45 + 0.5, 0.0, 1.0);
  vec3 rimColor = mix(uRimColorWarm, uRimColorCool, dirFactor);

  // Subtle directional rim sheen that enriches the existing backlight without washing it out to white
  float rimFresnel = pow(1.0 - max(dot(surfNormal, viewDir), 0.0), 3.2);
  vec3 rimLighting = rimColor * rimFresnel * highlightMask * uRim * 0.55;

  // Subtle glint on glasses/nose bridge with safe distance normalization
  vec3 lightPos = vec3(ptr.x * 2.0, ptr.y * 1.8, 1.5);
  vec3 toLight = lightPos - vec3((uv.x - 0.5) * 2.0, (uv.y - 0.5) * 2.0, refinedDepth * 0.5);
  float lightDist = length(toLight);
  vec3 lightDir = lightDist > 0.001 ? toLight / lightDist : vec3(0.0, 0.0, 1.0);
  vec3 halfDir = normalize(lightDir + viewDir);
  float specFactor = pow(max(dot(surfNormal, halfDir), 0.0), 36.0);
  vec3 subtleSpecular = vec3(0.08) * specFactor * highlightMask;

  // Combine lighting layers (no artificial white diffuse border on dark clothes!)
  vec3 finalColor = baseColor + rimLighting + subtleSpecular;

  // Perimeter boundary anti-aliased fade (on the stable uv so the frame edge doesn't wobble)
  float edgeFadeX = smoothstep(0.0, 0.015, uv.x) * smoothstep(1.0, 0.985, uv.x);
  float edgeFadeY = smoothstep(0.0, 0.04, uv.y) * smoothstep(1.0, 0.985, uv.y);
  float alpha = baseSample.a * edgeFadeX * edgeFadeY * uReveal;
  finalColor *= uReveal;

  gl_FragColor = vec4(finalColor, alpha);
}
