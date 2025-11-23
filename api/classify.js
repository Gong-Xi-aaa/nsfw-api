const tf = require('@tensorflow/tfjs-node');
const nsfw = require('nsfwjs');
const fetch = require('node-fetch');

let model;

async function loadModel() {
  if (!model) {
    model = await nsfw.load();
  }
  return model;
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

    let imageBuffer;

    // 处理不同的图片输入格式
    if (image.startsWith('http://') || image.startsWith('https://')) {
      // URL 格式
      const response = await fetch(image);
      if (!response.ok) {
        throw new Error('无法获取图片');
      }
      imageBuffer = await response.buffer();
    } else if (image.startsWith('data:image')) {
      // Base64 格式
      const base64Data = image.split(',')[1];
      imageBuffer = Buffer.from(base64Data, 'base64');
    } else {
      // 假设是纯 base64
      imageBuffer = Buffer.from(image, 'base64');
    }

    // 将图片转换为 tensor
    const imageTensor = tf.node.decodeImage(imageBuffer, 3);

    // 进行分类
    const predictions = await nsfwModel.classify(imageTensor);

    // 清理 tensor 以释放内存
    imageTensor.dispose();

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
