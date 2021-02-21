import request from '../../util/request.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    videoGroupList: [],//导航标签数据
    navId: '',//导航的标识
    videoList: [], //视频列表数据
    videoId: '',//视频id标识
    videoUpdateTime: [],// 记录video播放的时长
    isTriggered: false,//标识下拉刷新是否被触发

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getVideoGroupListData()
  },
  //获取导航标签数据方法
  async getVideoGroupListData() {
    let videovideoGroupListData = await request('/video/group/list')
    this.setData({
      videoGroupList: videovideoGroupListData.data.slice(0,15),
      navId: videovideoGroupListData.data[0].id
    })
    this.getVideoListData(this.data.navId)
    
  },
  //点击搜索音乐跳转到搜索界面
  toSearch() {
    wx.navigateTo({
      url: '/pages/search/search',
    })
  },
  //点击切换导航的回调
  changeNav (event){
    let navId = event.currentTarget.id // 通过id向event传参的时候，如果传入的是number，会自动转换成string
    this.setData({
      navId: parseInt(navId),
      videoList: [] //将旧的视频数据清空
    })
    //正在加载
    wx.showLoading({
      title: '正在加载'
    })
    //点击切换导航读取视频数据
    this.getVideoListData(this.data.navId)
  }, 
  //获取视频数据的方法
  async getVideoListData(navId) {
    let videoListData = await request('/video/group', { id : navId })
    console.log(videoListData)
    //视频数据读取完成，关闭正在加载提示框
    wx.hideLoading()
    //数组里面没有一个可以做id的唯一值时使用
    let index = 0;
    let videoList = videoListData.datas.map(item => {
      item.id = index ++;
      return item;
    })
    //更新视频数据列表
    this.setData({
      videoList,
      //关闭下拉刷新
      isTriggered: false,
    })
  },
  //点击播放视频的方法
  handlePlay(event){
    /*
    单例模式
    1.需要创建多个对象的场景下，通过一个变量接收，始终保持只有一个对象
    2.节省内存空间
     */
    let vid = event.currentTarget.id;
    //关闭上一个播放的视频
    // this.vid !== vid && this.videoContext && this.videoContext.stop();
    // this.vid = vid;
    //更新data中videoId的状态数据
    this.setData({
      videoId: vid
    })
    //控制video标签的实例对象
    this.videoContext = wx.createVideoContext(vid);
    //判断当前视频是否有播放记录
    let { videoUpdateTime } = this.data
    let videoItem = videoUpdateTime.find(item => item.vid === vid)
    if (videoItem){
      this.videoContext.seek(videoItem.currentTime)
    }
    this.videoContext.play()
  },
  //监听视频播放的进度条的回调
  handleTimeUpdate (event){
    let videoTimeObj = {
      vid: event.currentTarget.id,
      currentTime: event.detail.currentTime
    } 
    /*
    判断记录播放时长的videoUpdateTime中是否有当前视频的播放记录
    1. 如果有，则在原有的数据上修改当前的播放时间
    2. 如果没有，则需要在数组中添加当前的播放时间
    */
    let { videoUpdateTime } = this.data
    let videoItem = videoUpdateTime.find(item => item.vid ===videoTimeObj.vid)
    if (videoItem){//如果有
      videoItem.currentTime = event.detail.currentTime
    }else {//如果没有
      videoUpdateTime.push(videoTimeObj)
    }
    //更新数据
    this.setData({
      videoUpdateTime
    })

  },
  //视频播放结束的回调
  handleEnded(event) {
    let { videoUpdateTime } = this.data;
    videoUpdateTime.splice(videoUpdateTime.findIndex(item => item.vid === event.currentTarget.id),1)
    this.setData({
      videoUpdateTime
    })
  },
  //自定义下拉刷新的回调：针对scroll-view的方法
  handleRefresher() {
    //再次发送请求，获取最新的视频列表数据
    this.getVideoListData(this.data.navId)
  },
  //滑动到底部刷新的回调
  handleToLower() {
    //数据分页：1.后端分页 2.前端分页
    console.log('发送请求||在前端截取最新的数据 追加到视频列表后方')
    console.log('网易云音乐暂时没有提供分页的api')
    //模拟数据
    let newVideoList = [{
        "type": 1,
        "displayed": false,
        "alg": "onlineHotGroup",
        "extAlg": null,
        "data": {
          "alg": "onlineHotGroup",
          "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
          "threadId": "R_VI_62_525FA9C5A525169B3A7C959DCFF96F5D",
          "coverUrl": "https://p2.music.126.net/tmiQoaDJMbAZN6gKt0Pl8Q==/109951163720183217.jpg",
          "height": 1080,
          "width": 1920,
          "title": "罗志祥《精舞门》，这首歌听起来热血沸腾，亚洲舞王的称号不是盖",
          "description": "罗志祥《精舞门》，这首歌听起来热血沸腾，亚洲舞王的称号不是盖",
          "commentCount": 2525,
          "shareCount": 588,
          "resolutions": [
            {
              "resolution": 240,
              "size": 49422684
            },
            {
              "resolution": 480,
              "size": 135804865
            },
            {
              "resolution": 720,
              "size": 206496577
            },
            {
              "resolution": 1080,
              "size": 324396315
            }
          ],
          "creator": {
            "defaultAvatar": false,
            "province": 330000,
            "authStatus": 0,
            "followed": false,
            "avatarUrl": "http://p1.music.126.net/ygWgsfyGGQD8TDDrZzwG5g==/109951163650262938.jpg",
            "accountStatus": 0,
            "gender": 1,
            "city": 330100,
            "birthday": 844272000000,
            "userId": 1664436531,
            "userType": 0,
            "nickname": "音乐点",
            "signature": "投诉建议微博@音乐点",
            "description": "",
            "detailDescription": "",
            "avatarImgId": 109951163650262940,
            "backgroundImgId": 109951162868126480,
            "backgroundUrl": "http://p1.music.126.net/_f8R60U9mZ42sSNvdPn2sQ==/109951162868126486.jpg",
            "authority": 0,
            "mutual": false,
            "expertTags": null,
            "experts": {
              "1": "视频达人(欧美、华语、音乐现场)"
            },
            "djStatus": 0,
            "vipType": 0,
            "remarkName": null,
            "backgroundImgIdStr": "109951162868126486",
            "avatarImgIdStr": "109951163650262938",
            "avatarImgId_str": "109951163650262938"
          },
          "urlInfo": {
            "id": "525FA9C5A525169B3A7C959DCFF96F5D",
            "url": "http://vodkgeyttp9.vod.126.net/cloudmusic/90e77c47d2f5b8bf5ac9c28b683bfaca.mp4?ts=1612780704&rid=85B12F3F731EA51571EF17E1AEB9662C&rl=3&rs=rZKudJZdvnnmatDrAhoNYbVepMFHPnVh&sign=f25bd6c912550bdb2976bc637aca5688&ext=rmj3Js2bmpsmxJWLg6ggDvDW%2F6eUmekOJqoV%2BrBEznj7aqWQrdFz3F6C1sNPHjwVCJ%2BtLpA44m6XY9m%2B2HR%2BeLd5RyFAIDc0%2Fj%2BNCodRty39WhHtiDRzFlS%2BthG5P3nCC%2BpFI4XR10dnUYmznH7I3IUSf4MMmMkaUCA9EE6sfn2EJ7llhg3gf7kVlOVmM17Wn508sov79eKqFTNbnDYl121q6fBuMOUi3hD6VEl5M8G3FDj%2FR50Dc6qDA2d8up%2Bk",
            "size": 324396315,
            "validityTime": 1200,
            "needPay": false,
            "payInfo": null,
            "r": 1080
          },
          "videoGroup": [
            {
              "id": -15008,
              "name": "#极限挑战第一季BGM 原创歌单#",
              "alg": "groupTagRank"
            },
            {
              "id": 149124,
              "name": "罗志祥",
              "alg": "groupTagRank"
            },
            {
              "id": 58104,
              "name": "音乐节",
              "alg": "groupTagRank"
            },
            {
              "id": 59101,
              "name": "华语现场",
              "alg": "groupTagRank"
            },
            {
              "id": 57108,
              "name": "流行现场",
              "alg": "groupTagRank"
            },
            {
              "id": 1101,
              "name": "舞蹈",
              "alg": "groupTagRank"
            },
            {
              "id": 1100,
              "name": "音乐现场",
              "alg": "groupTagRank"
            },
            {
              "id": 58100,
              "name": "现场",
              "alg": "groupTagRank"
            },
            {
              "id": 5100,
              "name": "音乐",
              "alg": "groupTagRank"
            }
          ],
          "previewUrl": null,
          "previewDurationms": 0,
          "hasRelatedGameAd": false,
          "markTypes": null,
          "relateSong": [
            {
              "name": "精舞门",
              "id": 110477,
              "pst": 0,
              "t": 0,
              "ar": [
                {
                  "id": 3694,
                  "name": "罗志祥",
                  "tns": [],
                  "alias": []
                }
              ],
              "alia": [],
              "pop": 95,
              "st": 0,
              "rt": "600902000007955285",
              "fee": 1,
              "v": 29,
              "crbt": null,
              "cf": "",
              "al": {
                "id": 10929,
                "name": "Speshow",
                "picUrl": "http://p4.music.126.net/f90p4cISTb7HA_OZk7g0gg==/109951164090130753.jpg",
                "tns": [],
                "pic_str": "109951164090130753",
                "pic": 109951164090130750
              },
              "dt": 223680,
              "h": {
                "br": 320000,
                "fid": 0,
                "size": 8949595,
                "vd": -62910
              },
              "m": {
                "br": 192000,
                "fid": 0,
                "size": 5369774,
                "vd": -60415
              },
              "l": {
                "br": 128000,
                "fid": 0,
                "size": 3579864,
                "vd": -58905
              },
              "a": null,
              "cd": "1",
              "no": 1,
              "rtUrl": null,
              "ftype": 0,
              "rtUrls": [],
              "djId": 0,
              "copyright": 2,
              "s_id": 0,
              "mst": 9,
              "cp": 1416096,
              "mv": 413047,
              "rtype": 0,
              "rurl": null,
              "publishTime": 1162310400000,
              "privilege": {
                "id": 110477,
                "fee": 1,
                "payed": 0,
                "st": 0,
                "pl": 0,
                "dl": 0,
                "sp": 0,
                "cp": 0,
                "subp": 0,
                "cs": false,
                "maxbr": 999000,
                "fl": 0,
                "toast": false,
                "flag": 1092,
                "preSell": false
              }
            }
          ],
          "relatedInfo": null,
          "videoUserLiveInfo": null,
          "vid": "525FA9C5A525169B3A7C959DCFF96F5D",
          "durationms": 267146,
          "playTime": 3693711,
          "praisedCount": 14228,
          "praised": false,
          "subscribed": false
        }
      },
      {
        "type": 1,
        "displayed": false,
        "alg": "onlineHotGroup",
        "extAlg": null,
        "data": {
          "alg": "onlineHotGroup",
          "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
          "threadId": "R_VI_62_D802F6D755264A3A61825A76DDBB5140",
          "coverUrl": "https://p2.music.126.net/yui8RkDZoj-jMtXRJ5aMgQ==/109951163905669976.jpg",
          "height": 1080,
          "width": 1920,
          "title": "最近唱《富士山下》的小姐姐火了！又是被天使吻过的嗓子",
          "description": "最近街头唱《富士山下》的小姐姐火了！果然又是被天使吻过的嗓子",
          "commentCount": 969,
          "shareCount": 1120,
          "resolutions": [
            {
              "resolution": 240,
              "size": 19834849
            },
            {
              "resolution": 480,
              "size": 39027773
            },
            {
              "resolution": 720,
              "size": 49581633
            },
            {
              "resolution": 1080,
              "size": 95529424
            }
          ],
          "creator": {
            "defaultAvatar": false,
            "province": 370000,
            "authStatus": 0,
            "followed": false,
            "avatarUrl": "http://p1.music.126.net/fusihUiQmWVoRFds8v5yEw==/109951163819661485.jpg",
            "accountStatus": 0,
            "gender": 1,
            "city": 370800,
            "birthday": 788716800000,
            "userId": 1742136054,
            "userType": 204,
            "nickname": "咖啡影音",
            "signature": "喧嚣的生活需要音乐洗涤不安的灵魂",
            "description": "",
            "detailDescription": "",
            "avatarImgId": 109951163819661490,
            "backgroundImgId": 109951162868128400,
            "backgroundUrl": "http://p1.music.126.net/2zSNIqTcpHL2jIvU6hG0EA==/109951162868128395.jpg",
            "authority": 0,
            "mutual": false,
            "expertTags": null,
            "experts": {
              "1": "音乐视频达人"
            },
            "djStatus": 0,
            "vipType": 11,
            "remarkName": null,
            "backgroundImgIdStr": "109951162868128395",
            "avatarImgIdStr": "109951163819661485",
            "avatarImgId_str": "109951163819661485"
          },
          "urlInfo": {
            "id": "D802F6D755264A3A61825A76DDBB5140",
            "url": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/KOMUmVfG_2345636648_uhd.mp4?ts=1612780704&rid=85B12F3F731EA51571EF17E1AEB9662C&rl=3&rs=tGuFRurMIbEFNlsZaAyuxKYHFquYSsTJ&sign=872ae95559b21cbd724bef3e7ebad859&ext=rmj3Js2bmpsmxJWLg6ggDvDW%2F6eUmekOJqoV%2BrBEznj7aqWQrdFz3F6C1sNPHjwVCJ%2BtLpA44m6XY9m%2B2HR%2BeLd5RyFAIDc0%2Fj%2BNCodRty39WhHtiDRzFlS%2BthG5P3nCC%2BpFI4XR10dnUYmznH7I3IUSf4MMmMkaUCA9EE6sfn2EJ7llhg3gf7kVlOVmM17Wn508sov79eKqFTNbnDYl121q6fBuMOUi3hD6VEl5M8Gvq78UsAiEuKd%2BFVQhazWu",
            "size": 95529424,
            "validityTime": 1200,
            "needPay": false,
            "payInfo": null,
            "r": 1080
          },
          "videoGroup": [
            {
              "id": 59106,
              "name": "街头表演",
              "alg": "groupTagRank"
            },
            {
              "id": 15102,
              "name": "华语音乐",
              "alg": "groupTagRank"
            },
            {
              "id": 12100,
              "name": "流行",
              "alg": "groupTagRank"
            },
            {
              "id": 23116,
              "name": "音乐推荐",
              "alg": "groupTagRank"
            },
            {
              "id": 1100,
              "name": "音乐现场",
              "alg": "groupTagRank"
            },
            {
              "id": 58100,
              "name": "现场",
              "alg": "groupTagRank"
            },
            {
              "id": 5100,
              "name": "音乐",
              "alg": "groupTagRank"
            }
          ],
          "previewUrl": null,
          "previewDurationms": 0,
          "hasRelatedGameAd": false,
          "markTypes": null,
          "relateSong": [],
          "relatedInfo": null,
          "videoUserLiveInfo": null,
          "vid": "D802F6D755264A3A61825A76DDBB5140",
          "durationms": 207744,
          "playTime": 5207272,
          "praisedCount": 20837,
          "praised": false,
          "subscribed": false
        }
      },
      {
        "type": 1,
        "displayed": false,
        "alg": "onlineHotGroup",
        "extAlg": null,
        "data": {
          "alg": "onlineHotGroup",
          "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
          "threadId": "R_VI_62_C8D4CE25872E772D9A5E6F202C9E36F8",
          "coverUrl": "https://p2.music.126.net/Jz4pCTbYajxw3pA6MyEQIg==/109951164059609626.jpg",
          "height": 1080,
          "width": 1920,
          "title": "迈克尔·杰克逊封神之作！终于找到了这现场版，场面太壮观了",
          "description": null,
          "commentCount": 65,
          "shareCount": 162,
          "resolutions": [
            {
              "resolution": 240,
              "size": 27955327
            },
            {
              "resolution": 480,
              "size": 44959692
            },
            {
              "resolution": 720,
              "size": 63582287
            },
            {
              "resolution": 1080,
              "size": 129294997
            }
          ],
          "creator": {
            "defaultAvatar": false,
            "province": 110000,
            "authStatus": 0,
            "followed": false,
            "avatarUrl": "http://p1.music.126.net/yWQieIcccog6GW9W65N6VQ==/109951164162893023.jpg",
            "accountStatus": 0,
            "gender": 0,
            "city": 110101,
            "birthday": -2209017600000,
            "userId": 1471220191,
            "userType": 0,
            "nickname": "耳朵听了会怀孕啊",
            "signature": "",
            "description": "",
            "detailDescription": "",
            "avatarImgId": 109951164162893020,
            "backgroundImgId": 109951162868126480,
            "backgroundUrl": "http://p1.music.126.net/_f8R60U9mZ42sSNvdPn2sQ==/109951162868126486.jpg",
            "authority": 0,
            "mutual": false,
            "expertTags": null,
            "experts": {
              "1": "泛生活视频达人"
            },
            "djStatus": 0,
            "vipType": 0,
            "remarkName": null,
            "backgroundImgIdStr": "109951162868126486",
            "avatarImgIdStr": "109951164162893023",
            "avatarImgId_str": "109951164162893023"
          },
          "urlInfo": {
            "id": "C8D4CE25872E772D9A5E6F202C9E36F8",
            "url": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/eQAAjSPO_2441043261_uhd.mp4?ts=1612780704&rid=85B12F3F731EA51571EF17E1AEB9662C&rl=3&rs=GJXkUkriBQjSZalNhegGUzAOaVPYecvx&sign=faed6d46ccca9d758bedd01439e7d03b&ext=rmj3Js2bmpsmxJWLg6ggDvDW%2F6eUmekOJqoV%2BrBEznj7aqWQrdFz3F6C1sNPHjwVCJ%2BtLpA44m6XY9m%2B2HR%2BeLd5RyFAIDc0%2Fj%2BNCodRty39WhHtiDRzFlS%2BthG5P3nCC%2BpFI4XR10dnUYmznH7I3IUSf4MMmMkaUCA9EE6sfn2EJ7llhg3gf7kVlOVmM17Wn508sov79eKqFTNbnDYl121q6fBuMOUi3hD6VEl5M8Gvq78UsAiEuKd%2BFVQhazWu",
            "size": 129294997,
            "validityTime": 1200,
            "needPay": false,
            "payInfo": null,
            "r": 1080
          },
          "videoGroup": [
            {
              "id": 9102,
              "name": "演唱会",
              "alg": "groupTagRank"
            },
            {
              "id": 57106,
              "name": "欧美现场",
              "alg": "groupTagRank"
            },
            {
              "id": 1100,
              "name": "音乐现场",
              "alg": "groupTagRank"
            },
            {
              "id": 58100,
              "name": "现场",
              "alg": "groupTagRank"
            },
            {
              "id": 5100,
              "name": "音乐",
              "alg": "groupTagRank"
            }
          ],
          "previewUrl": null,
          "previewDurationms": 0,
          "hasRelatedGameAd": false,
          "markTypes": null,
          "relateSong": [],
          "relatedInfo": null,
          "videoUserLiveInfo": null,
          "vid": "C8D4CE25872E772D9A5E6F202C9E36F8",
          "durationms": 255488,
          "playTime": 231896,
          "praisedCount": 1129,
          "praised": false,
          "subscribed": false
        }
      },
      {
        "type": 1,
        "displayed": false,
        "alg": "onlineHotGroup",
        "extAlg": null,
        "data": {
          "alg": "onlineHotGroup",
          "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
          "threadId": "R_VI_62_363355F49859EB8455FBC2DC4FC611EF",
          "coverUrl": "https://p2.music.126.net/8WFJYmntLsu0wJGI29hxsg==/109951164126598893.jpg",
          "height": 720,
          "width": 1024,
          "title": "我们的歌谣 - 凤凰传奇",
          "description": null,
          "commentCount": 118,
          "shareCount": 683,
          "resolutions": [
            {
              "resolution": 240,
              "size": 25450771
            },
            {
              "resolution": 480,
              "size": 43319856
            },
            {
              "resolution": 720,
              "size": 52972856
            }
          ],
          "creator": {
            "defaultAvatar": false,
            "province": 1000000,
            "authStatus": 0,
            "followed": false,
            "avatarUrl": "http://p1.music.126.net/ev54SJVfF8cvJMcyDF3Qpg==/109951165646788734.jpg",
            "accountStatus": 0,
            "gender": 1,
            "city": 1010000,
            "birthday": 708182898737,
            "userId": 72233931,
            "userType": 200,
            "nickname": "呆萌DamonLi",
            "signature": "人生不能太过圆满，求而不得未必是遗憾",
            "description": "",
            "detailDescription": "",
            "avatarImgId": 109951165646788740,
            "backgroundImgId": 109951165646795620,
            "backgroundUrl": "http://p1.music.126.net/Q3J4_1TZOsPZPaj-gF_-ow==/109951165646795619.jpg",
            "authority": 0,
            "mutual": false,
            "expertTags": [
              "影视原声"
            ],
            "experts": {
              "1": "影视视频达人",
              "2": "影视图文达人"
            },
            "djStatus": 10,
            "vipType": 0,
            "remarkName": null,
            "backgroundImgIdStr": "109951165646795619",
            "avatarImgIdStr": "109951165646788734",
            "avatarImgId_str": "109951165646788734"
          },
          "urlInfo": {
            "id": "363355F49859EB8455FBC2DC4FC611EF",
            "url": "http://vodkgeyttp9.vod.126.net/cloudmusic/ZTIUUTCz_2536284979_shd.mp4?ts=1612780704&rid=85B12F3F731EA51571EF17E1AEB9662C&rl=3&rs=nLUUNunGZNSdjVuaRLeepfFeTzVPgJxz&sign=03c94924ca7373e9c98ad9d3330a12e0&ext=rmj3Js2bmpsmxJWLg6ggDvDW%2F6eUmekOJqoV%2BrBEznj7aqWQrdFz3F6C1sNPHjwVCJ%2BtLpA44m6XY9m%2B2HR%2BeLd5RyFAIDc0%2Fj%2BNCodRty39WhHtiDRzFlS%2BthG5P3nCC%2BpFI4XR10dnUYmznH7I3IUSf4MMmMkaUCA9EE6sfn2EJ7llhg3gf7kVlOVmM17Wn508sov79eKqFTNbnDYl121q6fBuMOUi3hD6VEl5M8Gvq78UsAiEuKd%2BFVQhazWu",
            "size": 52972856,
            "validityTime": 1200,
            "needPay": false,
            "payInfo": null,
            "r": 720
          },
          "videoGroup": [
            {
              "id": 57108,
              "name": "流行现场",
              "alg": "groupTagRank"
            },
            {
              "id": 1100,
              "name": "音乐现场",
              "alg": "groupTagRank"
            },
            {
              "id": 58100,
              "name": "现场",
              "alg": "groupTagRank"
            },
            {
              "id": 5100,
              "name": "音乐",
              "alg": "groupTagRank"
            }
          ],
          "previewUrl": null,
          "previewDurationms": 0,
          "hasRelatedGameAd": false,
          "markTypes": null,
          "relateSong": [],
          "relatedInfo": null,
          "videoUserLiveInfo": null,
          "vid": "363355F49859EB8455FBC2DC4FC611EF",
          "durationms": 294964,
          "playTime": 380654,
          "praisedCount": 1467,
          "praised": false,
          "subscribed": false
        }
      },
      {
        "type": 1,
        "displayed": false,
        "alg": "onlineHotGroup",
        "extAlg": null,
        "data": {
          "alg": "onlineHotGroup",
          "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
          "threadId": "R_VI_62_A8C1653D9CD529315B31F1D8AA710559",
          "coverUrl": "https://p2.music.126.net/r8aRs7fNNcSC5XuplPrhoA==/109951164491835186.jpg",
          "height": 360,
          "width": 640,
          "title": "千年唐琴“九霄环佩”的声音竟然是这样：李祥霆 - 流水",
          "description": "千年古琴，名曰“九霄环佩”，自清末以来即为古琴家所仰慕的重器、被视为“鼎鼎唐物”和“仙品”。价值高达4亿人民币，古琴时过千年，曾一度被认为“音质不好”，不适合弹奏，历经周折，名琴终于找到能够驾驭自己的名家，他就是中国琴会会长、中央音乐学院教授、著名古琴演奏家李祥霆。",
          "commentCount": 258,
          "shareCount": 561,
          "resolutions": [
            {
              "resolution": 240,
              "size": 19290011
            }
          ],
          "creator": {
            "defaultAvatar": false,
            "province": 110000,
            "authStatus": 0,
            "followed": false,
            "avatarUrl": "http://p1.music.126.net/6kQkj_OUZ-HaSJAGLMMg5w==/109951165705817525.jpg",
            "accountStatus": 0,
            "gender": 1,
            "city": 110101,
            "birthday": 713376000000,
            "userId": 61227051,
            "userType": 0,
            "nickname": "Dr-D-Johnan",
            "signature": "喜欢音乐美学的都关注一下吧，偶尔会写一些专栏",
            "description": "",
            "detailDescription": "",
            "avatarImgId": 109951165705817520,
            "backgroundImgId": 109951165559921950,
            "backgroundUrl": "http://p1.music.126.net/bXLAy4lVXAJ8jCErd3ENkQ==/109951165559921946.jpg",
            "authority": 0,
            "mutual": false,
            "expertTags": null,
            "experts": null,
            "djStatus": 0,
            "vipType": 0,
            "remarkName": null,
            "backgroundImgIdStr": "109951165559921946",
            "avatarImgIdStr": "109951165705817525",
            "avatarImgId_str": "109951165705817525"
          },
          "urlInfo": {
            "id": "A8C1653D9CD529315B31F1D8AA710559",
            "url": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/x7BCIica_2791022631_sd.mp4?ts=1612780704&rid=85B12F3F731EA51571EF17E1AEB9662C&rl=3&rs=MkFmazqFDqVjJddjfpOckxfrGtMLnoKE&sign=35a906a3c5fd7315d609423a673224a3&ext=rmj3Js2bmpsmxJWLg6ggDvDW%2F6eUmekOJqoV%2BrBEznj7aqWQrdFz3F6C1sNPHjwVCJ%2BtLpA44m6XY9m%2B2HR%2BeLd5RyFAIDc0%2Fj%2BNCodRty39WhHtiDRzFlS%2BthG5P3nCC%2BpFI4XR10dnUYmznH7I3IUSf4MMmMkaUCA9EE6sfn2EJ7llhg3gf7kVlOVmM17Wn508sov79eKqFTNbnDYl121q6fBuMOUi3hD6VEl5M8Gvq78UsAiEuKd%2BFVQhazWu",
            "size": 19290011,
            "validityTime": 1200,
            "needPay": false,
            "payInfo": null,
            "r": 240
          },
          "videoGroup": [
            {
              "id": 1100,
              "name": "音乐现场",
              "alg": "groupTagRank"
            },
            {
              "id": 58100,
              "name": "现场",
              "alg": "groupTagRank"
            },
            {
              "id": 5100,
              "name": "音乐",
              "alg": "groupTagRank"
            }
          ],
          "previewUrl": null,
          "previewDurationms": 0,
          "hasRelatedGameAd": false,
          "markTypes": null,
          "relateSong": [],
          "relatedInfo": null,
          "videoUserLiveInfo": null,
          "vid": "A8C1653D9CD529315B31F1D8AA710559",
          "durationms": 315920,
          "playTime": 314042,
          "praisedCount": 2190,
          "praised": false,
          "subscribed": false
        }
      },
      {
        "type": 1,
        "displayed": false,
        "alg": "onlineHotGroup",
        "extAlg": null,
        "data": {
          "alg": "onlineHotGroup",
          "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
          "threadId": "R_VI_62_8EE0E3B58AF5BBFB2B7E597D1D784F4F",
          "coverUrl": "https://p2.music.126.net/gQguOamD5pxhyoRIiiv28A==/109951163655242359.jpg",
          "height": 540,
          "width": 1050,
          "title": "终于找到了这首歌的现场，听一遍就被惊艳到的歌声！当年风靡亚洲",
          "description": null,
          "commentCount": 326,
          "shareCount": 704,
          "resolutions": [
            {
              "resolution": 240,
              "size": 15060338
            },
            {
              "resolution": 480,
              "size": 27223751
            }
          ],
          "creator": {
            "defaultAvatar": false,
            "province": 110000,
            "authStatus": 0,
            "followed": false,
            "avatarUrl": "http://p1.music.126.net/yWQieIcccog6GW9W65N6VQ==/109951164162893023.jpg",
            "accountStatus": 0,
            "gender": 0,
            "city": 110101,
            "birthday": -2209017600000,
            "userId": 1471220191,
            "userType": 0,
            "nickname": "耳朵听了会怀孕啊",
            "signature": "",
            "description": "",
            "detailDescription": "",
            "avatarImgId": 109951164162893020,
            "backgroundImgId": 109951162868126480,
            "backgroundUrl": "http://p1.music.126.net/_f8R60U9mZ42sSNvdPn2sQ==/109951162868126486.jpg",
            "authority": 0,
            "mutual": false,
            "expertTags": null,
            "experts": {
              "1": "泛生活视频达人"
            },
            "djStatus": 0,
            "vipType": 0,
            "remarkName": null,
            "backgroundImgIdStr": "109951162868126486",
            "avatarImgIdStr": "109951164162893023",
            "avatarImgId_str": "109951164162893023"
          },
          "urlInfo": {
            "id": "8EE0E3B58AF5BBFB2B7E597D1D784F4F",
            "url": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/FjAhhrJY_2108357181_hd.mp4?ts=1612780704&rid=85B12F3F731EA51571EF17E1AEB9662C&rl=3&rs=EOKLnMstSShlDGfJKWVtdGrHwDdeeTqz&sign=858f5a4e3b7b1ae72bc88efa278e6380&ext=rmj3Js2bmpsmxJWLg6ggDvDW%2F6eUmekOJqoV%2BrBEznj7aqWQrdFz3F6C1sNPHjwVCJ%2BtLpA44m6XY9m%2B2HR%2BeLd5RyFAIDc0%2Fj%2BNCodRty39WhHtiDRzFlS%2BthG5P3nCC%2BpFI4XR10dnUYmznH7I3IUSf4MMmMkaUCA9EE6sfn2EJ7llhg3gf7kVlOVmM17Wn508sov79eKqFTNbnDYl121q6fBuMOUi3hD6VEl5M8Gvq78UsAiEuKd%2BFVQhazWu",
            "size": 27223751,
            "validityTime": 1200,
            "needPay": false,
            "payInfo": null,
            "r": 480
          },
          "videoGroup": [
            {
              "id": 57107,
              "name": "韩语现场",
              "alg": "groupTagRank"
            },
            {
              "id": 59108,
              "name": "巡演现场",
              "alg": "groupTagRank"
            },
            {
              "id": 57108,
              "name": "流行现场",
              "alg": "groupTagRank"
            },
            {
              "id": 1100,
              "name": "音乐现场",
              "alg": "groupTagRank"
            },
            {
              "id": 58100,
              "name": "现场",
              "alg": "groupTagRank"
            },
            {
              "id": 5100,
              "name": "音乐",
              "alg": "groupTagRank"
            }
          ],
          "previewUrl": null,
          "previewDurationms": 0,
          "hasRelatedGameAd": false,
          "markTypes": null,
          "relateSong": [],
          "relatedInfo": null,
          "videoUserLiveInfo": null,
          "vid": "8EE0E3B58AF5BBFB2B7E597D1D784F4F",
          "durationms": 179754,
          "playTime": 1634227,
          "praisedCount": 4727,
          "praised": false,
          "subscribed": false
        }
      },
      {
        "type": 1,
        "displayed": false,
        "alg": "onlineHotGroup",
        "extAlg": null,
        "data": {
          "alg": "onlineHotGroup",
          "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
          "threadId": "R_VI_62_93C74D2EA2012AEFB937662440E7CA3C",
          "coverUrl": "https://p2.music.126.net/O5UuUvfgUQJYXfYauScemQ==/109951163781446878.jpg",
          "height": 720,
          "width": 1280,
          "title": "华晨宇《齐天大圣》消音现场版",
          "description": "仅为安利路人，勿喷。",
          "commentCount": 294,
          "shareCount": 549,
          "resolutions": [
            {
              "resolution": 240,
              "size": 36748129
            },
            {
              "resolution": 480,
              "size": 62507309
            },
            {
              "resolution": 720,
              "size": 92845717
            }
          ],
          "creator": {
            "defaultAvatar": false,
            "province": 420000,
            "authStatus": 0,
            "followed": false,
            "avatarUrl": "http://p1.music.126.net/Qrq-lt_nFN1Z6JtZruBVRQ==/109951165594519105.jpg",
            "accountStatus": 0,
            "gender": 1,
            "city": 421100,
            "birthday": 878016138731,
            "userId": 100570387,
            "userType": 0,
            "nickname": "差太多先生_",
            "signature": "一生只为爱一个人",
            "description": "",
            "detailDescription": "",
            "avatarImgId": 109951165594519100,
            "backgroundImgId": 109951164792632700,
            "backgroundUrl": "http://p1.music.126.net/rdpJ1n2bcA5cGdPprnr4UA==/109951164792632707.jpg",
            "authority": 0,
            "mutual": false,
            "expertTags": null,
            "experts": null,
            "djStatus": 10,
            "vipType": 11,
            "remarkName": null,
            "backgroundImgIdStr": "109951164792632707",
            "avatarImgIdStr": "109951165594519105",
            "avatarImgId_str": "109951165594519105"
          },
          "urlInfo": {
            "id": "93C74D2EA2012AEFB937662440E7CA3C",
            "url": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/RgBErHQZ_2237580947_shd.mp4?ts=1612780704&rid=85B12F3F731EA51571EF17E1AEB9662C&rl=3&rs=ZTUqLZBFzuYxInFmzjPHMogZPjzsClGn&sign=0fcc5ea23da59cbb5fd5624b7563e81e&ext=rmj3Js2bmpsmxJWLg6ggDvDW%2F6eUmekOJqoV%2BrBEznj7aqWQrdFz3F6C1sNPHjwVCJ%2BtLpA44m6XY9m%2B2HR%2BeLd5RyFAIDc0%2Fj%2BNCodRty39WhHtiDRzFlS%2BthG5P3nCC%2BpFI4XR10dnUYmznH7I3IUSf4MMmMkaUCA9EE6sfn2EJ7llhg3gf7kVlOVmM17Wn508sov79eKqFTNbnDYl121q6fBuMOUi3hD6VEl5M8Gvq78UsAiEuKd%2BFVQhazWu",
            "size": 92845717,
            "validityTime": 1200,
            "needPay": false,
            "payInfo": null,
            "r": 720
          },
          "videoGroup": [
            {
              "id": -31162,
              "name": "#「作曲：华晨宇」#",
              "alg": "groupTagRank"
            },
            {
              "id": 23118,
              "name": "华晨宇",
              "alg": "groupTagRank"
            },
            {
              "id": 59101,
              "name": "华语现场",
              "alg": "groupTagRank"
            },
            {
              "id": 59108,
              "name": "巡演现场",
              "alg": "groupTagRank"
            },
            {
              "id": 1100,
              "name": "音乐现场",
              "alg": "groupTagRank"
            },
            {
              "id": 58100,
              "name": "现场",
              "alg": "groupTagRank"
            },
            {
              "id": 5100,
              "name": "音乐",
              "alg": "groupTagRank"
            }
          ],
          "previewUrl": null,
          "previewDurationms": 0,
          "hasRelatedGameAd": false,
          "markTypes": null,
          "relateSong": [],
          "relatedInfo": null,
          "videoUserLiveInfo": null,
          "vid": "93C74D2EA2012AEFB937662440E7CA3C",
          "durationms": 252075,
          "playTime": 708798,
          "praisedCount": 6659,
          "praised": false,
          "subscribed": false
        }
      },
      {
        "type": 1,
        "displayed": false,
        "alg": "onlineHotGroup",
        "extAlg": null,
        "data": {
          "alg": "onlineHotGroup",
          "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
          "threadId": "R_VI_62_2BF7324F22608D89C4FBA31798BDBF3B",
          "coverUrl": "https://p2.music.126.net/aUARJa8pm5DDM0eiFR-fPQ==/109951163573475984.jpg",
          "height": 1080,
          "width": 1920,
          "title": "当街头响起Imagine这首史上最伟大歌曲之一时，警察都前来欣赏。",
          "description": "当街头响起 Imagine 这首史上最伟大歌曲之一时，警察都前来欣赏。",
          "commentCount": 2254,
          "shareCount": 2906,
          "resolutions": [
            {
              "resolution": 240,
              "size": 35537769
            },
            {
              "resolution": 480,
              "size": 61755592
            },
            {
              "resolution": 720,
              "size": 91418705
            },
            {
              "resolution": 1080,
              "size": 153059934
            }
          ],
          "creator": {
            "defaultAvatar": false,
            "province": 450000,
            "authStatus": 0,
            "followed": false,
            "avatarUrl": "http://p1.music.126.net/lVTaNtFdNVh2HhD0ORhAaA==/109951163601870551.jpg",
            "accountStatus": 0,
            "gender": 1,
            "city": 450100,
            "birthday": 692121600000,
            "userId": 255096203,
            "userType": 0,
            "nickname": "John_分享",
            "signature": "用音乐点缀怒放的生命。",
            "description": "",
            "detailDescription": "",
            "avatarImgId": 109951163601870540,
            "backgroundImgId": 109951163285208750,
            "backgroundUrl": "http://p1.music.126.net/lpOxaFlD6ems9969KHltcg==/109951163285208749.jpg",
            "authority": 0,
            "mutual": false,
            "expertTags": null,
            "experts": {
              "1": "音乐视频达人"
            },
            "djStatus": 10,
            "vipType": 0,
            "remarkName": null,
            "backgroundImgIdStr": "109951163285208749",
            "avatarImgIdStr": "109951163601870551",
            "avatarImgId_str": "109951163601870551"
          },
          "urlInfo": {
            "id": "2BF7324F22608D89C4FBA31798BDBF3B",
            "url": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/z1EYLUFH_1576597192_uhd.mp4?ts=1612780704&rid=85B12F3F731EA51571EF17E1AEB9662C&rl=3&rs=GIuWDdQfFLiiBGqZPAOlVomeBLirdPrU&sign=9f949ec555d75c79976bffdc5779b46c&ext=rmj3Js2bmpsmxJWLg6ggDvDW%2F6eUmekOJqoV%2BrBEznj7aqWQrdFz3F6C1sNPHjwVCJ%2BtLpA44m6XY9m%2B2HR%2BeLd5RyFAIDc0%2Fj%2BNCodRty39WhHtiDRzFlS%2BthG5P3nCC%2BpFI4XR10dnUYmznH7I3IUSf4MMmMkaUCA9EE6sfn2EJ7llhg3gf7kVlOVmM17Wn508sov79eKqFTNbnDYl121q6fBuMOUi3hD6VEl5M8Gvq78UsAiEuKd%2BFVQhazWu",
            "size": 153059934,
            "validityTime": 1200,
            "needPay": false,
            "payInfo": null,
            "r": 1080
          },
          "videoGroup": [
            {
              "id": -8010,
              "name": "#999+评论#",
              "alg": "groupTagRank"
            },
            {
              "id": 59106,
              "name": "街头表演",
              "alg": "groupTagRank"
            },
            {
              "id": 14242,
              "name": "伤感",
              "alg": "groupTagRank"
            },
            {
              "id": 14212,
              "name": "欧美音乐",
              "alg": "groupTagRank"
            },
            {
              "id": 12100,
              "name": "流行",
              "alg": "groupTagRank"
            },
            {
              "id": 23116,
              "name": "音乐推荐",
              "alg": "groupTagRank"
            },
            {
              "id": 1100,
              "name": "音乐现场",
              "alg": "groupTagRank"
            },
            {
              "id": 58100,
              "name": "现场",
              "alg": "groupTagRank"
            },
            {
              "id": 5100,
              "name": "音乐",
              "alg": "groupTagRank"
            }
          ],
          "previewUrl": null,
          "previewDurationms": 0,
          "hasRelatedGameAd": false,
          "markTypes": null,
          "relateSong": [
            {
              "name": "Imagine",
              "id": 26961953,
              "pst": 0,
              "t": 0,
              "ar": [
                {
                  "id": 35333,
                  "name": "John Lennon",
                  "tns": [],
                  "alias": []
                }
              ],
              "alia": [],
              "pop": 100,
              "st": 0,
              "rt": "",
              "fee": 8,
              "v": 8,
              "crbt": null,
              "cf": "",
              "al": {
                "id": 2576598,
                "name": "Remember",
                "picUrl": "http://p3.music.126.net/_jlw8clvDpHLNLVjSCP8zA==/5726256557541976.jpg",
                "tns": [],
                "pic": 5726256557541976
              },
              "dt": 183000,
              "h": {
                "br": 320000,
                "fid": 0,
                "size": 7344740,
                "vd": -4900
              },
              "m": {
                "br": 192000,
                "fid": 0,
                "size": 4406905,
                "vd": -2300
              },
              "l": {
                "br": 128000,
                "fid": 0,
                "size": 2937988,
                "vd": -600
              },
              "a": null,
              "cd": "1",
              "no": 10,
              "rtUrl": null,
              "ftype": 0,
              "rtUrls": [],
              "djId": 0,
              "copyright": 1,
              "s_id": 0,
              "mst": 9,
              "cp": 655010,
              "mv": 503077,
              "rtype": 0,
              "rurl": null,
              "publishTime": 1225814400007,
              "privilege": {
                "id": 26961953,
                "fee": 8,
                "payed": 0,
                "st": 0,
                "pl": 128000,
                "dl": 0,
                "sp": 7,
                "cp": 1,
                "subp": 1,
                "cs": false,
                "maxbr": 320000,
                "fl": 128000,
                "toast": false,
                "flag": 256,
                "preSell": false
              }
            }
          ],
          "relatedInfo": null,
          "videoUserLiveInfo": null,
          "vid": "2BF7324F22608D89C4FBA31798BDBF3B",
          "durationms": 200807,
          "playTime": 6153834,
          "praisedCount": 28327,
          "praised": false,
          "subscribed": false
        }
      }]
    let { videoList } = this.data
    videoList.push(...newVideoList);
    this.setData({
      videoList
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
  onShareAppMessage: function ({from}) {
    if(from === 'button') {
      return {
        title: '来自button的转发',
        path: '/pages/video/video'
      }
    }else{
      return {
        title: '来自menu的转发',
        path: '/pages/video/video'
      }
    }

  }
})