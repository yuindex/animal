// index.js
// const app = getApp()
const { envList } = require('../../envList.js');

Page({  
  data: {  
    imgSrc: '',
    isWaiting: false,
    fileName:'',
    FileContent:'',
    userInfo: null // 添加一个userInfo字段来存储用户信息
  },  

  ChooseImage: function() {  
    var that = this;  
    wx.chooseImage({  
      count: 1, // 默认9  
      sizeType: ['original'], // 可以指定是原图还是压缩图，默认二者都有  
      sourceType: ['album'], // 可以指定来源是相册还是相机，默认二者都有  
      success: function (res) {  
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片  
        that.setData({  
          imgSrc: res.tempFilePaths[0],
          fileName: res.tempFilePaths[0].split('/').pop()  
        })  
      }  
    })  
  },
  
  TakePhoto: function() {  
    const that = this;  
    wx.chooseImage({  
      count: 1, // 默认9  
      sizeType: ['original'], // 可以指定是原图还是压缩图，默认二者都有  
      sourceType: ['camera'], // 从相机拍照  
      success(res) {  
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片  
        const tempFilePaths = res.tempFilePaths;
        const filename = tempFilePaths[0].split('/').pop();  
        that.setData({  
          imgSrc: tempFilePaths[0], // 更新图片路径到页面数据  
          fileName: filename
        });  
      }  
    });  
  }, 

  StartRecognition: function() {  
    const that = this;
    const imgSrc = this.data.imgSrc;
    const tempFilePath = this.data.imgSrc;  
    if (imgSrc) {
      wx.getFileSystemManager().readFile({  
        filePath: tempFilePath, // 第一个文件路径  
        encoding: 'base64', // 编码格式  
        success: function(res) {  
          that.setData({  
            FileContent: res.data
          }),
          that.uploadImageToCloud(); 
        },
        fail: err => {  
          console.error('读取文件失败:', err);  
        } 
      });
    } else {  
      wx.showToast({  
        title: '请先选择一张图片',  
        icon: 'none',  
        duration: 2000 //默认1500ms  
      });  
    }  
  },

  uploadImageToCloud: function() {
    const filepath = this.data.imgSrc;
    const filename = this.data.fileName;
    const cloudpath = "user_images/" + filename + ".jpg";
    wx.cloud.uploadFile({  
      cloudPath: cloudpath,  
      filePath: filepath,  
      success: res => {  
        console.log('图片上传成功', res);  
        // 在这里处理上传成功后的逻辑，如获取文件ID等
        // 显示“等待中”  
        this.setData({  
          isWaiting: true  
          });    
          this.Recognition();  
      },  
      fail: err => {  
        console.error('图片上传失败', err);  
        // 在这里处理上传失败后的逻辑  
      }  
    });
  },
  
  Recognition: function() {  
    const imgSrc = this.data.imgSrc;
    if (imgSrc) {  
      // 调用云函数进行识别  
      wx.cloud.callFunction({  
        name: 'Recognize', // 云函数名称  
        data: {  
          base64Image: imgSrc // 将图片的 base64 数据传递给云函数  
        },  
        success: res => {  
          console.log('识别结果:', res.result); // 打印云函数返回的识别结果  
          // 在这里你可以处理识别结果，比如更新页面数据等  
          this.setData({  
            recognitionResult: res.result // 假设云函数返回的结果在 res.result 中  
          });  
        },  
        fail: err => {  
          console.error('调用云函数失败:', err);  
          // 在这里你可以处理调用失败的情况，比如显示错误信息  
          wx.showToast({  
            title: '识别失败，请稍后再试',  
            icon: 'none',  
            duration: 2000  
          });  
        }  
      });  
    }
  },

  navigateToHistory: function(){
    wx.navigateTo({  
      url: '/pages/index/userHistory/userHistory'
    });  
  },
  onLoad: function() {  
    // 获取应用实例  
    const app = getApp();  
  
    // 从全局数据中获取 userInfo  
    const userInfo = app.globalData.userInfo;  
  
    if (userInfo) {  
      // 用户信息存在  
      console.log('用户信息：', userInfo);  
      this.setData({ userInfo: userInfo }); // 将用户信息设置到页面数据中  
  
      // 单独获取头像和昵称  
      const avatarUrl = userInfo.avatarUrl;  
      const nickname = userInfo.nickname;  
  
      // 设置到页面数据  
      this.setData({  
        avatarUrl: avatarUrl,  
        nickname: nickname  
      });  
    } else {  
      // 用户信息不存在时的处理逻辑  
      console.log('用户信息不存在');  
      // 可以选择跳转到登录页面或其他处理  
    }  
  },     
})
