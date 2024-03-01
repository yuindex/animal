// index.js
// const app = getApp()
const { envList } = require('../../envList.js');

Page({  
  data: {  
    imgSrc: '',
    isWaiting: false,
    fileName:''  
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
          fileName: res.tempFilePaths[0].name  
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
        that.setData({  
          imgSrc: tempFilePaths[0], // 更新图片路径到页面数据  
          fileName: tempFilePaths[0].name
        });  
      }  
    });  
  }, 

  StartRecognition: function() {  
    const imgSrc = this.data.imgSrc;
    const fileName = this.data.fileName;  
    if (imgSrc) {  
      this.uploadImageToCloud(imgSrc,fileName);  
    } else {  
      wx.showToast({  
        title: '请先选择一张图片',  
        icon: 'none',  
        duration: 2000 //默认1500ms  
      });  
    }  
  },

  uploadImageToCloud: function(tempFilePath,fn) {
    // 触发需要等待完成的事件  
    wx.cloud.callFunction({  
      name: 'UploadImage',  
      data: {  
        imagePath: tempFilePath,
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
  },
  Recognition: function() {  
    
  },  
})
