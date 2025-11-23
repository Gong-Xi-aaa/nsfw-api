const tf = require('@tensorflow/tfjs');
const nsfw = require('nsfwjs');

let model;

async function loadModel() {
  if (!model) {
    model = await nsfw.load();
  }
  return model;
}

// 将图片 URL 或 base64 转换为 Image 对象
async function loadImage(imageData) {
  // 动态导入 canvas（仅在需要时加载）
  const { createCanvas, loadImage: canvasLoadImage } = require('canvas');
  
  let img;
  
  if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
    // URL 格式
    img = await canvasLoadImage(imageData);
  } else {
    // Base64 格式
    const base64Data = imageData.startsWith('data:') 
      ? imageData 
      : `data:image/jpeg;base64,${imageData}`;
    img = await canvasLoadImage(base64Data);
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
