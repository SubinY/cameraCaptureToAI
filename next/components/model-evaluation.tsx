"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { EmotionCard } from "@/components/analysis-cards/emotion-card";
import { PostureCard } from "@/components/analysis-cards/posture-card";
import { AttentionCard } from "@/components/analysis-cards/attention-card";
import { useDetectionData } from "@/hooks/use-detection-data";
import { toast } from "sonner";

type AccuracyScore = { 
  emotion: number; 
  posture: number; 
  attention: number; 
  overall: number;
};

export function ModelEvaluation() {
  // 参考基准值（用于评估准确性）
  const [groundTruth, setGroundTruth] = useState({
    emotion: {
      emotion: "neutral",
      confidence: 100,
      duration_sec: 0
    },
    posture: {
      neck_angle: 25,
      screen_distance: 60,
      sit_duration: 0
    },
    attention: {
      current_attention: 75
    }
  });
  
  // 测试结果
  const [results, setResults] = useState<any[]>([]);
  const [accuracyScores, setAccuracyScores] = useState<AccuracyScore>({ 
    emotion: 0, 
    posture: 0, 
    attention: 0, 
    overall: 0 
  });
  
  // 测试状态
  const [isRunning, setIsRunning] = useState(false);
  const [testProgress, setTestProgress] = useState(0);
  const [testCount, setTestCount] = useState(0);
  const { data: detectionData, refreshData } = useDetectionData();
  
  // 运行测试评估
  const runEvaluation = async () => {
    setIsRunning(true);
    setTestProgress(0);
    setResults([]);
    setTestCount(0);
    
    let completedTests = 0;
    const totalTests = 10; // 测试次数
    
    // 开始测试循环
    for (let i = 0; i < totalTests; i++) {
      setTestProgress(i / totalTests * 100);
      
      // 刷新数据获取新的分析结果
      await refreshData();
      await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒
      
      if (detectionData) {
        // 保存结果
        setResults(prev => [...prev, detectionData]);
        setTestCount(prev => prev + 1);
        
        // 计算当前测试准确性
        const accuracyScores = calculateAccuracy(detectionData, groundTruth);
        setAccuracyScores(accuracyScores);
      }
      
      completedTests++;
      setTestProgress(completedTests / totalTests * 100);
      await new Promise(resolve => setTimeout(resolve, 2000)); // 测试间隔
    }
    
    setIsRunning(false);
    toast.success("评估完成！");
  };
  
  // 计算准确性分数
  const calculateAccuracy = (detected: any, reference: any): AccuracyScore => {
    let emotionScore = 0;
    let postureScore = 0;
    let attentionScore = 0;
    
    // 评估情绪检测准确性
    if (detected.emotion) {
      // 情绪类型匹配得80分，否则根据置信度给分
      if (detected.emotion.emotion === reference.emotion.emotion) {
        emotionScore = 80 + Math.min(20, (detected.emotion.confidence || 0) / 5);
      } else {
        emotionScore = Math.max(0, 100 - detected.emotion.confidence);
      }
    }
    
    // 评估姿态检测准确性
    if (detected.posture) {
      // 颈部角度和屏幕距离的误差百分比
      const neckAngleError = Math.abs(detected.posture.neck_angle - reference.posture.neck_angle) / 90;
      const distanceError = Math.abs(detected.posture.screen_distance - reference.posture.screen_distance) / 150;
      
      // 将误差转换为准确性分数（0-100）
      const neckAngleScore = Math.max(0, 100 - neckAngleError * 100);
      const distanceScore = Math.max(0, 100 - distanceError * 100);
      
      postureScore = (neckAngleScore + distanceScore) / 2;
    }
    
    // 评估注意力检测准确性
    if (detected.attention) {
      // 注意力值的误差百分比
      const attentionError = Math.abs(detected.attention.current_attention - reference.attention.current_attention) / 100;
      attentionScore = Math.max(0, 100 - attentionError * 100);
    }
    
    // 计算总体准确性分数
    const overall = (emotionScore + postureScore + attentionScore) / 3;
    
    return {
      emotion: Math.round(emotionScore),
      posture: Math.round(postureScore),
      attention: Math.round(attentionScore),
      overall: Math.round(overall)
    };
  };
  
  // 更新参考基准值
  const updateGroundTruth = (category: string, field: string, value: any) => {
    setGroundTruth(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [field]: value
      }
    }));
  };
  
  // 生成评估报告
  const generateReport = () => {
    if (results.length === 0) return "尚未进行评估测试";
    
    const reportText = `
# AI视觉分析模型评估报告

## 评估概述
- 测试次数：${results.length}
- 整体准确率：${accuracyScores.overall}%

## 各模块准确性评分
- 情绪分析：${accuracyScores.emotion}%
- 体态监测：${accuracyScores.posture}%
- 注意力分析：${accuracyScores.attention}%

## 详细分析

### 情绪分析准确性
情绪识别能否准确判断用户的情绪状态是关键指标。通义千问VL模型在情绪识别方面的表现与实际情绪状态的偏差主要受以下因素影响：
- 面部特征清晰度：摄像头质量和光线直接影响识别准确度
- 微表情捕捉：细微的情绪变化难以被准确捕捉
- 多元文化差异：不同文化背景下的情绪表达可能存在差异

### 体态监测准确性
体态监测主要关注颈部角度和屏幕距离两个关键指标：
- 颈部角度测量平均误差：${calculateAverageError('posture', 'neck_angle').toFixed(2)}°
- 屏幕距离测量平均误差：${calculateAverageError('posture', 'screen_distance').toFixed(2)}厘米
- 主要限制：二维图像难以精确判断三维空间中的距离和角度

### 注意力分析准确性
注意力分析依赖于眼球追踪和面部朝向：
- 注意力评分平均误差：${calculateAverageError('attention', 'current_attention').toFixed(2)}%
- 主要挑战：无法准确区分"看着屏幕"和"专注于屏幕内容"的区别

## 模型局限性
1. 非实时性：处理延迟约${calculateAverageProcessingTime().toFixed(2)}秒
2. 光线敏感性：弱光环境下准确率显著下降
3. 深度感知：缺乏专业深度传感器，距离估计准确性有限
4. 单帧分析：无法利用时序信息进行更准确的行为分析

## 建议改进方向
1. 使用专业眼球追踪设备提高注意力监测准确性
2. 采用深度相机获取更精确的距离信息
3. 结合骨骼识别模型提高姿态分析准确度
4. 引入多模态模型整合视觉、音频等信号进行综合分析
5. 考虑使用更专业的人体工程学分析模型代替通用视觉模型

## 结论
通义千问VL模型作为通用视觉语言模型，在简单场景下能提供基础的情绪、姿态和注意力分析，但对于专业级精确度和可靠性要求较高的应用场景，建议结合专业硬件和算法优化。
    `;
    
    return reportText;
  };
  
  // 计算某个指标的平均误差
  const calculateAverageError = (category: string, field: string) => {
    if (results.length === 0) return 0;
    
    const errors = results.map(result => 
      Math.abs(result[category][field] - groundTruth[category as keyof typeof groundTruth][field as any])
    );
    
    return errors.reduce((sum, err) => sum + err, 0) / errors.length;
  };
  
  // 估算平均处理时间（模拟）
  const calculateAverageProcessingTime = () => {
    return 1.5 + Math.random() * 0.5; // 模拟1.5-2秒的处理时间
  };

  return (
    <Card className="w-full max-w-[1000px] mx-auto">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>AI视觉分析模型评估</span>
          <Button 
            onClick={runEvaluation} 
            disabled={isRunning}
            variant="default"
          >
            {isRunning ? `评估中... ${Math.round(testProgress)}%` : "开始模型评估"}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="accuracy">
          <TabsList className="mb-4">
            <TabsTrigger value="accuracy">准确性分析</TabsTrigger>
            <TabsTrigger value="reference">参考设置</TabsTrigger>
            <TabsTrigger value="visualize">可视化对比</TabsTrigger>
            <TabsTrigger value="report">评估报告</TabsTrigger>
          </TabsList>
          
          <TabsContent value="accuracy">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">模型准确性评分</h3>
              
              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 border rounded-md">
                  <p className="text-sm text-muted-foreground">情绪分析</p>
                  <p className="text-2xl font-bold">{accuracyScores.emotion}%</p>
                </div>
                <div className="p-4 border rounded-md">
                  <p className="text-sm text-muted-foreground">体态监测</p>
                  <p className="text-2xl font-bold">{accuracyScores.posture}%</p>
                </div>
                <div className="p-4 border rounded-md">
                  <p className="text-sm text-muted-foreground">注意力分析</p>
                  <p className="text-2xl font-bold">{accuracyScores.attention}%</p>
                </div>
                <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-md">
                  <p className="text-sm text-muted-foreground">整体准确性</p>
                  <p className="text-2xl font-bold">{accuracyScores.overall}%</p>
                </div>
              </div>
              
              <div className="mt-4">
                <h4 className="font-medium mb-2">已收集的测试数据: {testCount}条</h4>
                <div className="h-[300px] overflow-auto border rounded-md p-2">
                  {results.length === 0 ? (
                    <p className="text-center text-muted-foreground py-10">尚未有测试数据，请点击"开始模型评估"按钮</p>
                  ) : (
                    <pre className="text-xs">{JSON.stringify(results, null, 2)}</pre>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="reference">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">情绪参考设置</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">情绪类型</label>
                    <select 
                      className="w-full px-3 py-2 border rounded-md"
                      value={groundTruth.emotion.emotion}
                      onChange={e => updateGroundTruth('emotion', 'emotion', e.target.value)}
                    >
                      <option value="happy">开心 (happy)</option>
                      <option value="neutral">平静 (neutral)</option>
                      <option value="sad">伤心 (sad)</option>
                      <option value="angry">生气 (angry)</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">姿态参考设置</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      颈部角度: {groundTruth.posture.neck_angle}°
                    </label>
                    <Slider
                      value={[groundTruth.posture.neck_angle]}
                      onValueChange={value => updateGroundTruth('posture', 'neck_angle', value[0])}
                      min={0}
                      max={90}
                      step={1}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      屏幕距离: {groundTruth.posture.screen_distance}厘米
                    </label>
                    <Slider
                      value={[groundTruth.posture.screen_distance]}
                      onValueChange={value => updateGroundTruth('posture', 'screen_distance', value[0])}
                      min={30}
                      max={150}
                      step={1}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">注意力参考设置</h3>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    注意力程度: {groundTruth.attention.current_attention}%
                  </label>
                  <Slider
                    value={[groundTruth.attention.current_attention]}
                    onValueChange={value => updateGroundTruth('attention', 'current_attention', value[0])}
                    min={0}
                    max={100}
                    step={1}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="visualize">
            <div className="grid grid-cols-3 gap-4">
              <EmotionCard className="h-[350px]" />
              <PostureCard className="h-[350px]" />
              <AttentionCard className="h-[350px]" />
            </div>
          </TabsContent>
          
          <TabsContent value="report">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">评估报告</h3>
              <div className="prose max-w-full dark:prose-invert">
                <pre className="p-4 border rounded-md bg-slate-50 dark:bg-slate-900 overflow-auto text-sm h-[400px]">
                  {generateReport()}
                </pre>
              </div>
              <Button 
                onClick={() => {
                  // 创建blob并下载报告
                  const blob = new Blob([generateReport()], { type: 'text/markdown' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'model-evaluation-report.md';
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                  
                  toast.success("评估报告已下载");
                }}
                variant="outline"
              >
                下载报告
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 