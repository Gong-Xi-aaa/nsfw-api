const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-backend-cpu');
const nsfw = require('nsfwjs');

let model;

async function loadModel() {
  if (!model) {
    try {
      console.log('初始化 TensorFlow.js CPU 后端...');
      // 设置 CPU 后端
      await tf.setBackend('cpu');
      await tf.ready();
      console.log('后端已就绪:', tf.getBackend());
      
      console.log('加载 NSFW 模型...');
      // 加载模型，使用 CDN 托管的模型
      model = await nsfw.load('https://nsfw-demo.s3.amazonaws.com/model/', {
        size: 299
      });
      console.log('模型加载成功');
    } catch (error) {
      console.error('模型加载失败:', error);
      throw new Error(`模型加载失败: ${error.message}`);
    }
  }
  return model;
}

// 将图片 URL 或 base64 转换为 Canvas 对象
async function loadImage(imageData) {
  const { createCanvas, loadImage: napiLoadImage } = require('@napi-rs/canvas');
  
  let img;
  
  if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
    // URL 格式 - 先下载图片
    const response = await fetch(imageData);
    if (!response.ok) {
      throw new Error('无法获取图片');
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    img = await napiLoadImage(buffer);
  } else {
    // Base64 格式
    let base64Data;
    if (imageData.startsWith('data:')) {
      base64Data = imageData.split(',')[1];
    } else {
      base64Data = imageData;
    }
    const buffer = Buffer.from(base64Data, 'base64');
    img = await napiLoadImage(buffer);
  }
  
  // 创建 canvas 并绘制图片
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  
  return canvas;
}

module.exports = async (req, res) => {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理 OPTIONS 请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: '请使用 POST 方法' 
    });
  }

  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ 
        error: 'Bad request',
        message: '请提供图片 URL 或 base64 数据' 
      });
    }

    // 加载模型
    const nsfwModel = await loadModel();

    // 加载图片
    const canvas = await loadImage(image);

    // 进行分类
    const predictions = await nsfwModel.classify(canvas);

    // 返回结果
    res.status(200).json({
      success: true,
      predictions: predictions.map(pred => ({
        className: pred.className,
        probability: pred.probability
      }))
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
};
