// pages/signup/index.js
const app = getApp();
const db = wx.cloud.database();

const PHONE_REGEX = /^1[3-9]\d{9}$/;

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
    activityId: '',
    form: {
      name: '',
      phone: '',
      gender: '男',
      remark: '',
    },
    submitting: false,
  },

  onLoad(options) {
    // 支持通过 ?id= 直达，参数名统一为 id
    if (options && options.id) {
      app.globalData.currentActivityId = options.id;
    }
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 });
    }
    const id = app.globalData.currentActivityId;
    if (!id) {
      this.setData({ activity: null, activityId: '' });
      return;
    }
    // 切换活动时重新加载活动信息
    if (id !== this.data.activityId) {
      this.setData({ activityId: id });
      this.loadActivity(id);
    }
  },

  /** 加载当前报名活动的基本信息用于上下文展示 */
  loadActivity(id) {
    db.collection('activities').doc(id).get()
      .then((res) => {
        const a = res.data;
        this.setData({ activity: { ...a, startTimeText: fmt(a.startTime) } });
      })
      .catch((err) => {
        console.error('加载活动失败', err);
        wx.showToast({ title: '加载活动失败', icon: 'none' });
      });
  },

  /** 表单输入绑定 */
  onInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [`form.${field}`]: e.detail.value });
  },

  /** 性别选择 */
  onGenderChange(e) {
    this.setData({ 'form.gender': e.detail.value });
  },

  /** 提交报名 */
  onSubmit() {
    const { activityId, form } = this.data;
    if (!activityId) {
      wx.showToast({ title: '请先选择活动', icon: 'none' });
      return;
    }
    if (!form.name.trim()) {
      wx.showToast({ title: '请填写姓名', icon: 'none' });
      return;
    }
    if (!PHONE_REGEX.test(form.phone.trim())) {
      wx.showToast({ title: '手机号格式不正确', icon: 'none' });
      return;
    }
    if (!form.gender) {
      wx.showToast({ title: '请选择性别', icon: 'none' });
      return;
    }

    this.setData({ submitting: true });
    wx.cloud.callFunction({
      name: 'submitSignup',
      data: {
        activityId: activityId,
        name: form.name.trim(),
        phone: form.phone.trim(),
        gender: form.gender,
        remark: form.remark.trim(),
      },
      success: (res) => {
        const result = res.result || {};
        if (result.success) {
          wx.showToast({ title: '报名成功', icon: 'success' });
          setTimeout(() => {
            wx.switchTab({ url: '/pages/records/index' });
          }, 800);
        } else {
          wx.showToast({ title: result.msg || '报名失败', icon: 'none' });
        }
      },
      fail: (err) => {
        console.error('submitSignup 调用失败', err);
        wx.showToast({ title: '提交失败，请重试', icon: 'none' });
      },
      complete: () => {
        this.setData({ submitting: false });
      },
    });
  },
});
