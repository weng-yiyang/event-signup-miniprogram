// cloudfunctions/submitSignup/index.js
// 提交报名云函数：校验必填与手机号格式，查重后写入 signups，并自增活动已报名数。
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;

const PHONE_REGEX = /^1[3-9]\d{9}$/;

/**
 * 主入口
 * @param {Object} event 入参 { activityId, name, phone, gender, remark }
 * @param {Object} context 上下文
 * @return {Promise<Object>} 返回 { success, msg, _id? }
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  const { activityId, name, phone, gender, remark } = event || {};

  // 必填校验
  if (!activityId || !name || !phone || !gender) {
    return { success: false, code: 'PARAM_MISSING', msg: '缺少必填字段' };
  }

  // 手机号格式校验：1[3-9]\d{9}
  if (!PHONE_REGEX.test(String(phone).trim())) {
    return { success: false, code: 'PHONE_INVALID', msg: '手机号格式不正确' };
  }

  const signups = db.collection('signups');

  // 查重：同一活动 + 同一 openid 且状态不为"已取消"视为已报名
  const dup = await signups.where({
    activityId: activityId,
    openid: openid,
    status: _.neq('已取消'),
  }).get();

  if (dup.data && dup.data.length > 0) {
    return { success: false, code: 'DUPLICATE', msg: '您已报名该活动，请勿重复报名' };
  }

  // 写入报名记录
  const res = await signups.add({
    data: {
      activityId: activityId,
      openid: openid,
      name: String(name).trim(),
      phone: String(phone).trim(),
      gender: gender,
      remark: remark ? String(remark).trim() : '',
      status: '已报名',
      createdAt: db.serverDate(),
    },
  });

  // 活动已报名数 +1
  await db.collection('activities').doc(activityId).update({
    data: { registeredCount: _.inc(1) },
  });

  return { success: true, msg: '报名成功', _id: res._id };
};
