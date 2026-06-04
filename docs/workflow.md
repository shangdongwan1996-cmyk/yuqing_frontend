# 舆情数据采集服务 — 完整工作流

> 版本：v2.0 | 定位：纯后端 API 服务，无前端页面

---

## 一、整体架构

```
┌───────────────────────────────────────────────────────────────────────┐
│                        上 游 系 统 / A I 模 型                        │
│             (发起请求、接收结果、消费数据)                              │
└──────────┬─────────────────────────────────────┬─────────────────────┘
           │ ① 下发任务                            │ ⑥ 返回标准化结果
           ▼                                      ▲
┌──────────────────────────────┐    ┌─────────────────────────────────┐
│    API 网关                   │    │  标准化输出格式 v1.0            │
│    POST /api/v1/yuqing/collect│    │  JSON Schema (统一结构)         │
└──────────┬───────────────────┘    └────────────▲───────────────────┘
           │ ② 调度执行                            │ ⑤ 格式化
           ▼                                       │
┌──────────────────────────────────────────────────────────────────────┐
│                      采 集 调 度 层                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│  │ L1 实时   │ │ L2 高频  │ │ L3 常规  │ │ L4 背景  │               │
│  │ 5~10 min │ │ 30 min   │ │ 2 h      │ │ 1次/天   │               │
│  └─────┬────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘               │
│        │           │            │            │                       │
│        └───────────┴────────────┴────────────┘                       │
│                         │ ③ 执行                                     │
│                         ▼                                            │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    采 集 引 擎                                │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │   │
│  │  │ 抖音 Playwright  │  │淘宝直播 Playwright│  │ 新闻 RSS/HTTP│ │   │
│  │  │ API 拦截+X-Bogus │  │ DOM解析+CSS选择器│  │ axios+cheerio│ │   │
│  │  └─────────────────┘  └─────────────────┘  └──────────────┘ │   │
│  └──────────────────────────────────────────────────────────────┘   │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ ④ 原始数据
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│                      关 键 词 库                                     │
│                                                                      │
│   食品监管         直播带货         消费维权           ...其他分类     │
│   ├─ 食品安全      ├─ 价格欺诈     ├─ 假货投诉                       │
│   ├─ 卫生违规      ├─ 虚假宣传     ├─ 退款纠纷                       │
│   ├─ ...           ├─ ...          ├─ ...                            │
│   │                                                                  │
│   ├─ 正面词库: 支持、喜欢、赞、良心、加油、感谢、真实、厉害...        │
│   └─ 负面词库: 骗、假、垃圾、投诉、举报、违法、虚假、套路...          │
│                                                                      │
│   (关键词库可配置，支持 Excel 导入/导出)                             │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 二、完整数据流（6 步详解）

### 步骤 ①：上游系统下发任务

上游系统（或 AI 模型调度器）通过 API 下发采集任务：

```json
POST /api/v1/yuqing/collect
Content-Type: application/json

