// index.js
// const app = getApp()
const { envList } = require('../../envList.js');

Page({  
  data: {  
    imgSrc: '',
    isWaiting: false,
    fileName:'',
    FileContent:''
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

/*   uploadImageToCloud1: function() {
    const FileContent = this.data.FileContent;
    const fn = this.data.fileName;
    // 触发需要等待完成的事件  
    wx.cloud.callFunction({  
      name: 'UploadImage',  
      data: {  
        fileContent: FileContent,
        fileName: fn   
      },  
      success: res => {  
        console.log('图片上传成功', res.result);
        // 显示“等待中”  
        this.setData({  
        isWaiting: true  
        });    
        this.Recognition();  
      },  
      fail: err => {  
        console.error('图片上传失败', err);  
      }  
    });  
  }, */
  
  Recognition: function() {  
    
  },  
})
