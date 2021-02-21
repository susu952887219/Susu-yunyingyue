import request from '../../util/request.js'
let isSend = false;//函数节流使用
Page({

  /**
   * 页面的初始数据
   */
  data: {
    placeholderContent: '',//placeholder的内容
    hotList: [],//热搜榜数据
    searchContent: '',//搜索内容
    searchList: [], //关键字模糊匹配的数据
    historyList: [],//搜索历史记录

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getHotListData()
    this.getSearchHistory()
  },
  //获取初始化的数据
  async getHotListData() {
    let placeholderData = await request('/search/default');
    let hotListData = await request('/search/hot/detail')
    console.log(hotListData.data)
    this.setData({
      placeholderContent: placeholderData.data.showKeyword,
      hotList: hotListData.data
    })
  },
  //获取本地历史记录的功能函数
  getSearchHistory() {
    let historyList = wx.getStorageSync('searchHistory')
    if (historyList){
      this.setData({
        historyList
      })
    }
  },
  //表单项内容发生改变的回调
  handleInputChange (event) {
    this.setData({
      searchContent: event.detail.value.trim()
    })
    if(isSend){
      return
    }
    isSend = true;
    this.getSearchList()
    //函数节流
    setTimeout(() => {
      isSend = false;
    },300)
   },
  //获取搜索数据的功能函数
  async getSearchList (){
    if (!this.data.searchContent) {
      this.setData({
        searchList: []
      })
      return
    }
    let {searchContent,historyList} = this.data
    //发送请求获取关键字模糊匹配的数据
    let searchListData = await request('/search', { keywords: searchContent, limit: 10 })
    this.setData({
      searchList: searchListData.result.songs
    })

    //将搜索的关键字添加到搜索历史记录中
    if (historyList.indexOf(searchContent) === -1){
      historyList.unshift(searchContent);
    }else{
      historyList.splice(historyList.indexOf(searchContent),1)
      historyList.unshift(searchContent);
    }
    this.setData({
      historyList,
    })
    wx.setStorageSync('searchHistory', historyList)
  },
  //清空搜索记录
  clearSearchContent(){
    this.setData({
      searchContent: '',
      searchList: []
    })
  },
  //删除历史搜索记录
  deleteSearchHistory() {
    wx.showModal({
      content: '确认删除历史搜索记录？',
      success: (res) =>{
        if(res.confirm){
          //清除data中的historyList
          this.setData({
            historyList: []
          })
          //移除本地的历史记录缓存
          wx.removeStorageSync('searchHistory');

        }
      }
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