// cloudfunctions/login/index.js
// 登录云函数：从微信上下文取 openid，并 upsert 到 users 集合。
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

/**
 * 主入口
 * @param {Object} event 入参
 * @param {Object} context 上下文
 * @return {Promise<Object>} 返回 { openid }
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  if (!openid) {
    return { openid: '' };
  }

  const users = db.collection('users');
  const exist = await users.where({ openid: openid }).get();

  if (!exist.data || exist.data.length === 0) {
    await users.add({
      data: {
        openid: openid,
        createdAt: db.serverDate(),
      },
    });
  }

  return { openid: openid };
};
