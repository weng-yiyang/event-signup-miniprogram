// pages/detail/index.js
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
    activity: null,
    loading: true,
  },

  onLoad(options) {
    // 支持通过 ?id= 直达，参数名统一为 id
    if (options && options.id) {
      app.globalData.currentActivityId = options.id;
    }
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 });
    }
    const id = app.globalData.currentActivityId;
    if (!id) {
      this.setData({ loading: false, activity: null });
      return;
    }
    this.loadActivity(id);
  },

  /** 根据活动 ID 加载活动详情 */
  loadActivity(id) {
    this.setData({ loading: true });
    db.collection('activities').doc(id).get()
      .then((res) => {
        const a = res.data;
        this.setData({
          activity: {
            ...a,
            startTimeText: fmt(a.startTime),
            endTimeText: fmt(a.endTime),
          },
          loading: false,
        });
      })
      .catch((err) => {
        console.error('加载活动详情失败', err);
        this.setData({ loading: false });
        wx.showToast({ title: '加载失败', icon: 'none' });
      });
  },

  /** 跳转到报名页 */
  onSignup() {
    if (!this.data.activity) return;
    app.globalData.currentActivityId = this.data.activity._id;
    wx.switchTab({ url: '/pages/signup/index' });
  },
});
