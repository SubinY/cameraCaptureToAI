// 3D球体组件的配置文件

// 顶点着色器代码 - 负责球体形状变形
export const vertexShader = `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
uniform float uTime;
uniform float uDataValue1; // 数据值1 - 控制主要波浪高度
uniform float uDataValue2; // 数据值2 - 控制波浪频率
uniform float uDataValue3; // 数据值3 - 控制波浪速度
uniform float uDataValue4; // 数据值4 - 控制细节波浪
uniform float uWaveIntensity; // 波浪整体强度

// 基础波形函数
float wavePattern(vec3 pos, float freq, float speed, float amp) {
  return sin(pos.x * freq + uTime * speed) * 
         sin(pos.y * freq * 0.8 + uTime * speed * 1.2) * 
         sin(pos.z * freq * 1.2 + uTime * speed * 0.8) * amp;
}

// 声纹波形函数 - 模拟声音波形
float voiceWavePattern(vec3 pos, float freq, float speed, float amp, float phase) {
  // 使用复杂的波形组合模拟声音波形
  float wave1 = sin(pos.x * freq + uTime * speed + phase) * cos(pos.z * freq * 0.5 + uTime * speed * 0.7);
  float wave2 = sin(pos.y * freq * 1.2 + uTime * speed * 0.8 + phase * 1.5) * sin(pos.x * freq * 0.3 + uTime * speed * 1.1);
  float wave3 = sin(pos.z * freq * 0.7 + uTime * speed * 1.3 + phase * 0.5) * cos(pos.y * freq * 0.6 + uTime * speed);
  
  // 添加谐波以增加不规则性
  float harmonic1 = sin(pos.x * freq * 2.0 + uTime * speed * 1.1) * 0.7;
  float harmonic2 = sin(pos.y * freq * 3.0 + uTime * speed * 1.2) * 0.5;
  float harmonic3 = cos(pos.z * freq * 2.5 + uTime * speed * 0.9) * 0.6;
  
  // 非线性组合产生更不规则的效果
  float nonLinear = sin(wave1 * wave2 * 3.0) * 0.3;
  
  return (wave1 * wave2 * wave3 + harmonic1 + harmonic2 + harmonic3 + nonLinear) * amp;
}

void main() {
  vUv = uv;
  vNormal = normal;
  
  // 创建带数据影响的位移效果
  vec3 pos = position;
  
  // 基础波浪效果
  float baseDisplacement = wavePattern(pos, 10.0, 1.0, 0.25 * uDataValue1);
  
  // 次级波形增加复杂性
  float secondaryWave = wavePattern(pos * 1.8, 15.0 * uDataValue2, 1.5, 0.18);
  
  // 数据值1影响 - 主要波浪高度
  float dataValue1Influence = wavePattern(pos, 12.0 * uDataValue2, 1.8, 0.15 * uDataValue1);
  
  // 数据值2影响 - 波浪频率
  float frequencyFactor = 0.2 + uDataValue2 * 0.3;
  
  // 数据值3影响 - 波浪速度
  float speedFactor = 1.5 + uDataValue3 * 0.15;
  float speedInfluence = wavePattern(pos, 18.0, speedFactor, 0.2) * uDataValue3;
  
  // 数据值4影响 - 声纹样式波浪 (最明显的声纹可视化效果)
  float voiceFreq = 25.0 * uDataValue4;
  float voiceSpeed = 3.0 + uDataValue4 * 0.25;
  
  // 使用声纹波形函数
  float voiceWave1 = voiceWavePattern(pos, voiceFreq, voiceSpeed, 0.3 * uDataValue4, 0.0);
  float voiceWave2 = voiceWavePattern(pos * 1.2, voiceFreq * 1.5, voiceSpeed * 0.8, 0.2 * uDataValue4, 2.0);
  float dataValue4Influence = voiceWave1 + voiceWave2;
  
  // 高频细节
  float detailNoise = wavePattern(pos * 4.0, 35.0, 2.5, 0.12) * uDataValue4;
  
  // 脉动效果，模拟声音节奏
  float pulseEffect = sin(uTime * 5.0 * uDataValue4) * 0.15 * uDataValue4;
  
  // 局部突起效果，创造不规则凸起
  float localBump = 0.0;
  if(max(uDataValue1, max(uDataValue2, max(uDataValue3, uDataValue4))) > 0.3) {
    // 创建随机位置的局部突起
    for(int i = 0; i < 3; i++) {
      vec3 bumpCenter = vec3(
        sin(uTime * (0.2 + float(i) * 0.1)),
        cos(uTime * (0.3 + float(i) * 0.05)),
        sin(uTime * (0.25 + float(i) * 0.07))
      );
      float distToBump = distance(normalize(pos), normalize(bumpCenter));
      localBump += (0.3 - min(distToBump, 0.3)) * 0.8 * uDataValue4;
    }
  }
  
  // 结合所有影响，加权重要性
  float displacement = (baseDisplacement * 0.2 + 
                       secondaryWave * 0.2 + 
                       dataValue1Influence * 0.2 + 
                       speedInfluence * 0.4 + 
                       dataValue4Influence * 1.2 + 
                       detailNoise * 0.4 + 
                       pulseEffect * 1.5 +
                       localBump) * frequencyFactor;
  
  // 应用波浪强度参数
  displacement *= uWaveIntensity;
  
  // 沿法线方向应用位移
  pos += normal * displacement;
  
  vPosition = pos;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

// 片元着色器代码 - 负责球体颜色和效果
export const fragmentShader = `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
uniform float uTime;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uHighlightColor;
uniform float uDataValue1; // 数据值1 - 影响颜色混合
uniform float uDataValue2; // 数据值2 - 影响纹理细节
uniform float uDataValue3; // 数据值3 - 影响光照效果
uniform float uDataValue4; // 数据值4 - 影响高光和活跃区域
uniform float uWaveIntensity; // 波浪整体强度

