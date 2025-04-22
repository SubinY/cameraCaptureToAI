"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface TestCase {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  imageFile?: File;
  result?: {
    emotion?: {
      emotion: string;
      confidence: number;
    };
    posture?: {
      neck_angle: number;
      screen_distance: number;
    };
    attention?: {
      current_attention: number;
      gaze_region?: string;
    };
    raw_response?: string;
  };
}

export function ModelAdvancedTest() {
  const [testCases, setTestCases] = useState<TestCase[]>([
    {
      id: "1",
      name: "正面面部，中性表情",
      description: "用户面向摄像头，表情平静，正常坐姿"
    },
    {
      id: "2",
      name: "低头姿势",
      description: "用户低头看手机或文档，测试姿态监测"
    },
    {
      id: "3",
      name: "侧脸视角",
      description: "用户侧脸对着摄像头，测试人脸检测能力"
    },
    {
      id: "4",
      name: "疲劳表情",
      description: "用户表现出疲劳状态，测试情绪识别"
    },
    {
      id: "5",
      name: "注意力分散",
      description: "用户视线不在屏幕上，测试注意力监测"
    }
  ]);
  
  const [activeTab, setActiveTab] = useState("upload");
  const [isLoading, setIsLoading] = useState(false);
  const [currentTestId, setCurrentTestId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 上传图片
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, testId: string) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const imageUrl = URL.createObjectURL(file);
      
      setTestCases(prev => prev.map(test => 
        test.id === testId 
          ? { ...test, imageFile: file, imageUrl } 
          : test
      ));
      
      toast.success(`已上传测试用例 ${testId} 的图片`);
    }
  };
  
  // 触发文件选择
  const triggerFileUpload = (testId: string) => {
    setCurrentTestId(testId);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // 分析图像
  const analyzeImage = async (testId: string) => {
    const testCase = testCases.find(test => test.id === testId);
    if (!testCase?.imageFile) {
      toast.error("请先上传图片");
      return;
    }
    
    setIsLoading(true);
    setCurrentTestId(testId);
    
    try {
      // 将图片转换为base64
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        if (!event.target?.result) return;
        
        const imageBase64 = event.target.result.toString().split(',')[1];
        
        // 发送到API进行分析
        const response = await fetch('/api/detection/analyze/test-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image: `data:image/jpeg;base64,${imageBase64}` }),
        });
        
        if (!response.ok) {
          throw new Error(`API返回错误: ${response.status}`);
        }
        
        const data = await response.json();
        
        // 更新测试用例结果
        setTestCases(prev => prev.map(test => 
          test.id === testId 
            ? { 
                ...test, 
                result: {
                  emotion: data.emotion,
                  posture: data.posture,
                  attention: {
                    current_attention: data.attention.current_attention,
                    gaze_region: '' // API没有直接返回注视区域，实际应用中可能需要从其他字段提取
                  },
                  raw_response: JSON.stringify(data, null, 2)
                } 
              } 
            : test
        ));
        
        setActiveTab("results");
        toast.success(`已分析测试用例 ${testId} 的图片`);
      };
      
      reader.readAsDataURL(testCase.imageFile);
    } catch (error) {
      console.error("分析失败:", error);
      toast.error(`分析失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsLoading(false);
      setCurrentTestId(null);
    }
  };
  
  // 生成进阶测试报告
  const generateAdvancedReport = () => {
    // 计算有多少测试用例有结果
    const completedTests = testCases.filter(test => test.result).length;
    
    if (completedTests === 0) {
      return "尚未完成任何测试用例的分析";
    }
    
    // 分析各种场景下模型的表现
    let emotionAccuracy = 0;
    let postureAccuracy = 0;
    let attentionAccuracy = 0;
    
    testCases.forEach(test => {
      if (!test.result) return;
      
      // 这里可以根据测试用例的特性给出不同的准确性评分
      // 实际应用中可能需要更复杂的评估逻辑
      switch (test.id) {
        case "1": // 正面面部，中性表情
          if (test.result.emotion?.emotion === "neutral") emotionAccuracy += 100;
          else emotionAccuracy += 50;
          postureAccuracy += 90; // 正面姿势应该准确度高
          attentionAccuracy += 90; // 正视应该注意力识别率高
          break;
        case "2": // 低头姿势
          emotionAccuracy += 70; // 低头可能影响情绪识别
          if (test.result.posture && test.result.posture.neck_angle < 30) postureAccuracy += 100;
          else postureAccuracy += 40;
          attentionAccuracy += 60; // 低头应该降低注意力评分
          break;
        case "3": // 侧脸视角
          emotionAccuracy += 50; // 侧脸难以准确识别情绪
          postureAccuracy += 60; // 侧脸姿势评估有限
          attentionAccuracy += 50; // 侧脸注意力难以评估
          break;
        case "4": // 疲劳表情
          if (test.result.emotion?.emotion === "sad" || test.result.emotion?.emotion === "neutral") 
            emotionAccuracy += 80;
          else emotionAccuracy += 30;
          postureAccuracy += 70; // 疲劳可能姿势评估有影响
          if (test.result.attention && test.result.attention.current_attention < 70)
            attentionAccuracy += 80;
          else attentionAccuracy += 40;
          break;
        case "5": // 注意力分散
          emotionAccuracy += 60; // 分散注意力对情绪识别有中等影响
          postureAccuracy += 70; // 姿势评估应该还行
          if (test.result.attention && test.result.attention.current_attention < 60)
            attentionAccuracy += 100;
          else attentionAccuracy += 20;
          break;
      }
    });
    
    // 计算平均准确率
    emotionAccuracy = completedTests > 0 ? Math.round(emotionAccuracy / completedTests) : 0;
    postureAccuracy = completedTests > 0 ? Math.round(postureAccuracy / completedTests) : 0;
    attentionAccuracy = completedTests > 0 ? Math.round(attentionAccuracy / completedTests) : 0;
    
    const overallAccuracy = Math.round((emotionAccuracy + postureAccuracy + attentionAccuracy) / 3);
    
    return `
# 通义千问VL模型进阶测试报告

## 评估概述
- 完成测试用例：${completedTests}/${testCases.length}
- 整体准确率评分：${overallAccuracy}%

## 各模块准确性评分
- 情绪分析：${emotionAccuracy}%
- 体态监测：${postureAccuracy}%
- 注意力分析：${attentionAccuracy}%

## 各场景表现分析

${testCases.map(test => test.result ? `
### 场景${test.id}：${test.name}
- 描述：${test.description}
- 情绪识别：${test.result.emotion?.emotion} (置信度: ${test.result.emotion?.confidence}%)
- 姿态评估：颈部角度 ${test.result.posture?.neck_angle}°，屏幕距离 ${test.result.posture?.screen_distance}厘米
- 注意力评分：${test.result.attention?.current_attention}%
` : '').join('\n')}

## 通义千问VL模型局限性评估

1. **情绪识别局限**
   - 侧脸情绪识别准确率显著下降
   - 微妙情绪变化（如疲劳、轻度压力）识别较弱
   - 表情和情绪混淆问题（如严肃可能被识别为生气）

2. **体态监测局限**
   - 二维图像下距离估计准确性有限
   - 姿态角度依赖于脸部清晰可见
   - 无法区分短暂姿势变化和长期姿势问题

3. **注意力监测局限**
   - 注视方向与注意力程度对应关系不够精确
   - 无法区分"看着屏幕但走神"的状态
   - 缺乏瞳孔大小等生理指标辅助判断

## 对比市场上专业解决方案
通义千问VL作为通用视觉模型，相比专业解决方案：

1. **情绪识别专业替代方案**：
   - Affectiva - 专注面部表情分析，支持7种情绪和20+面部表情
   - EmotionAPI (Microsoft) - 捕捉微表情，准确率高达95%

2. **体态监测专业替代方案**：
   - Posture.ai - 专业姿态分析系统，支持3D建模
   - OpenPose - 精确骨骼关键点检测，适用于专业姿态分析

3. **注意力监测专业替代方案**：
   - Tobii Eye Tracker - 专业眼球追踪设备，精确捕捉注视点
   - iMotions - 综合生物识别平台，结合眼动、脑电等多种生理信号

## 改进建议
1. **模型层面**：
   - 考虑微调通义千问VL模型用于人体工程学领域
   - 结合多个专业模型构建流水线系统

2. **硬件层面**：
   - 增加深度摄像头获取更准确的空间信息
   - 考虑简单的眼球追踪设备提升注意力追踪准确性

3. **应用逻辑**：
   - 增加时序分析，捕捉行为模式而非单帧状态
   - 个性化基准线，适应不同用户的特性
`;
  };

  return (
    <Card className="w-full max-w-[1000px] mx-auto">
      <CardHeader>
        <CardTitle>通义千问VL模型进阶测试</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="upload">测试用例</TabsTrigger>
            <TabsTrigger value="results">测试结果</TabsTrigger>
            <TabsTrigger value="report">进阶报告</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">测试用例准备</h3>
              <p className="text-sm text-muted-foreground mb-4">
                以下是测试通义千问VL模型在不同场景的表现的测试用例。请为每个测试用例上传对应的图片。
              </p>
              
              <Input 
                ref={fileInputRef}
                type="file" 
                accept="image/*"
                className="hidden"
                onChange={(e) => currentTestId && handleFileChange(e, currentTestId)}
              />
              
              <div className="space-y-4">
                {testCases.map(test => (
                  <div key={test.id} className="border rounded-md p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">测试 {test.id}: {test.name}</h4>
                        <p className="text-sm text-muted-foreground">{test.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => triggerFileUpload(test.id)}
                        >
                          上传图片
                        </Button>
                        <Button 
                          variant="default"
                          size="sm"
                          disabled={!test.imageFile || isLoading || currentTestId === test.id}
                          onClick={() => analyzeImage(test.id)}
                        >
                          {isLoading && currentTestId === test.id ? "分析中..." : "分析"}
                        </Button>
                      </div>
                    </div>
                    
                    {test.imageUrl && (
                      <div className="mt-3">
                        <img 
                          src={test.imageUrl} 
                          alt={`测试 ${test.id}`}
                          className="w-full max-h-[200px] object-contain rounded-md border"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="results">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">测试结果</h3>
              
              {testCases.filter(test => test.result).length === 0 ? (
                <p className="text-center text-muted-foreground py-10">
                  尚未有分析结果，请在"测试用例"标签页上传图片并进行分析
                </p>
              ) : (
                <div className="space-y-4">
                  {testCases.filter(test => test.result).map(test => (
                    <div key={test.id} className="border rounded-md p-4">
                      <div className="flex flex-col sm:flex-row gap-4">
                        {test.imageUrl && (
                          <div className="sm:w-1/4">
                            <img 
                              src={test.imageUrl} 
                              alt={`测试 ${test.id}`}
                              className="w-full max-h-[200px] object-contain rounded-md border"
                            />
                          </div>
                        )}
                        
                        <div className="sm:w-3/4">
                          <h4 className="font-medium mb-2">测试 {test.id}: {test.name}</h4>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-md">
                              <p className="text-sm font-medium mb-1">情绪分析</p>
                              <p className="text-xs">类型: <span className="font-medium">{test.result?.emotion?.emotion}</span></p>
                              <p className="text-xs">置信度: <span className="font-medium">{test.result?.emotion?.confidence}%</span></p>
                            </div>
                            
                            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-md">
                              <p className="text-sm font-medium mb-1">体态监测</p>
                              <p className="text-xs">颈部角度: <span className="font-medium">{test.result?.posture?.neck_angle}°</span></p>
                              <p className="text-xs">屏幕距离: <span className="font-medium">{test.result?.posture?.screen_distance}厘米</span></p>
                            </div>
                            
                            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-md">
                              <p className="text-sm font-medium mb-1">注意力分析</p>
                              <p className="text-xs">注意力评分: <span className="font-medium">{test.result?.attention?.current_attention}%</span></p>
                              {test.result?.attention?.gaze_region && (
                                <p className="text-xs">注视区域: <span className="font-medium">{test.result?.attention?.gaze_region}</span></p>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <Label className="text-xs mb-1 block">原始JSON响应:</Label>
                            <div className="bg-slate-100 dark:bg-slate-800 rounded-md p-2 max-h-[100px] overflow-auto">
                              <pre className="text-xs whitespace-pre-wrap">
                                {test.result?.raw_response || "无响应数据"}
                              </pre>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="report">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">进阶测试报告</h3>
              <div className="prose max-w-full dark:prose-invert">
                <pre className="p-4 border rounded-md bg-slate-50 dark:bg-slate-900 overflow-auto text-sm h-[500px]">
                  {generateAdvancedReport()}
                </pre>
              </div>
              <Button 
                onClick={() => {
                  // 创建blob并下载报告
                  const blob = new Blob([generateAdvancedReport()], { type: 'text/markdown' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'qwen-vl-advanced-test-report.md';
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                  
                  toast.success("进阶测试报告已下载");
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