// 导入 wx-server-sdk  
const cloud = require('wx-server-sdk')  
  
// 初始化 cloud 对象  
cloud.init({  
  env: cloud.DYNAMIC_CURRENT_ENV  
})  

// 云函数入口函数
exports.main = async (event, context) => {
  try {  
    // 在云存储中创建一个文件夹 
    const folderName = 'user_images'  
    const folder = cloud.filesystem().directory(folderName)  
    const createResult = await folder.create()  
    if (!createResult) {  
      console.error(`文件夹 ${folderName} 创建失败！`)  
      return { error: '文件夹创建失败' }  
    }  
    console.log(`文件夹 ${folderName} 创建成功！`)    
    // 获取小程序传递的文件路径
    if (!event.imagePath || event.imagePath === undefined) {  
      console.error('图片路径未定义或为空！')  
      return { error: '图片路径未定义或为空' }  
    }  
    const tempFilePath = event.imagePath;  
    // 验证 fileName 字段是否存在且不是 undefined  
    if (!event.fileName || event.fileName === undefined) {  
      console.error('文件名未定义或为空！')  
      return { error: '文件名未定义或为空' }  
    }  
    const fileName = event.fileName; 
    
    // 使用云函数的临时文件存储来读取文件内容  
    const tempFile = cloud.tempFile({  
      filePath: tempFilePath,  
    });  
  
    // 读取文件内容  
    const fileContent = await tempFile.toBuffer();
    if (fileContent.length === 0) {  
      console.error('文件内容为空！');  
      return { error: '文件内容为空' };  
    }    
    const uploadResult = await cloud.filesystem().uploadFile({  
      cloudPath: `${folderName}/${fileName}`, // 指定云存储中的路径和文件名  
      fileContent: fileContent,  
    });  
    // 检查上传结果  
    if (!uploadResult || uploadResult.errcode) {  
      console.error('上传文件失败:', uploadResult && uploadResult.errmsg ? uploadResult.errmsg : '未知错误');  
      return { error: '上传失败' };  
    } 
    // 返回上传结果  
    return uploadResult;  
  } catch (error) {  
    // 处理错误  
    console.error('上传图片时发生错误:', error);  
    return error;  
  }  
}