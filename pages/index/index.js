import request from '../../util/request.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bannerList: [],//轮播图数据
    recommendList: [],// 推荐歌曲数据
    topList: [],// 排行榜数据

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    //获取轮播图数据
    let bannerListData = await request('/banner', { type: 2 });
    this.setData({
      bannerList: bannerListData.banners,
    })
    // 获取推荐歌单数据
    let recommendListData = await request('/personalized', { limit: 10});
    this.setData({
      recommendList: recommendListData.result,
    })
    //获取排行榜数据
    let index = 0;
    let resultArr = [];
    while(index < 6) {
      let topListData = await request('/top/list', { idx: index++ });
      resultArr.push(topListData.playlist);
      //放在这里更新数据的话，每请求一次数据便更新一次数据，用户体验良好，但需要渲染的次数较多
      this.setData({
        topList: resultArr,
      })
    }
    //放在这里更新数据的话，要等六次网络请求加载完之后再更新数据，当用户网络不好时影响用户体验
  //   this.setData({
  //     topList: resultArr,
  //   })
  },
  //跳转至每日推荐页面的回调
  toRecommendSong() {
    wx.navigateTo({
      url: '/songPackage/pages/recommendSong/recommendSong',
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