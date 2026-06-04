# 抖音爬虫技术文档 v1.0

> 基于 Playwright 的抖音关键词搜索采集方案。输入关键词 → 输出搜索结果结构化数据，不做单条视频深度钻取。

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
  CLI → browser.js (浏览器管理) → douyin.js (搜索采集) → output/*.json
```

只做一件事：**关键词搜索 → 取搜索结果列表**。

## 3. 核心逻辑

### 3.1 浏览器管理 (browser.js)

- Chromium 启动，`headless: false`（抖音检测无头模式）
- 反检测脚本注入（`navigator.webdriver` 置空、注入 `window.chrome`）
- Cookie 持久化至 `cookies.json`，后续启动自动加载

### 3.2 搜索采集 (douyin.js)

**思路：** 监听抖音搜索 API 响应，绕过 X-Bogus 签名校验。

**API 端点：**

| 端点 | 作用 |
|------|------|
| `/aweme/v1/web/general/search/single/` | 搜索结果 |
| `/aweme/v1/web/general/search/stream/` | 加载更多 |

**参数：**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| keyword | string | — | 搜索关键词 |
| maxResults | number | 20 | 最多返回条数 |
| dayRange | 1\|7\|180 | — | 时间筛选（1天内/一周/半年） |

**流程：**

```
1. 打开抖音首页，确认登录态（如未登录则扫码）
2. 注册 search/single/ 和 search/stream/ 的 response 拦截
3. 导航至 https://www.douyin.com/search/{keyword}?publish_time={dayRange}
4. 等待 6s 首屏渲染，滚动 2 次触发加载更多
5. 从拦截的 API 响应中解析视频列表（aweme_id 去重）
6. 返回结构化数据
```

**输出结构（单条结果）：**

| 字段 | 说明 | 来源 |
|------|------|------|
| contentId | `douyin_{aweme_id}` | 拼接 |
| title | 视频文案（前 100 字） | `aweme_info.desc` |
| url | 视频链接 | `https://www.douyin.com/video/{id}` |
| author.id | 作者加密 ID | `author.sec_uid` |
| author.nickname | 作者昵称 | `author.nickname` |
| author.uniqueId | 抖音号 | `author.unique_id` |
| metrics.playCount | 播放数 | `statistics.play_count` |
| metrics.likeCount | 点赞数 | `statistics.digg_count` |
| metrics.commentCount | 评论数 | `statistics.comment_count` |
| metrics.shareCount | 分享数 | `statistics.share_count` |
| publishedAt | 发布时间 | `create_time * 1000 → ISO` |

> 不进入单条视频页，不采集评论。

### 3.3 登录 (douyin.js - waitForLogin)

- 打开 `www.douyin.com`，检测登录弹窗
- 未登录 → 显示二维码，等待手机扫码（120s 超时）
- 登录成功 → 持久化 Cookie
- 再次运行直接加载 Cookie，无需重复扫码

## 4. CLI 使用

```bash
# 首次需先登录
node src/index.js login

# 搜索关键词
node src/index.js search "食品安全"

# 指定数量 + 时间筛选
node src/index.js search "直播带货" --max 30 --dayRange 7
```

## 5. 分层爬取

| 级别 | 频率 | 条数/次 | 适用 |
|------|------|---------|------|
| L1 实时 | 5-10 min | 20 | 红灯告警关键词 |
| L2 高频 | 30 min | 20 | 黄灯预警关键词 |
| L3 常规 | 2 h | 20 | 日常监测关键词 |
| L4 背景 | 1 次/天 | 50 | 长尾/已归档关键词 |

## 6. 输出文件

`output/抖音_{关键词}_{级别}_{时间戳}.json`，格式见 `docs/output_format.md`。
