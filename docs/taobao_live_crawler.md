# 淘宝直播爬虫技术文档 v1.0

> 基于 Playwright 的 tbzb.taobao.com 关键词搜索采集方案。输入关键词 → 输出直播间搜索结果，不做单直播间深度钻取。

---

## 1. 技术栈

| 组件 | 选型 | 版本 |
|------|------|------|
| 运行时 | Node.js | ≥ 18 LTS |
| 浏览器驱动 | Playwright | ^1.52.0 |
| Cookie 持久化 | JSON 文件 | — |
| 输出格式 | JSON（标准化 v1.0） | — |

## 2. 架构

```
  CLI → browser.js (浏览器管理) → taobao_live.js (搜索采集) → output/*.json
```

只做一件事：**关键词搜索直播间 → 取搜索结果列表**。

## 3. 核心逻辑

### 3.1 搜索采集 (taobao_live.js)

**搜索入口：** `https://tbzb.taobao.com/search?searchQuery={keyword}`

**参数：**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| keyword | string | — | 搜索关键词 |
| maxResults | number | 20 | 最多返回条数 |
| onlyLiving | boolean | false | 仅采集"直播中"的直播间 |

**DOM 选择器（CSS Modules 哈希类名，使用属性选择器模糊匹配）：**

| 选择器 | 提取内容 |
|--------|---------|
| `[class*="listItem"]` | 搜索结果卡片容器 |
| `a[href*="liveId"]` / `a[href*="/live?"]` | 直播间链接 → 解析 `liveId` |
| `[class*="accountName"]` | 主播昵称 |
| `[class*="infoText"]` | 直播间描述 / 观看人数 / 粉丝数 |
| `[class*="livingIcon"]` / `[class*="liveGif"]` | 直播中标识 |
| `[class*="price"]` | 商品价格 |
| `[class*="avatar"]` | 主播头像 |
| `[class*="videoWrap"]` | 直播间封面（backgroundImage） |

**数值解析规则：** 支持中文单位换算

```
  "25.49万" → 254900
  "1.2w"    → 12000
  "1234"    → 1234
```

**采集流程：**

```
1. 直接导航至搜索页 https://tbzb.taobao.com/search?searchQuery={keyword}
2. 若 SPA 重定向到 login.taobao.com → 等待用户手机淘宝扫码
   （扫码后 tbzb 自动回跳，若回到首页则重新导航到搜索页）
3. 等待搜索结果渲染（轮询最多 15s，检查 [class*="listItem"] 是否存在）
4. 滚动 3 次触发懒加载更多
5. page.evaluate() 从 DOM 提取直播间列表
6. 按 liveId 去重，按观看人数降序排列
7. 可选过滤仅"直播中" → 返回
```

**输出结构（单条结果）：**

```javascript
{
  contentId: "taobao_live_12345678",
  title: "直播间标题",
  liveId: "12345678",
  url: "https://tbzb.taobao.com/live?liveId=12345678",
  status: "living",                   // living / replay
  author: {
    nickname: "主播昵称",
    followerCount: 1250000            // 粉丝数
  },
  metrics: {
    viewCount: 325000,                // 观看人数
    productCount: 12                  // 商品数量
  },
  prices: ["¥29.9", "¥59.9", "..."],  // 商品价格列表（最多3个）
  coverUrl: "https://...",            // 直播间封面
  timestamps: {
    collectedAt: "2026-05-17T14:00:00.000Z"
  }
}
```

> 不进入单个直播间，不采集弹幕，不采集商品详情。

### 3.2 登录 (waitForTaobaoLogin)

- 打开 `tbzb.taobao.com`，检测 URL 是否包含 `login`
- 未登录 → 显示二维码，手机淘宝扫码（120s 超时）
- 登录成功 → 自动跳回 tbzb
- 特殊处理：SPA 搜索页跳转时可能触发登录重定向，脚本会在搜索流程中内嵌扫码等待逻辑
- Cookie 持久化至 `taobao_cookies.json`

### 3.3 浏览器管理

与抖音爬虫共用 `browser.js` 模块，差异：

| 项 | 抖音 | 淘宝直播 |
|----|------|---------|
| Cookie 文件 | `cookies.json` | `taobao_cookies.json` |
| 搜索 URL | `www.douyin.com/search/` | `tbzb.taobao.com/search` |
| 登录方式 | 抖音 App 扫码 | 手机淘宝扫码 |

## 4. CLI 使用

```bash
# 首次需先登录
node src/index.js login --platform taobao

# 搜索直播间
node src/index.js search --platform taobao "食品安全"

# 仅看直播中 + 指定数量
node src/index.js search --platform taobao "直播带货" --max 30 --only-living
```

## 5. 分层爬取

| 级别 | 频率 | 条数/次 | 适用 |
|------|------|---------|------|
| L1 实时 | 5-10 min | 10 | 红灯告警关键词 |
| L2 高频 | 30 min | 20 | 黄灯预警关键词 |
| L3 常规 | 2 h | 30 | 日常监测关键词 |
| L4 背景 | 1 次/天 | 50 | 长尾/已归档关键词 |

## 6. 输出文件

`output/淘宝直播_{关键词}_{级别}_{时间戳}.json`，格式见 `docs/output_format.md`。

## 7. 已知限制

1. **登录依赖手机淘宝扫码**，Cookie 有效期内可免登录
2. **CSS Modules 哈希类名**可能随淘宝版本更新变化，需定期维护选择器
3. **部分直播间可能在 App 端独占**，Web 端搜索结果覆盖不全
4. **观看人数等指标**为采集时刻快照，非实时变化追踪