{
  "taskId": "TASK-20260517-001",
  "keywords": ["食品安全", "直播带货"],
  "platforms": ["douyin", "taobao_live"],
  "crawlLevel": "L3",
  "maxResults": 20,
  "filters": {
    "douyin": { "dayRange": 7 },
    "taobao_live": { "onlyLiving": false }
  },
  "callback": "https://upstream-system/api/v1/receive",
  "sync": true
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| keywords | string[] | 是 | 搜索关键词列表 |
| platforms | string[] | 是 | 目标平台: douyin, taobao_live, news, weibo |
| crawlLevel | string | 否 | L1/L2/L3/L4，默认 L3 |
| maxResults | number | 否 | 每个关键词最大结果数，默认 20 |
| filters | object | 否 | 平台专属过滤参数 |
| callback | string | 否 | 异步回调地址（sync=false 时必填） |
| sync | boolean | 否 | 是否同步等待，默认 false |

### 步骤 ②：调度层解析与分配

采集调度器接收到任务后：

```
接收请求
  │
  ├─ 校验参数（关键词必填、平台必填）
  │
  ├─ 匹配关键词库
  │   ├─ 从关键词库中找到关键词对应的分类/组
  │   ├─ 加载对应的正负面词库
  │   └─ 确定爬取级别与参数
  │
  ├─ 拆分子任务
  │   ├─ 每个平台 × 每个关键词 = 一个子任务
  │   └─ 示例: 抖音/食品安全 + 抖音/直播带货 + 淘宝直播/食品安全 + 淘宝直播/直播带货
  │
  └─ 加入执行队列
      ├─ 按 crawlLevel 确定优先级
      ├─ L1 → 立即执行
      ├─ L2 → 30 分钟内
      ├─ L3 → 2 小时内
      └─ L4 → 每日凌晨执行
```

### 步骤 ③：采集引擎执行

#### 抖音采集流程

```
  导航至搜索页 → 等待数据加载 → API 拦截 → 提取视频列表 → 返回结构化数据
  https://www.douyin.com/search/{keyword}?publish_time={dayRange}

  技术实现：
  1. Playwright 驱动 Chromium 浏览器
  2. 反检测注入（隐藏 webdriver、覆盖 chrome 对象、修改 permissions）
  3. API 拦截 page.on('response') → 捕获 /aweme/v1/web/general/search/single/
  4. X-Bogus 签名由浏览器 JS 自动处理，无需额外计算
  5. Cookie 持久化（cookies.json），免重复登录
```

#### 淘宝直播采集流程

```
  导航至搜索页 → SPA 渲染等待 → DOM 解析 → 提取直播间列表 → 返回结构化数据
  https://tbzb.taobao.com/search?searchQuery={keyword}

  技术实现：
  1. Playwright 驱动 Chromium 浏览器
  2. CSS Modules 模糊选择器: [class*="listItem"]、[class*="accountName"] 等
  3. 数值解析: "25.49万" → 254900
  4. Cookie 持久化（taobao_cookies.json）
  5. 支持登录检测 + 自动等待扫码
```

### 步骤 ④：原始数据整理

各平台原始数据整理为标准中间格式：

```javascript
// 抖音原始 → 中间格式
{
  "platform": "douyin",
  "keyword": "食品安全",
  "items": [
    {
      "nativeId": "7432xxxxxxxxxxxxx",
      "title": "视频文案内容...",
      "authorNickname": "主播昵称",
      "authorId": "sec_uid...",
      "playCount": 325000,
      "diggCount": 15200,
      "commentCount": 843,
      "shareCount": 1200,
      "createTime": 1715918400,
      "videoUrl": "https://www.douyin.com/video/7432..."
    }
  ]
}

// 淘宝直播原始 → 中间格式
{
  "platform": "taobao_live",
  "keyword": "直播带货",
  "items": [
    {
      "nativeId": "12345678",
      "title": "直播间标题",
      "authorNickname": "主播昵称",
      "followerCount": 1250000,
      "viewCount": 325000,
      "status": "living",
      "prices": ["¥29.9", "¥59.9"],
      "coverUrl": "https://...",
      "liveUrl": "https://tbzb.taobao.com/live?liveId=12345678"
    }
  ]
}
```

### 步骤 ⑤：标准化输出

中间格式转换为统一 JSON Schema v1.0：

```javascript
{
  "schema": "yuqing.v1",
  "taskId": "TASK-20260517-001",
  "platform": "douyin",
  "keyword": "食品安全",
  "keywordGroup": "食品监管",
  "crawlLevel": "L3",
  "crawledAt": "2026-05-17T10:30:00.000Z",
  "totalResults": 20,

  "results": [
    {
      "contentId": "douyin_7432xxxxxxxxxxxxx",
      "platform": "douyin",
      "contentType": "video",
      "nativeId": "7432xxxxxxxxxxxxx",
      "url": "https://www.douyin.com/video/7432...",

      "title": "食品安全问题曝光！这些食品千万别买",

      "author": {
        "authorId": "douyin_user_secUid...",
        "nickname": "测评博主XXX",
        "followerCount": 1250000
      },

      "metrics": {
        "viewCount": 325000,
        "likeCount": 15200,
        "commentCount": 843,
        "shareCount": 1200
      },

      "publishedAt": "2026-05-17T08:00:00.000Z",
      "collectedAt": "2026-05-17T10:30:00.000Z",

      "platformFields": {}
    }
    // ... 更多结果
  ],

  "summary": {
    "totalResults": 20,
    "totalAuthors": 15,
    "authors": ["测评博主XXX", "新闻媒体Y", ...],
    "avgViewCount": 280000,
    "avgLikeCount": 12500,
    "avgCommentCount": 650
  }
}
```

### 步骤 ⑥：返回上游模型/系统

#### 同步模式（sync=true）

```json
HTTP 200 OK

{
  "code": 0,
  "message": "success",
  "data": {
    "taskId": "TASK-20260517-001",
    "status": "completed",
    "totalResults": 20,
    "platforms": ["douyin"],
    "results": { /* 标准化输出 JSON */ }
  }
}
```

#### 异步模式（sync=false，默认）

```json
HTTP 202 Accepted

{
  "code": 0,
  "message": "task accepted",
  "data": {
    "taskId": "TASK-20260517-001",
    "status": "processing"
  }
}
```

采集完成后，向 `callback` 地址推送：

```json
POST {callback_url}
Content-Type: application/json

{
  "taskId": "TASK-20260517-001",
  "status": "completed",
  "platform": "douyin",
  "keyword": "食品安全",
  "totalResults": 20,
  "results": [ /* 标准化 ResultItem */ ],
  "summary": { /* 统计摘要 */ }
}
```

---

## 三、关键词库工作流

```
┌──────────────────────────────────────────────────────────────────────┐
│                    关键词库生命周期                                  │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ① 关键词来源                                                       │
│     ├─ 人工配置：手动添加/编辑关键词                                 │
│     ├─ Excel导入：批量导入关键词库（分类/组/关键词/正负面词）        │
│     └─ API下发：上游系统通过 API 动态下发关键词                      │
│                                                                      │
│  ② 关键词入库                                                       │
│     ├─ 分配到分类（Category）：食品监管、直播带货、消费维权...       │
│     ├─ 分配到组（Group）：食品安全、价格欺诈、虚假宣传...            │
│     ├─ 配置正负面词库：情感分析用                                    │
│     └─ 分配爬取级别（L1~L4）：基于关键词优先级                       │
│                                                                      │
│  ③ 关键词执行                                                       │
│     ├─ 调度器按级别轮询关键词库                                      │
│     ├─ 获取关键词 → 匹配平台 → 执行爬取                             │
│     └─ 结果按关键词ID标记，便于回溯                                  │
│                                                                      │
│  ④ 关键词优化                                                       │
│     ├─ 分析历史采集结果，发现无效关键词                              │
│     ├─ 根据热度自动调整关键词级别                                    │
│     └─ 支持停用/启用关键词，无需删除                                 │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 四、多级爬取调度工作流

```
┌──────────────────────────────────────────────────────────────────────┐
│                    爬取级别自动管理                                  │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  初始状态：所有关键词默认 L3（常规）                                 │
│                                                                      │
│  L3 ──── 常规采集 ────→ 检测到指标异常 ────→ 自动升级至 L2          │
│   (2h/次)              (播放/点赞/评论暴增)     (30min/次)           │
│                          │                                            │
│                          │ 评分 ≥ 40                                 │
│                          ▼                                            │
│  L2 ──── 高频采集 ────→ 评分 ≥ 70 ──────────→ 自动升级至 L1          │
│   (30min/次)                                (5~10min/次)             │
│                          │                                            │
│                          │ 评分 < 40 持续 24h                        │
│                          ▼                                            │
│                        降级回 L3                                     │
│                                                                      │
│  L1 ──── 实时采集 ────→ 评分 < 70 持续 24h ──→ 降级至 L2            │
│   (5~10min/次)                                                        │
│                                                                      │
│  L4 ──── 仅用于已归档/长尾关键词                                      │
│   (1次/天)   不参与自动升级                                          │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 五、各平台采集参数

### 抖音

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| keyword | string | — | 搜索关键词 |
| maxResults | number | 20 | 最大视频条数 |
| dayRange | number | 无 | 时间范围: 1(1天), 7(一周), 180(半年) |

### 淘宝直播

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| keyword | string | — | 搜索关键词 |
| maxResults | number | 20 | 最大直播间数 |
| onlyLiving | boolean | false | 仅返回直播中的直播间 |

### 新闻媒体

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| keyword | string | — | 搜索关键词 |
| sources | string[] | 全部 | 人民网/新华网/澎湃新闻/新京报/观察者网/南方周末 |
| maxResults | number | 20 | 最大文章数 |

---

## 六、标准化输出格式（完整 Schema）

```javascript
{
  // ======= 元数据 (必填) =======
  "schema": "yuqing.v1",            // Schema 版本
  "taskId": "TASK-20260517-001",    // 任务唯一ID
  "platform": "douyin",             // douyin | taobao_live | news | weibo
  "keyword": "食品安全",             // 搜索关键词
  "keywordGroup": "食品监管",        // 关键词库分类组
  "crawlLevel": "L3",               // L1 / L2 / L3 / L4
  "crawledAt": "2026-05-17T10:30:00.000Z",  // ISO 8601
  "totalResults": 20,               // 本条结果条数

  // ======= 结果列表 =======
  "results": [
    {
      "contentId": "douyin_7432xxx",
      "platform": "douyin",
      "contentType": "video",        // video | live_stream | article
      "nativeId": "7432xxxxxxxxx",
      "url": "https://...",
      "title": "标题/摘要前100字",
      "coverUrl": "https://...",
      "author": {
        "authorId": "douyin_user_secUid...",
        "nickname": "昵称",
        "followerCount": 1250000
      },
      "metrics": {
        "viewCount": 325000,
        "likeCount": 15200,
        "commentCount": 843,
        "shareCount": 1200
      },
      "publishedAt": "2026-05-17T08:00:00.000Z",
      "collectedAt": "2026-05-17T10:30:00.000Z",
      "platformFields": {
        // 抖音: { "videoDuration": 120 }
        // 淘宝直播: { "liveStatus": "living", "productCount": 12, "prices": ["¥29.9"] }
      }
    }
  ],

  // ======= 统计摘要 =======
  "summary": {
    "totalResults": 20,
    "totalAuthors": 15,
    "authors": ["昵称1", "昵称2"],
    "avgViewCount": 280000,
    "avgLikeCount": 12500,
    "avgCommentCount": 650
  }
}
```

---

## 七、API 接口总览

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/v1/yuqing/collect` | POST | 下发采集任务（同步/异步） |
| `/api/v1/yuqing/collect/status` | GET | 查询任务状态 |
| `/api/v1/yuqing/collect/result` | GET | 获取已完成的采集结果 |
| `/api/v1/yuqing/keywords` | POST | 动态添加/更新关键词 |
| `/api/v1/yuqing/keywords` | GET | 获取当前关键词库 |
| `/api/v1/yuqing/keywords/import` | POST | Excel 批量导入关键词库 |

---

## 八、关键设计原则

1. **无前端页面** — 纯后端 API 服务，所有交互通过 API 完成
2. **关键词驱动** — 所有采集任务由关键词库触发，按"搜什么→怎么搜→多久搜"组织
3. **标准化输出** — 所有平台统一的 JSON Schema，模型/系统即插即用
4. **多级调度** — L1~L4 四级爬取频率，自动升降级
5. **隔离解耦** — 采集引擎与输出格式解耦，新增平台只需实现采集模块
