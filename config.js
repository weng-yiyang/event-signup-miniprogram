// config.js
// 全局配置：云开发环境 ID 与演示活动默认值。
// 注意：微信原生小程序中该文件同时被前端（app.js）与云函数（如 cloudfunctions/seed）
// 以 CommonJS 方式引用；云函数运行环境无法跨目录引用根配置，故 seed 内部保留了一份镜像副本。

// 微信云开发环境 ID（替换为真实值）
// 在微信开发者工具 -> 云开发 -> 环境设置 中获取，例如 'my-cloud-env-1a2b3c'
const cloudEnvId = 'your-cloud-env-id'; // TODO: 替换为真实【云开发环境 ID】

// 演示活动数据（首次运行 seed 云函数会将其写入 activities 集合）
// 正式上线前请将下列字段替换为真实值。
const demoActivity = {
  title: '城市公益健康跑', // TODO: 替换为真实【活动名称】
  audience: '18-60岁健康人群', // TODO: 替换为真实【参与人群】
  // 封面图云存储 fileID（替换为真实值）。上传图片到云存储后复制 fileID 粘贴此处，例如 'cloud://env-xxx.xxxx/cover.jpg'
  cover: '', // TODO: 替换为真实【封面云存储 fileID】
  // 详情页图片云存储 fileID 数组（替换为真实值）
  images: [], // TODO: 替换为真实【详情图片云存储 fileID 数组】
  description: '城市公益健康跑是一项面向全城的免费健身活动，路线沿城市滨江绿道设置，全程约 5 公里。' +
    '活动旨在倡导健康生活方式，现场设有补给站与医疗保障。欢迎热爱运动的你加入我们，一起用脚步丈量城市。',
  // 开始时间（ISO 8601 字符串，seed 会转换为 Date 写入数据库）
  startTime: '2026-11-15T08:00:00', // TODO: 替换为真实【活动开始时间】
  // 结束时间
  endTime: '2026-11-15T12:00:00', // TODO: 替换为真实【活动结束时间】
  location: '滨江路全民健身中心广场', // TODO: 替换为真实【活动地点】
  organizer: '市体育局 · 城市跑步协会', // TODO: 替换为真实【主办方】
  capacity: 500, // TODO: 替换为真实【活动名额】
  registeredCount: 0, // 已报名数，由 submitSignup 云函数自增，无需手动修改
};

module.exports = {
  cloudEnvId,
  demoActivity,
};
