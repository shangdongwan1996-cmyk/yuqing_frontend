# 标准化输出格式 v1.0

> 所有爬虫统一输出格式，对接上游系统。每条 JSON 记录对应**一次关键词搜索的结果集**。

---

## 1. 基本规范

- **编码：** UTF-8
- **换行：** LF（\n）
- **时间：** ISO 8601（`YYYY-MM-DDTHH:mm:ss.sssZ`）
- **数值：** Number，非字符串
- **文件命名：** `{平台}_{关键词}_{级别}_{时间戳}.json`

## 2. 顶层结构

```javascript
{
  // ── 元数据 ──
  "schema": "yuqing.v1",
  "taskId": "TASK-20260517-001",          // 任务唯一ID
  "platform": "douyin",                    // douyin | taobao_live
  "keyword": "食品安全",                    // 搜索关键词
  "keywordGroup": "食品监管",               // 关键词分组（关键词库层级）
  "crawlLevel": "L3",                      // L1 / L2 / L3 / L4
  "crawledAt": "2026-05-17T10:30:00.000Z", // 采集时间
  "totalResults": 20,                      // 本条结果条数

  // ── 搜索结果列表 ──
  "results": [ /* ResultItem */ ],

  // ── 统计摘要 ──
  "summary": {
    "totalResults": 20,
    "avgLikeCount": 12500,
    "avgViewCount": 280000,
    "avgCommentCount": 650,
    "totalAuthors": 18,                    // 去重作者数
    "authors": ["主播昵称1", "主播昵称2"]    // 涉及的所有作者
  }
}
```

## 3. ResultItem（单条结果）

抖音的视频、淘宝直播的直播间，统一用同一个结构。

```javascript
{
  // ── 标识 ──
  "contentId": "douyin_7432xxxxxxxxxxxxx",          // {platform}_{nativeId}
  "platform": "douyin",
  "contentType": "video",                           // video | live_stream
  "nativeId": "7432xxxxxxxxxxxxx",                  // 平台原始ID
  "url": "https://www.douyin.com/video/7432...",   // 原始链接

  // ── 标题/内容 ──
  "title": "视频文案或直播间标题（前100字）",

  // ── 封面（可选） ──
  "coverUrl": "https://...",                        // 封面图/头像

  // ── 作者 ──
  "author": {
    "authorId": "douyin_user_secUid...",            // {platform}_user_{id}
    "nickname": "作者昵称",
    "followerCount": 1250000                        // 粉丝数（可选，部分平台无）
  },

  // ── 指标 ──
  "metrics": {
    "viewCount": 325000,                            // 播放/观看数
    "likeCount": 15200,                             // 点赞数（可选）
    "commentCount": 843,                            // 评论数（可选）
    "shareCount": 1200                              // 分享数（可选）
  },

  // ── 时间 ──
  "publishedAt": "2026-05-17T08:00:00.000Z",       // 发布时间或直播开始时间
  "collectedAt": "2026-05-17T10:30:00.000Z",       // 采集时间

  // ── 平台特有扩展（可选） ──
  "platformFields": { }
}
```

## 4. 平台字段映射

### 抖音爬虫 → 标准字段

| 标准字段 | 抖音 API 原始字段 |
|---------|-----------------|
| contentId | `douyin_{aweme_id}` |
| nativeId | `aweme_id` |
| title | `desc`（视频文案） |
| url | `https://www.douyin.com/video/{aweme_id}` |
| author.authorId | `douyin_user_{author.sec_uid}` |
| author.nickname | `author.nickname` |
| metrics.viewCount | `statistics.play_count` |
| metrics.likeCount | `statistics.digg_count` |
| metrics.commentCount | `statistics.comment_count` |
| metrics.shareCount | `statistics.share_count` |
| publishedAt | `create_time * 1000 → ISO` |

### 淘宝直播爬虫 → 标准字段

| 标准字段 | 淘宝 DOM 原始字段 |
|---------|-----------------|
| contentId | `taobao_live_{liveId}` |
| nativeId | `liveId` |
| title | `[class*="infoText"]` 文本 |
| url | `https://tbzb.taobao.com/live?liveId={liveId}` |
| coverUrl | `[class*="videoWrap"]` backgroundImage |
| author.nickname | `[class*="accountName"]` 文本 |
| author.followerCount | `[class*="infoText"]` 含"粉丝"的指标文本 |
| metrics.viewCount | `[class*="infoText"]` 含"观看"的指标文本 |
| platformFields.liveStatus | 存在 `[class*="livingIcon"]` → `living`，否则 `replay` |
| platformFields.prices | `[class*="price"]` 文本列表 |

### 平台字段示例

**抖音 `platformFields`：**
```javascript
"platformFields": {
  "videoDuration": 120       // 视频时长（秒）
}
```

**淘宝直播 `platformFields`：**
```javascript
"platformFields": {
  "liveStatus": "living",    // living / replay
  "productCount": 12,        // 商品数量
  "prices": ["¥29.9", "¥59.9", "¥99.9"]  // 商品价格列表
}
```

## 5. 文件命名

```
{platform}_{keyword}_{crawlLevel}_{YYYYMMDDTHHmmssZ}.json
```

**示例：**

| 文件名 | 说明 |
|--------|------|
| `douyin_食品安全_L3_20260517T103000Z.json` | 抖音常规采集 |
| `taobao_live_直播带货_L2_20260517T140000Z.json` | 淘宝直播高频采集 |
| `douyin_紧急事件_L1_20260517T103000Z.json` | 抖音实时告警采集 |

## 6. 对接方式

### API 推送

```
POST /api/v1/yuqing/collect
Content-Type: application/json

Body: { ... /* 上述 JSON 对象 */ }

Response:
{ "code": 0, "message": "success", "taskId": "TASK-..." }
```

### 文件传输

爬虫输出至 `output/` 目录，由定时任务（rsync/scp/sftp）同步至上游系统指定目录。

## 7. 字段说明

- 所有字段均为**可选**（除 `schema`、`taskId`、`platform`、`keyword`、`crawledAt`、`results` 外）
- 平台特有字段统一放在 `platformFields` 中，不污染顶层结构
- 未来版本升级通过 `schema` 字段管理兼容性