// 有机噪声函数
float organicNoise(vec3 pos, float freq, float speed) {
  return sin(pos.x * freq + uTime * speed) * 
         sin(pos.y * freq + uTime * speed) * 
         sin(pos.z * freq + uTime * speed);
}

// 分形噪声函数
float fractalNoise(vec3 pos, float baseFreq, float persistence, int octaves) {
  float total = 0.0;
  float frequency = baseFreq;
  float amplitude = 1.0;
  float maxValue = 0.0;
  
  for(int i = 0; i < octaves; i++) {
    total += organicNoise(pos * frequency, frequency, 1.0) * amplitude;
    maxValue += amplitude;
    amplitude *= persistence;
    frequency *= 2.0;
  }
  
  return total / maxValue;
}

void main() {
  // 创建动态流体效果
  float baseNoise = fractalNoise(vPosition, 8.0, 0.65, 3);
  
  // 数据值1影响 - 颜色变化速度
  float value1Influence = sin(vPosition.x * 20.0 * uDataValue1 + uTime * 1.5) * 
                        sin(vPosition.z * 18.0 * uDataValue1 + uTime * 1.2) * 0.4;
  
  // 数据值3影响 - 颜色强度和图案
  float value3Influence = uDataValue3 * 0.5;
  float energyPattern = sin(vPosition.y * 30.0 * uDataValue3 + uTime * 1.8) * 0.3;
  
  // 数据值4影响 - 声纹波形图案
  float voiceFreq = 35.0 * uDataValue4;
  float voiceSpeed = 2.5 * uDataValue4;
  float activityNoise = sin(vPosition.x * voiceFreq + uTime * voiceSpeed) * 
                        sin(vPosition.z * voiceFreq * 0.8 + uTime * voiceSpeed * 1.2) * 
                        sin(vPosition.y * voiceFreq * 1.2 + uTime * voiceSpeed * 0.8) * 0.5;
  
  // 高频细节
  float highFreqDetail = sin(vPosition.x * 50.0 + uTime * 5.0) * 
                         sin(vPosition.y * 60.0 + uTime * 6.0) * 0.1 * uDataValue4;
  
  // 结合所有影响
  float noise = (baseNoise * 0.3 + 
                value1Influence * 0.2 + 
                activityNoise * 0.8 + 
                energyPattern * 0.3 + 
                highFreqDetail * 0.4) * 0.5 + 0.5;
  
  // 应用波浪强度参数
  noise = mix(0.5, noise, uWaveIntensity);
  
  // 创建颜色混合
  vec3 baseColor = mix(uColor1, uColor2, noise);
  
  // 添加高亮色用于活跃区域
  float highlightMask = pow(activityNoise + highFreqDetail, 2.0) * uDataValue4;
  vec3 color = mix(baseColor, uHighlightColor, highlightMask * 0.7);
  
  // 添加基于数据值3的亮度变化
  color *= (1.0 + value3Influence * 0.4);
  
  // 添加照明效果与边缘光
  vec3 viewDir = normalize(vec3(0.0, 0.0, 1.0));
  float rimLight = 1.0 - max(0.0, dot(viewDir, vNormal));
  rimLight = pow(rimLight, 2.5) * (1.0 + uDataValue2 * 0.5);
  
  // 基于法线的照明
  float lighting = dot(vNormal, normalize(vec3(1.0, 0.8, 0.6))) * (1.0 + uDataValue2 * 0.4);
  
  // 结合照明效果
  color += lighting * 0.2 + rimLight * uHighlightColor * 0.4;
  
  // 添加脉动效果
  float pulse = (sin(uTime * 3.0 * uDataValue4) * 0.5 + 0.5) * uDataValue4 * 0.3;
  color += pulse * uHighlightColor * highlightMask;
  
  // 设置透明度 - 边缘略微透明以增加发光效果
  float alpha = 0.95 + rimLight * 0.05;
  
  gl_FragColor = vec4(color, alpha);
}
`;

// 默认颜色配置
export const defaultColors = {
  color1: "#00FFFF", // 青色
  color2: "#4D4DFF", // 蓝紫色
  highlightColor: "#FF00FF", // 亮紫色高亮
  inactiveColor1: "#0A1929", // 不活跃状态颜色1
  inactiveColor2: "#0F2942", // 不活跃状态颜色2
};

// 默认波浪配置
export const defaultWaveConfig = {
  intensity: 50, // 波浪强度 (0-100)
  transitionDuration: 800, // 过渡动画持续时间(毫秒)
};

// 球体几何体配置
export const sphereGeometryConfig = {
  radius: 1,
  widthSegments: 128, // 更高的细分数使球体更平滑
  heightSegments: 128,
};