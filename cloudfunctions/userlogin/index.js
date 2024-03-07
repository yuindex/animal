// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  // 构造保存到数据库的数据对象  
  const userData = {  
    openid: wxContext.OPENID,  
    nickname:'',
    avatarUrl:''  
  }  
  try {  
    // 查询 user 集合中是否存在 openid 对应的记录  
    const queryResult = await cloud.database().collection('user').where({  
      openid: wxContext.OPENID  
    }).get()  
  
    if (queryResult.data && queryResult.data.length > 0) {  
      // 如果记录存在，则不执行任何操作（既不插入也不更新）  
      console.log('Record already exists. No action taken.')  
      return {  
        message: 'Record already exists',  
        openid: wxContext.OPENID,  
        appid: wxContext.APPID,  
        unionid: wxContext.UNIONID  
      }  
    } else {  
      // 如果记录不存在，则插入新记录  
      const addResult = await cloud.database().collection('user').add({  
        data: userData  
      })  
      console.log('New record added.')  
      return {  
        event,  
        openid: wxContext.OPENID,  
        appid: wxContext.APPID,  
        unionid: wxContext.UNIONID,  
        databaseResult: result  
      }  
    }  
  } catch (error) {  
    // 如果查询或插入失败，返回错误信息  
    console.error(error)  
    return {  
      error: error.message  
    }  
  }  
}