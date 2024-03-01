// 云函数入口文件  
const cloud = require('wx-server-sdk')  
cloud.init()  

// 云函数入口函数
exports.main = async (event, context) => {  
  try {  
    // 获取小程序上传的文件  
    const file = event.file  
      
    // 在云存储中创建一个文件夹 
    const folderName = 'user_images'  
    const result = await cloud.init({  
      env: cloud.DYNAMIC_CURRENT_ENV,  
    })  
    const folder = cloud.filesystem().directory(folderName)  
    await folder.create()  
  
    // 将文件保存到云存储，并获取文件ID  
    const cloudPath = `${folderName}/${file.name}`  
    const fileID = await cloud.filesystem().cloudPath(cloudPath).uploadFile({  
      cloudPath: cloudPath,  
      fileContent: file.content,  
    })  
  
    // 返回文件ID给小程序前端  
    return {  
      fileID: fileID,  
      cloudPath: cloudPath,  
    }  
  } catch (err) {  
    console.error(err)  
    return err  
  }  
};
