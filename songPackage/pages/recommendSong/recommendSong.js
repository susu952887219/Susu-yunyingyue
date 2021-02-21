import PubSub from 'pubsub-js'
import request from '../../../util/request'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    day: '',
    month: '',
    year: '',
    recommendList: [],//推荐列表数据
    index: 0,//点击音乐的下标

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //判断用户是否登录
    let userInfo = wx.getStorageInfoSync('userInfo');
    if (!userInfo){
      wx.showToast({
        title: '请先登录',
        icon: 'none',
        success: () => {
          //跳转到登录界面
          wx.relaunch({
            url: '/pages/login/login'
          })
        }
      })
    }
    this.setData({
      day: new Date().getDate(),
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear()
    })
    this.getRecommendListData()

    //订阅来自songDetail的type消息
    PubSub.subscribe('switchSong',(msg,type) => {
      let { recommendList,index } = this.data
      if(type === "pre"){
        if(index === 0){
          index = recommendList.length
        }
        index -=1;
      }else{
        if (index === recommendList.length - 1) {
          index = -1
        }
        index +=1;
      }
      //更新下标
      this.setData({
        index
      })
      let musicId = recommendList[index].id
      //发布musicId消息数据给DetailSong页面
      PubSub.publish('musicId',musicId)
    })
  },
  //获取每日推荐列表数据的回调
  async getRecommendListData() {
    //获取每日推荐列表数据
    let recommendListData = await request('/recommend/songs')
    this.setData({
      recommendList: recommendListData.recommend
    })
  },
  //点击跳转到详情页的函数回调
  toSongDetail (event){
    let  { song,index } = event.currentTarget.dataset;
    this.setData ({
      index
    })
    //路由跳转传参：query参数
    wx.navigateTo({
      //不能直接将song对象最为参数传递，长度过长，会被自动截取掉
      // url: '../songDetail/songDetail?song=' + JSON.stringify(song)
      url: '../songDetail/songDetail?ids=' + song
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