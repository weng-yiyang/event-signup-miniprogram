// pages/index/index.js
const app = getApp();
const db = wx.cloud.database();

/**
 * 将数据库中的时间字段格式化为可读字符串。
 * @param {Date|string|number} ts 时间值
 * @return {string} 格式化后的字符串
 */
function fmt(ts) {
  if (!ts) return '';
  const d = ts instanceof Date ? ts : new Date(ts);
  const pad = (n) => (n < 10 ? '0' + n : '' + n);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

Page({
  data: {
    loading: true,
    activities: [],
    isSingle: false,
  },

  onLoad(options) {
    // 支持通过 ?id= 直达（深链 / 分享场景），参数名统一为 id
    if (options && options.id) {
      app.globalData.currentActivityId = options.id;
    }
    this.loadActivities();
  },

  onShow() {
    // 自定义 tabBar 选中态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 });
    }
  },

  /** 拉取活动列表（client 端直连数据库） */
  loadActivities() {
    this.setData({ loading: true });
    db.collection('activities')
      .orderBy('startTime', 'asc')
      .get()
      .then((res) => {
        const list = (res.data || []).map((a) => ({
          ...a,
          startTimeText: fmt(a.startTime),
          endTimeText: fmt(a.endTime),
        }));
        this.setData({
          activities: list,
          isSingle: list.length === 1,
          loading: false,
        });
      })
      .catch((err) => {
        console.error('加载活动失败', err);
        this.setData({ loading: false });
        wx.showToast({ title: '加载活动失败', icon: 'none' });
      });
  },

  /** 查看详情：切换 tab 并共享 activityId */
  onViewDetail(e) {
    const id = e.currentTarget.dataset.id;
    app.globalData.currentActivityId = id;
    wx.switchTab({ url: '/pages/detail/index' });
  },

  /** 立即报名：切换 tab 并共享 activityId */
  onSignup(e) {
    const id = e.currentTarget.dataset.id;
    app.globalData.currentActivityId = id;
    wx.switchTab({ url: '/pages/signup/index' });
  },
});
