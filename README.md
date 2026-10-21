# 活动报名小程序（微信原生小程序 + 微信云开发）

一个基于微信原生小程序与微信云开发的**活动报名**示例项目。包含活动首页、活动详情、在线报名、报名记录四个页面，以及登录、提交报名、灌入演示数据三个云函数。

> 本项目所有活动名称、参与人群均为**演示默认值**，上线前请按 `config.js` 中的注释替换为真实值。

---

## 一、目录结构

```
event-signup-miniprogram/
├── app.js / app.json / app.wxss      # 小程序入口与全局配置/样式
├── config.js                         # 云环境 ID 与演示活动默认值（含"替换为真实值"注释）
├── project.config.json               # 项目配置（appid=touristappid，cloudfunctionRoot）
├── sitemap.json
├── pages/
│   ├── index/                        # 活动首页
│   ├── detail/                       # 活动详情
│   ├── signup/                       # 在线报名
│   └── records/                      # 报名记录
├── custom-tab-bar/                   # 自定义 tabBar（SVG 线性图标，无二进制 PNG、无 Emoji）
└── cloudfunctions/
    ├── login/                        # 取 openid 并 upsert users
    ├── submitSignup/                 # 校验 + 查重 + 写入 signups + 自增 registeredCount
    └── seed/                         # 灌入演示活动（按 title 判重）
```

---

## 二、部署步骤

1. **替换 AppID**
   - 用微信开发者工具打开本项目根目录。
   - 将 `project.config.json` 中的 `"appid": "touristappid"` 替换为你自己的小程序 AppID（游客模式无法使用云开发，需真实 AppID）。

2. **开通云开发并创建环境**
   - 在微信开发者工具顶部点击「云开发」，按引导开通。
   - 新建一个云开发环境，记下**环境 ID**（形如 `my-cloud-env-1a2b3c`）。

3. **配置云环境 ID**
   - 打开根目录 `config.js`，将 `cloudEnvId` 的占位值 `'your-cloud-env-id'` 改为第 2 步记下的真实环境 ID。

4. **上传并部署 3 个云函数**
   - 在 `cloudfunctions/` 目录上分别右键 `login`、`submitSignup`、`seed`，选择「上传并部署：云端安装依赖（不上传 node_modules）」。
   - 三个云函数均已包含 `package.json`（`wx-server-sdk: latest`），云端会自动安装依赖。

5. **创建数据库集合并设置权限**
   - 在云开发控制台「数据库」中新建以下三个集合：
     - `activities`
     - `signups`
     - `users`
   - 将 `activities`、`signups`、`users` 的**权限**均设置为：
     **「所有用户可读，仅创建者可读写」**（对应权限配置项 `read: true, write: false` 由创建者限定）。
     > 说明：客户端直连查询依赖"所有用户可读"；报名记录/取消由创建者（本人 openid）写回，依赖"仅创建者可写"。

6. **上传封面图并填写 fileID**
   - 在云开发控制台「存储」中上传一张活动封面图，复制其 **fileID**（形如 `cloud://env-xxx.xxxx/cover.jpg`）。
   - 将 fileID 填到：
     - 根目录 `config.js` 的 `demoActivity.cover`；
     - `cloudfunctions/seed/index.js` 镜像数据中的 `cover`（两处需保持一致）。
   - 如需详情页图片，将图片 fileID 数组填到 `images`（同样两处同步）。

7. **运行 seed 云函数灌入演示活动**
   - 在云开发控制台「云函数」中找到 `seed`，点击「测试」或直接调用，返回 `inserted: true` 即表示演示活动已写入 `activities`。
   - 重复运行会按 `title` 判重并跳过（返回 `inserted: false`），不会重复灌入。

8. **（可选）替换为真实活动信息**
   - 修改根目录 `config.js` 中的 `demoActivity.title`（活动名称）、`audience`（参与人群）以及时间、地点、主办方、名额等字段；**同步**修改 `cloudfunctions/seed/index.js` 中的镜像数据，然后重新运行 `seed`（因按 title 判重，若已存在需先删除旧数据或修改 title 再灌入）。

9. **编译预览**
   - 回到微信开发者工具，点击「编译」。首页应展示演示活动，可依次体验「查看详情 → 立即报名 → 报名记录 → 取消报名」。

---

## 三、关键约定（全工程保持一致）

- **云环境 ID**：统一取自 `config.js` 导出的 `cloudEnvId`。
- **集合名**：`activities` / `signups` / `users`。
- **云函数名**：`login` / `submitSignup` / `seed`。
- **tabBar 四个 pagePath**：`pages/index/index`、`pages/detail/index`、`pages/signup/index`、`pages/records/index`，与 `app.json` 的 `pages` 列表及 `custom-tab-bar` 完全一致。
- **活动 ID 参数名**：跨页传递统一命名为 `id`（深链/分享场景使用 `?id=`；tab 间切换通过 `globalData.currentActivityId` 共享，因为 `switchTab` 无法带参）。
- **图标**：全部使用 WXSS `background-image: url("data:image/svg+xml,...")` 线性 SVG 图标，工程内**无任何二进制 PNG、无任何 Emoji**。
- **主色**：`#2B6CB0`，浅色背景 + 卡片式布局。

---

## 四、已知限制 / 注意事项

- **取消报名与名额回退**：`records` 页的"取消报名"通过客户端直连 `signups` 更新 `status` 为「已取消」（满足"仅创建者可写"权限）。由于演示活动由 `seed` 云函数创建（创建者非当前用户），客户端**无法**回退 `activities.registeredCount`，因此取消后活动"已报名数"不会自减。如需严格回退名额，可新增一个具备管理员写权限的 `cancelSignup` 云函数（本项目按需求仅保留 3 个云函数，故未内置）。
- **演示数据镜像**：因云函数运行环境无法跨目录引用根 `config.js`，`seed` 内保留了一份 `demoActivity` 镜像，修改活动信息时需**两处同步**。
- **游客 AppID**：`touristappid` 仅用于本地结构预览，云开发功能必须使用真实 AppID 并开通云环境。
- **`wx.getUserProfile`**：已按规范弃用，用户名/手机号均在报名表单采集，登录仅通过 `wx.login` + `login` 云函数获取 openid。
