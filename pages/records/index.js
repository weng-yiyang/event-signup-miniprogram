// pages/records/index.js
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
    records: [],
    openid: '',
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 3 });
    }
    // 优先取全局 openid，兜底取本地缓存
    const openid = app.globalData.openid || wx.getStorageSync('openid') || '';
    this.setData({ openid: openid });
    if (!openid) {
      this.setData({ loading: false, records: [] });
      return;
    }
    this.loadRecords(openid);
  },

  /** 按 openid 查询报名记录，并补全活动标题 */
  loadRecords(openid) {
    this.setData({ loading: true });
    const signupsTask = db.collection('signups').where({ openid: openid }).get();
    const activitiesTask = db.collection('activities').get();

    Promise.all([signupsTask, activitiesTask])
      .then(([signRes, actRes]) => {
        const titleMap = {};
        (actRes.data || []).forEach((a) => { titleMap[a._id] = a.title; });

        const list = (signRes.data || []).map((s) => ({
          _id: s._id,
          activityId: s.activityId,
          name: s.name,
          phone: s.phone,
          gender: s.gender,
          remark: s.remark,
          status: s.status,
          activityTitle: titleMap[s.activityId] || '未知活动',
          createdAtText: fmt(s.createdAt),
        }));

        // 最新报名排在最前
        list.sort((a, b) => {
          if (!a.createdAt || !b.createdAt) return 0;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });

        this.setData({ records: list, loading: false });
      })
      .catch((err) => {
        console.error('加载报名记录失败', err);
        this.setData({ loading: false });
        wx.showToast({ title: '加载失败', icon: 'none' });
      });
  },

  /** 取消报名（客户端直连更新，权限模型为"仅创建者可写"） */
  onCancel(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '取消报名',
      content: '确定要取消该活动的报名吗？',
      confirmColor: '#2B6CB0',
      success: (res) => {
        if (!res.confirm) return;
        wx.showLoading({ title: '处理中' });
        db.collection('signups').doc(id).update({
          data: { status: '已取消' },
        }).then(() => {
          wx.hideLoading();
          wx.showToast({ title: '已取消报名', icon: 'success' });
          this.loadRecords(this.data.openid);
        }).catch((err) => {
          wx.hideLoading();
          console.error('取消报名失败', err);
          wx.showToast({ title: '取消失败', icon: 'none' });
        });
      },
    });
  },

  /** 去报名 */
  onSignupAgain() {
    wx.switchTab({ url: '/pages/index/index' });
  },
});
