import PubSub from 'pubsub-js'
import moment from 'moment'
import request from '../../../util/request'
//获取全局变量的实例
var appInstance = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isplay: false,//音乐是否在播放
    ids: '',//传递的id
    song: {},// 音乐详情数据
    musicLink: '',//音乐的播放链接
    currentTime: '00:00',//实时的时间
    durationTime: '00:00',//总时长
    currentWidth: 0,//实时进度条的宽度

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //options：用于接收路由跳转query传递过来的参数
    //原生小程序中路由传参,对参数的长度有限制，如果参数长度过长会自动截取掉
    let ids = options.ids
    this.setData({
      ids
    })
    this.getMusicDetail()
    //判断当前页面音乐是否在播放
    if(appInstance.globalData.ismusicplay && appInstance.globalData.musicId === ids){
      this.setData({
        isplay: true
      })
    }

    // 创建控制音乐播放的实例
    this.backgroundAudioManager = wx.getBackgroundAudioManager()
    //监视音乐播放/暂停/停止
    this.backgroundAudioManager.onPlay(() => {
      //修改音乐的状态
      this.changePlayState(true)
      //修改全局播放音乐的状态
      appInstance.globalData.musicId = ids
    })
    this.backgroundAudioManager.onPause(() => {
      //修改音乐的状态
      this.changePlayState(false)
    })
    this.backgroundAudioManager.onStop(() => {
      //修改音乐的状态
      this.changePlayState(false)
    })
    //用于监听音乐自然播放结束
    this.backgroundAudioManager.onEnded(() => {
      //自动切换到下一首音乐
      PubSub.publish('swichSong', 'next')
      //将实时进度条的长度还原为0
      this.setData({
        currentWidth: 0,
        currentTime: '00:00'
      })
    })
    //进入页面自动播放歌曲
    this.musicControl(true)

    //监听音乐实时播放的进度
    this.backgroundAudioManager.onTimeUpdate(() => {
      //格式化实时播放的时长时间
      let currentTime = moment(this.backgroundAudioManager.currentTime * 1000).format('mm:ss')
      let currentWidth = this.backgroundAudioManager.currentTime / this.backgroundAudioManager.duration * 450
      this.setData({
        currentTime,
        currentWidth
      })
    })
  },
  //修改播放状态的功能函数
  changePlayState (isplay){
    //修改音乐的状态
    this.setData({
      isplay
    })
    //修改全局播放音乐的状态
    appInstance.globalData.ismusicplay = isplay
  },
  //获取音乐详情的功能函数
  async getMusicDetail (){
    let ids = this.data.ids
    let MusicDetailData = await request('/song/detail',{ ids })
    //moment要求传入的是单位为毫秒的数据
    let durationTime = moment(MusicDetailData.songs[0].dt).format('mm:ss')
    this.setData({
      song: MusicDetailData.songs[0],
      durationTime
    })
    //动态修改页面的标题
    wx.setNavigationBarTitle({
      title: this.data.song.name
    })

  },
  //点击音乐播放/暂停的回调
  handleMusicPlay() {
    let { isplay,musicLink} = this.data;
    isplay = !isplay;
    // this.setData({
    //   isplay
    // })
    this.musicControl(isplay,musicLink)
  },
  //控制音乐播放/暂停的功能函数
  async musicControl(isplay,musicLink) {
    let ids = this.data.ids
    if(isplay){//播放音乐
      if(!musicLink){
        //获取音乐播放的连接
        let musicLinkData = await request('/song/url', { id: ids })
        musicLink = musicLinkData.data[0].url

        this.setData({
          musicLink
        })
      }
      //设置音乐播放的链接
      this.backgroundAudioManager.src = musicLink
      this.backgroundAudioManager.title = this.data.song.name
    }else{
      this.backgroundAudioManager.pause()
    }
  },
  //点击切歌的回调
  handleSwitch(event) {
    //获取切歌的类型：上一首/下一首
    let type= event.currentTarget.id
    //关闭当前音乐的播放
    this.backgroundAudioManager.stop()
    //订阅来自recommendSong的musicId消息数据
    PubSub.subscribe('musicId',(msg,musicId) => {
      this.setData({
        ids: musicId
      })
      //获取音乐详情数据
      this.getMusicDetail()
      //自动播放当前的音乐
      this.musicControl(true)
      //取消订阅
      PubSub.unsubscribe('musicId')
    })
    //发布消息数据给recommendSong页面
    PubSub.publish('switchSong', type)

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