const cloud = require('wx-server-sdk')  
const onnxruntime = require('onnxruntime-node')  
  
cloud.init({  
  env: cloud.DYNAMIC_CURRENT_ENV // 初始化云环境  
})  
  
// 加载ONNX模型（直接从云存储路径加载）  
async function loadModelFromCloudPath(modelCloudPath) {  
  try {  
    // 获取模型文件的临时URL  
    const res = await cloud.downloadFile({  
      fileID: modelCloudPath,  
    })  
    const buffer = Buffer.from(res.fileContent, 'binary')  
  
    // 使用Buffer加载模型  
    const session = new onnxruntime.InferenceSession(buffer)  
    return session  
  } catch (error) {  
    console.error('Error loading model from cloud path:', error)  
    throw error  
  }  
}  
  
// 图像预处理（假设你接收的是一个base64编码的图像字符串）  
function preprocessImage(base64Image, targetSize = [224, 224]) {  
  // 将base64编码的图像字符串转换为Buffer  
  const buffer = Buffer.from(base64Image.replace(/^data:image\/\w+;base64,/, ''), 'base64')  
  // 创建图像对象  
  const img = Image.fromBuffer(buffer)  
  // 调整图像大小  
  img.resize(targetSize[0], targetSize[1])  
  // 归一化图像数据  
  img.normalize()  
  // 转换数据布局为CHW  
  const normalizedImgArr = img.data.reshape([1, targetSize[1], targetSize[0], 4])  
  return normalizedImgArr  
}  
  
// 图像分类  
async function classifyImage(model, base64Image, labelDic) {  
  try {  
    // 获取模型的输入名称  
    const inputName = model.getInputs()[0].name  
  
    // 预处理图像  
    const inputTensor = preprocessImage(base64Image)  
  
    // 使用模型进行预测  
    const results = await model.run([inputName], { [inputName]: inputTensor })  
    const predOnnx = results[0]  
    const lab = predOnnx.argMax() // 获取最大值的索引  
  
    // 返回预测结果  
    return {  
      label: lab + 1,  
      name: labelDic[lab],  
    }  
  } catch (error) {  
    console.error('Error during image classification:', error)  
    throw error  
  }  
}  
  
// 云函数入口函数  
exports.main = async (event, context) => {  
  try {  
    // 云存储路径下的模型文件  
    const modelCloudPath = 'model/checkpoint2.onnx'  
  
    // 加载模型  
    const model = await loadModelFromCloudPath(modelCloudPath)  
  
    // labelDic  
    const labelDic = {0: "中华白海豚",
    1: "中华秋沙鸭",
    2: "丹顶鹤",
    3: "云豹",
    4: "亚洲象",
    5: "儒艮",
    6: "台湾猴",
    7: "台湾鬣羚",
    8: "叶猴",
    9: "四爪陆龟",
    10: "坡鹿",
    11: "塔尔羊",
    12: "孔雀雉",
    13: "扬子鳄",
    14: "扭角羚",
    15: "普氏原羚",
    16: "朱鹮",
    17: "梅花鹿",
    18: "河狸",
    19: "灰腹角雉",
    20: "熊狸",
    21: "熊猫",
    22: "熊猴",
    23: "白唇鹿",
    24: "白头鹤",
    25: "白尾海雕",
    26: "白颈长尾雉",
    27: "白鹤",
    28: "紫貂",
    29: "红胸角雉",
    30: "绿孔雀",
    31: "花豹",
    32: "蒙古野驴",
    33: "蓝鹇",
    34: "藏羚羊",
    35: "虎",
    36: "虹雉",
    37: "蜂猴",
    38: "褐马鸡",
    39: "西藏野驴",
    40: "豚尾猴",
    41: "豚鹿",
    42: "豹",
    43: "貂熊",
    44: "赤斑羚",
    45: "赤颈鹤",
    46: "遗鸥",
    47: "野牛",
    48: "野牦牛",
    49: "野马",
    50: "野骆驼",
    51: "金丝猴",
    52: "金钱豹",
    53: "长臂猿",
    54: "雪豹",
    55: "马来熊",
    56: "高鼻羚羊",
    57: "鸨",
    58: "麋鹿",
    59: "黄腹角雉",
    60: "黑头角雉",
    61: "黑长尾雉",
    62: "黑颈长尾雉",
    63: "黑颈鹤",
    64: "黑麂",
    65: "鼋",
    66: "鼷鹿"}  
  
    // 假设你通过event传递了待分类图像的base64编码字符串  
    const base64Image = event.base64Image  
  
    // 对图像进行分类  
    const classificationResult = await classifyImage(model, base64Image, labelDic)  
  
    // 返回分类结果  
    return {  
      classificationResult: classificationResult,  
    }  
  } catch (error) {  
    console.error('Error in cloud function:', error)  
    return {  
      error: 'An error occurred during execution',  
    }  
  }  
}