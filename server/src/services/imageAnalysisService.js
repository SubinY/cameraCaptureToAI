const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { uploadToOSS } = require("../utils/ossClient");
const ossConfig = require("../config/oss.config");

// 行为类型映射
const BEHAVIOR_TYPES = {
  1: { code: "work", description: "认真专注工作" },
  2: { code: "eating", description: "吃东西" },
  3: { code: "drinking_water", description: "用杯子喝水" },
  4: { code: "drinking_beverage", description: "喝饮料" },
  5: { code: "phone", description: "玩手机" },
  6: { code: "sleeping", description: "睡觉" },
  7: { code: "other", description: "其他" },
};

// 导出行为类型供其他模块使用
module.exports = {
  analyzeImage,
  BEHAVIOR_TYPES,
};

/**
 * 分析图像内容
 * @param {Buffer} imageBuffer - 图像数据
 * @returns {Promise<Object>} - 分析结果
 */
async function analyzeImage(imageBuffer) {
  try {
    // 保存图像到临时文件
    const timestamp = Date.now();
    const tempFilePath = path.join(
      __dirname,
      `../../temp/image_${timestamp}.jpg`
    );

    // 确保temp目录存在
    const tempDir = path.join(__dirname, "../../temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // 写入临时文件
    fs.writeFileSync(tempFilePath, imageBuffer);

    // 上传到OSS
    const ossKey = ossConfig.enabled ? `behavior_images/${timestamp}.jpg` : "";
    const ossUrl = ossConfig.enabled
      ? await uploadToOSS(tempFilePath, ossKey)
      : "";

    // 调用Qwen-VL API进行图像分析
    const analysisResult = await analyzeWithQwenVL(tempFilePath);

    // 提取行为类型
    const { behaviorType, behaviorDesc } = extractBehaviorType(analysisResult);

    // 清理临时文件
    fs.unlinkSync(tempFilePath);

    return {
      timestamp,
      imageUrl: ossUrl,
      analysis: analysisResult,
      result: {
        type: behaviorType,
        code: BEHAVIOR_TYPES[behaviorType]?.code || "unknown",
        description:
          behaviorDesc ||
          BEHAVIOR_TYPES[behaviorType]?.description ||
          "未知行为",
      },
    };
  } catch (error) {
    console.error("分析图像失败:", error);
    throw error;
  }
}

/**
 * 使用Qwen-VL API分析图像
 * @param {string} imagePath - 图像路径
 * @returns {Promise<string>} - 分析结果文本
 */
async function analyzeWithQwenVL(imagePath) {
  try {
    // 读取图像为base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString("base64");

    // 调用Qwen-VL API
    const response = await axios.post(
      process.env.QWEN_BASE_URL + "/chat/completions",
      {
        model: "qwen-vl-plus",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "请分析这张图片中的人物行为，并从以下7种行为中选择一种最匹配的：1.认真专注工作 2.吃东西 3.用杯子喝水 4.喝饮料 5.玩手机 6.睡觉 7.其他。请给出你的选择（只需回复数字和行为描述即可）。",
              },
              {
                type: "image_url",
                image_url: { url: `data:image/jpeg;base64,${base64Image}` },
              },
            ],
          },
        ],
        max_tokens: 1000,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.QWEN_API_KEY}`,
        },
      }
    );

    // 提取分析结果
    // 根据API响应格式提取内容
    if (
      response.data.output &&
      response.data.output.choices &&
      response.data.output.choices.length > 0
    ) {
      return response.data.output.choices[0].message.content;
    } else if (response.data.choices && response.data.choices.length > 0) {
      return response.data.choices[0].message.content;
    } else {
      console.log("API响应格式异常:", JSON.stringify(response.data));
      return "无法解析API响应";
    }
  } catch (error) {
    console.error("调用Qwen-VL API失败:", error.message);
    // 输出更详细的错误信息
    if (error.response) {
      // 服务器响应了错误状态码
      console.error("错误状态码:", error.response.status);
      console.error("错误响应头:", JSON.stringify(error.response.headers));
      console.error("错误响应数据:", JSON.stringify(error.response.data));
    } else if (error.request) {
      // 请求已发送但没有收到响应
      console.error("未收到响应:", error.request);
    }
    throw new Error(`调用图像分析API失败: ${error.message}`);
  }
}

/**
 * 从分析文本中提取行为类型和描述
 * @param {string} analysisText - 分析结果文本
 * @returns {Object} - 包含行为类型和描述的对象
 */
function extractBehaviorType(analysisText) {
  // 尝试匹配行为类型数字和描述（1-7）
  const pattern =
    /(\d+)\s*[.、:]?\s*(认真专注工作|吃东西|用杯子喝水|喝饮料|玩手机|睡觉|其他)/;
  const match = analysisText.match(pattern);

  if (match) {
    const behaviorType = match[1];
    const behaviorDesc = match[2];
    return { behaviorType, behaviorDesc };
  }

  // 如果第一种模式匹配失败，尝试替代模式
  const patterns = [
    { pattern: /认真专注工作/, type: "1" },
    { pattern: /吃东西/, type: "2" },
    { pattern: /用杯子喝水/, type: "3" },
    { pattern: /喝饮料/, type: "4" },
    { pattern: /玩手机/, type: "5" },
    { pattern: /睡觉/, type: "6" },
    { pattern: /其他/, type: "7" },
  ];

  for (const { pattern, type } of patterns) {
    if (pattern.test(analysisText)) {
      return {
        behaviorType: type,
        behaviorDesc: pattern.toString().replace(/\\/g, "").replace(/\//g, ""),
      };
    }
  }

  // 默认返回未识别
  return { behaviorType: "0", behaviorDesc: "未识别" };
}
