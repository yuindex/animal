// app.js
App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        // env: 'my-env-id',
        traceUser: true,
        
      });
    }
    
    this.globalData = {
      userInfo: {  
        avatarUrl: '', // 用户头像的 URL  
        nickname: '',  // 用户的昵称  
        openid: '',
        appid: '',  
      },  
      isLogin: false,
    };
    // 用户登录方法  
    this.userLogin = function () {  
      const app = getApp(); // 获取 App 实例  
      wx.getUserProfile({  
        desc: '登录显示头像和昵称信息',  
        success(res) {  
          if (res.userInfo) { 
            // 将用户信息存储到全局数据中 
            app.globalData.userInfo = res.userInfo;
            // 将用户信息存储到本地缓存中，以便在其他页面中使用  
            wx.setStorageSync('userInfo', app.globalData.userInfo); 
            // 调用云函数进行登录，并传递 userInfo  
            wx.cloud.callFunction({  
              name: "userlogin",  
              data: {
                userInfo: res.userInfo,
              },  
              success(res) {  
                if (res.result && res.result.openid) {  
                  app.globalData.userInfo.openid = res.result.openid; 
                  console.log(res.result)
                  wx.navigateTo({  
                    url: '/pages/index/index',  
                  });  
                } else {  
                  console.error('登录失败，未获取到 openid');  
                }  
              },  
              fail(err) {  
                console.error('云函数调用失败', err);  
              }  
            });  
          } else {  
            console.error('获取用户信息失败');  
          }  
        }  
      });  
    };  
  },  

});
