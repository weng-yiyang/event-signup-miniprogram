# AGENTS.md — 活动报名微信小程序

> 微信原生小程序 + 微信云开发（云数据库 + 云存储）的活动报名示例项目。

## 一、项目定位
- 四页面：活动首页（`pages/index`）、活动详情（`pages/detail`）、在线报名（`pages/signup`）、报名记录（`pages/records`）。
- 微信授权登录：仅通过 `wx.login` + 云函数 `login` 取 openid；**不使用已废弃的 `wx.getUserProfile`**，用户名/手机号在报名表单采集。
- 后端：微信云开发。集合 `activities` / `signups` / `users`；云存储存放活动封面与详情图（fileID）。
- 图标：自定义 tabBar（`custom-tab-bar/`），统一线性 SVG data URI 图标，**全工程无 Emoji、无二进制 PNG**。
- 主色 `#2B6CB0`，浅色背景 + 卡片式布局。

## 二、目录结构
```
app.js / app.json / app.wxss   小程序入口与全局配置/样式
config.js                      云环境 ID 与演示活动默认值（上线前必改）
project.config.json            appid 占位 touristappid，需替换为真实 AppID
pages/                         index / detail / signup / records
custom-tab-bar/                自定义 tabBar（SVG 线性图标）
cloudfunctions/
  login/                       取 openid 并 upsert users
  submitSignup/                校验 + 查重 + 写入 signups + 自增 registeredCount
  seed/                        灌入演示活动（按 title 判重）
```

## 三、关键约定（跨文件保持一致）
- 云环境 ID：统一取自 `config.js` 导出的 `cloudEnvId`。
- 集合名：`activities` / `signups` / `users`。
- 云函数名：`login` / `submitSignup` / `seed`。
- tabBar 四个 pagePath 与 `app.json` 的 `pages` 列表、`custom-tab-bar/index.js` 的 `list` 三处一致。
- 活动 ID 跨页参数名统一为 `id`；tab 间切换通过 `app.globalData.currentActivityId` 共享（`switchTab` 无法带参）。
- 数据库权限：三个集合均设「所有用户可读，仅创建者可写」。

## 四、部署步骤（摘要，详见 README.md）
1. 微信开发者工具打开本目录，将 `project.config.json` 的 `appid` 改为真实 AppID。
2. 开通云开发，新建环境，把环境 ID 填入 `config.js` 的 `cloudEnvId`。
3. 右键 `cloudfunctions/` 下三个函数分别「上传并部署：云端安装依赖」。
4. 云开发控制台建 `activities`/`signups`/`users` 三个集合并设权限。
5. 上传封面图到云存储，把 fileID 填到 `config.js` 与 `cloudfunctions/seed/index.js`（两处同步）。
6. 运行 `seed` 云函数灌入演示活动，点「编译」预览。

## 五、上线前必改（占位符）
- `config.js`：`cloudEnvId`、以及 `demoActivity` 的 `title`(活动名称)/`audience`(参与人群)/时间/地点/主办方/名额、`cover`/`images` fileID。
- 注意 `cloudfunctions/seed/index.js` 内有一份 `demoActivity` 镜像，修改活动信息需**两处同步**。

## 六、已知限制
- 报名记录「取消报名」仅把 `signups.status` 置为「已取消」，不回退 `activities.registeredCount`（演示数据由 `seed` 创建、创建者非本人，客户端无写权限）。如需严格回退名额，新增具备管理员写权限的 `cancelSignup` 云函数即可。

## 七、提交约定
- 每次改动都提交 commit，信息简洁中文或英文均可，体现变更意图。
- 文件操作以新增/修改源码为主，不修改上游模板的原始语义。
