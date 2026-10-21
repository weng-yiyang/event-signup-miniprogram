// app.js
const { cloudEnvId } = require('./config.js');

App({
  globalData: {
    openid: '',
    // 跨 tab 页面传递当前选中的活动 ID。
    // 由于自定义 tabBar 使用 switchTab 无法携带参数，故用全局变量在页面间共享。
    currentActivityId: '',
  },

  onLaunch() {
    if (!wx.cloud) {
      console.error('当前基础库版本过低，请使用 2.2.3 或以上的基础库以使用云能力');
      return;
    }

    wx.cloud.init({
      env: cloudEnvId, // 占位值，请在 config.js 中替换为真实云开发环境 ID
      traceUser: true,
    });

    // 登录：获取 openid 并持久化，供 records 等页面使用
    wx.login({
      success: () => {
        wx.cloud.callFunction({
          name: 'login',
          success: (res) => {
            const openid = res.result && res.result.openid ? res.result.openid : '';
            this.globalData.openid = openid;
            wx.setStorageSync('openid', openid);
          },
          fail: (err) => {
            console.error('调用 login 云函数失败', err);
          },
        });
      },
      fail: (err) => {
        console.error('wx.login 失败', err);
      },
    });
  },
});
