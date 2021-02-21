// 发送Ajax请求
import config from './config'
export default (url,data={},method="GET") => {
  return new Promise((resolve,reject) => {
    wx.request({
      //1.new Promise初始化实例的状态为pending
      url: config.host + url,
      data,
      method,
      header: {
        cookie: wx.getStorageSync('cookies') ? wx.getStorageSync('cookies').find(item => item.indexOf('MUSIC_U') !== -1) : ''
      },
      success: (res) => {
        if(data.isLogin) {//说明是登录的请求
          wx.setStorage({
            key: 'cookies' , 
            data: res.cookies
          })
        }
        //console.log("请求成功", res);
        resolve(res.data); //resolve修改Promise的状态为成功状态resolved
      },
      fail: (err) => {
        //console.log("请求失败", err);
        reject(err); //reject修改Promise的状态为成功状态rejected
      }
    })
  })
}