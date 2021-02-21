import request from '../../util/request'
let startY = 0;
let moveY = 0;
let endY = 0; 
Page({

  /**
   * 页面的初始数据
   */
  data: {
    coverTransform: 'translateY(0)',
    coveTransition: '',
    userInfo: {},
    recentPlayList: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let userInfo = wx.getStorageSync('userInfo')
    if(userInfo){
      this.setData({
        userInfo: JSON.parse(userInfo),
      })

      //获取用户播放记录
      this.getUserRecentPlayList(this.data.userInfo.userId)
    }

  },
  handleTouchStart: function (event) {
    this.setData({
      coveTransition: ''
    })
    //获取第一个手指触摸的起始坐标
    startY = event.touches[0].clientY;
  },
  handleTouchMove: function (event) {
    moveY = event.touches[0].clientY;
    let moveDistance = moveY - startY;
    if (moveDistance >= 80){
      moveDistance = 80;
    }
    if (moveDistance <= 0) {
      moveDistance = 0;
    }
    this.setData({
      coverTransform: `translateY(${moveDistance}rpx)`
    })
  },
  handleTouchEnd: function (event) {
    endY = startY
    let backDistance = endY - moveY
    if (backDistance >= 0) {
      backDistance = 0;
    }
    if (backDistance <= -80) {
      backDistance = -80;
    }
    this.setData({
      coverTransform: `translateY(${backDistance}rpx-34rpx)`,
      coveTransition: 'transform .3s linear'
    })
  },
  //跳转到登录界面
  toLogin: function(event){
      wx.navigateTo({
          url: '../login/login'
      })
  },
  //获取用户播放记录的功能函数
  async getUserRecentPlayList(userId) {
    let recentPlayListData = await request('/user/record',{uid : userId, type: 1})
    this.setData({
      recentPlayList: recentPlayListData.weekData.splice(0, 10)
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})