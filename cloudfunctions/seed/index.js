// cloudfunctions/seed/index.js
// 灌入演示活动。注意：微信云函数无法跨目录引用根目录 config.js，
// 因此此处保留一份与根目录 config.js 中 demoActivity 完全一致的镜像数据。
// 修改活动信息时需同步更新根目录 config.js 与本文件两处。
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

// 演示活动（镜像根目录 config.js 的 demoActivity，请保持同步）
const demoActivity = {
  title: '城市公益健康跑',
  audience: '18-60岁健康人群',
  cover: '', // 替换为真实封面云存储 fileID，例如 'cloud://env-xxx.xxxx/cover.jpg'
  images: [], // 替换为真实详情图片云存储 fileID 数组
  description: '城市公益健康跑是一项面向全城的免费健身活动，路线沿城市滨江绿道设置，全程约 5 公里。' +
    '活动旨在倡导健康生活方式，现场设有补给站与医疗保障。欢迎热爱运动的你加入我们，一起用脚步丈量城市。',
  startTime: '2026-11-15T08:00:00',
  endTime: '2026-11-15T12:00:00',
  location: '滨江路全民健身中心广场',
  organizer: '市体育局 · 城市跑步协会',
  capacity: 500,
  registeredCount: 0,
};

/**
 * 主入口：以 title 判重，已存在则跳过，否则插入一条 activities。
 * @param {Object} event 入参
 * @param {Object} context 上下文
 * @return {Promise<Object>} 返回插入结果
 */
exports.main = async (event, context) => {
  const collection = db.collection('activities');
  const exist = await collection.where({ title: demoActivity.title }).get();

  if (exist.data && exist.data.length > 0) {
    return { inserted: false, msg: '演示活动已存在，跳过灌入', data: exist.data[0] };
  }

  const res = await collection.add({
    data: {
      title: demoActivity.title,
      audience: demoActivity.audience,
      cover: demoActivity.cover,
      images: demoActivity.images,
      description: demoActivity.description,
      startTime: new Date(demoActivity.startTime),
      endTime: new Date(demoActivity.endTime),
      location: demoActivity.location,
      organizer: demoActivity.organizer,
      capacity: demoActivity.capacity,
      registeredCount: demoActivity.registeredCount,
      createdAt: db.serverDate(),
    },
  });

  return { inserted: true, msg: '演示活动已成功灌入', _id: res._id };
};
