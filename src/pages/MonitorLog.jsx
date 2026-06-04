import { useState, useMemo } from 'react'
import { Table, Button, Form, Input, Select, Tag, Space } from 'antd'
import { SearchOutlined, SyncOutlined, DownloadOutlined } from '@ant-design/icons'
import * as XLSX from 'xlsx'

const { Option } = Select

const mockData = [
  {
    id: 1,
    taskNo: '20260603164009',
    theme: '交个朋友',
    keyword: '交个朋友投诉',
    engine: '百度',
    dataType: '网页',
    sentiment: '负面',
    themeRelevance: '高',
    themeRelevanceReason: '直接提及交个朋友直播间投诉内容',
    adminRelevance: '中',
    adminRelevanceReason: '涉及消费者权益保护相关监管',
    url: 'https://example.com/jiaogepengyou-complaint',
    snippet: '用户投诉交个朋友直播间商品质量问题...',
    content: '近日，有消费者在黑猫投诉平台反映，在交个朋友直播间购买的商品存在质量问题，要求退货退款未果。该投诉引发网友广泛关注...',
    siteName: '黑猫投诉',
    publishAt: '2026-06-03 10:00:00',
    createAt: '2026-06-03 16:40:25'
  },
  {
    id: 2,
    taskNo: '20260603164009',
    theme: '交个朋友',
    keyword: '交个朋友投诉',
    engine: '百度',
    dataType: '网页',
    sentiment: '负面',
    themeRelevance: '高',
    themeRelevanceReason: '消费者直接投诉交个朋友售后服务',
    adminRelevance: '低',
    adminRelevanceReason: '未涉及具体监管行动',
    url: 'https://example.com/jiaogepengyou-service-2',
    snippet: '交个朋友直播间售后无人回应...',
    content: '消费者反映在交个朋友直播间购买数码产品后，发现产品存在瑕疵，联系售后无人回应，维权困难...',
    siteName: '消费者报道',
    publishAt: '2026-06-03 09:30:00',
    createAt: '2026-06-03 16:40:25'
  },
  {
    id: 3,
    taskNo: '20260603164036',
    theme: 'Babycare',
    keyword: 'Babycare 质量问题',
    engine: '百度',
    dataType: '网页',
    sentiment: '负面',
    themeRelevance: '高',
    themeRelevanceReason: '消费者投诉Babycare产品质量问题',
    adminRelevance: '高',
    adminRelevanceReason: '涉及市场监管部门调查',
    url: 'https://example.com/babycare-quality',
    snippet: '消费者投诉Babycare产品存在安全隐患...',
    content: '消费者投诉Babycare产品存在安全隐患，已引起监管部门关注，相关部门已介入调查...',
    siteName: '消费者报道',
    publishAt: '2026-06-01 09:15:00',
    createAt: '2026-06-03 16:50:00'
  },
  {
    id: 4,
    taskNo: '20260602100000',
    theme: '谦寻',
    keyword: '流浪猫 浅浅',
    engine: '百度',
    dataType: '网页',
    sentiment: '正面',
    themeRelevance: '高',
    themeRelevanceReason: '提及谦寻新总部及企业文化',
    adminRelevance: '中',
    adminRelevanceReason: '提及企业负责人及员工',
    url: 'https://baijiahao.baidu.com/s?id=1866784451764945742',
    snippet: '流浪猫"浅浅"和流浪狗"翠花"有工位!在谦寻新总部,我们发现不少秘密...',
    content: '流浪猫"浅浅"和流浪狗"翠花"有工位!在谦寻新总部,我们发现不少秘密 潮新闻客户端...',
    siteName: '百家号',
    publishAt: '2026-06-01 16:58:26',
    createAt: '2026-06-03 16:40:25'
  },
  {
    id: 5,
    taskNo: '20260602100000',
    theme: '谦寻',
    keyword: '谦寻控股 新总部',
    engine: '百度',
    dataType: '网页',
    sentiment: '中性',
    themeRelevance: '低',
    themeRelevanceReason: '未提及具体投诉内容，仅描述企业新总部启用仪式',
    adminRelevance: '低',
    adminRelevanceReason: '未涉及滨江区市场监管局或具体监管行动',
    url: 'https://baijiahao.baidu.com/s?id=1866784264382895544',
    snippet: '5月31日,谦寻控股新总部大楼启用仪式在杭州滨江区隆重举行...',
    content: '5月31日,谦寻控股新总部大楼启用仪式在杭州滨江区隆重举行，标志着企业发展进入新阶段...',
    siteName: '百家号',
    publishAt: '2026-06-01 16:54:16',
    createAt: '2026-06-03 16:40:25'
  },
  {
    id: 6,
    taskNo: '20260601153000',
    theme: '交个朋友',
    keyword: '交个朋友售后',
    engine: '百度',
    dataType: '网页',
    sentiment: '中性',
    themeRelevance: '中',
    themeRelevanceReason: '用户反馈售后服务响应问题',
    adminRelevance: '低',
    adminRelevanceReason: '未涉及监管部门',
    url: 'https://example.com/jiaogepengyou-service',
    snippet: '部分用户反映交个朋友直播间售后服务响应慢...',
    content: '部分用户反映交个朋友直播间售后服务响应慢，等待时间过长，希望能改进...',
    siteName: '黑猫投诉',
    publishAt: '2026-06-02 14:20:00',
    createAt: '2026-06-03 16:55:00'
  },
  {
    id: 7,
    taskNo: '20260603110000',
    theme: '谦寻',
    keyword: '电商直播 运行规则',
    engine: '百度',
    dataType: '网页',
    sentiment: '中性',
    themeRelevance: '低',
    themeRelevanceReason: '未提及具体投诉内容，仅分析企业战略',
    adminRelevance: '低',
    adminRelevanceReason: '未涉及具体监管行动',
    url: 'https://baijiahao.baidu.com/s?id=1866688101728489320',
    snippet: '谦寻新总部背后,电商直播的运行规则变了...',
    content: '谦寻新总部背后,电商直播的运行规则变了，行业格局正在重塑...',
    siteName: '百家号',
    publishAt: '2026-05-31 15:28:19',
    createAt: '2026-06-03 16:40:25'
  },
]

function MonitorLog() {
  const [form] = Form.useForm()
  const [filterValues, setFilterValues] = useState({})
  const [refreshKey, setRefreshKey] = useState(0)

  const handleSearch = () => {
    form.validateFields().then(values => setFilterValues(values))
  }

  const handleReset = () => {
    form.resetFields()
    setFilterValues({})
  }

  const handleRefresh = () => setRefreshKey(prev => prev + 1)

  const handleExport = () => {
    const exportData = filteredData.map(item => ({
      '任务流水号': item.taskNo,
      '主体': item.theme,
      '关键词': item.keyword,
      '搜索引擎': item.engine,
      '数据类型': item.dataType,
      '智能分析结果': item.sentiment,
      '主题关联度': item.themeRelevance,
      '主题关联度原因': item.themeRelevanceReason,
      '管理局关联度': item.adminRelevance,
      '管理局关联度原因': item.adminRelevanceReason,
      '链接': item.url,
      '片段': item.snippet,
      '内容': item.content,
      '站点': item.siteName,
      '发布时间': item.publishAt,
      '创建时间': item.createAt
    }))
    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, '监测数据日志')
    XLSX.writeFile(workbook, '监测数据日志.xlsx')
  }

  const filteredData = useMemo(() => {
    return mockData.filter(item => {
      if (filterValues.theme && item.theme !== filterValues.theme) return false
      if (filterValues.keyword && !item.keyword.includes(filterValues.keyword)) return false
      if (filterValues.sentiment && item.sentiment !== filterValues.sentiment) return false
      if (filterValues.siteName && !item.siteName.includes(filterValues.siteName)) return false
      return true
    })
  }, [filterValues])

  const relevanceColor = (text) => text === '高' ? 'red' : text === '中' ? 'orange' : 'gray'
  const sentimentColor = (text) => text === '正面' ? 'green' : text === '负面' ? 'red' : 'gray'

  const columns = [
    { title: '任务流水号', dataIndex: 'taskNo', key: 'taskNo', width: 160, fixed: 'left' },
    { title: '主体', dataIndex: 'theme', key: 'theme', width: 100 },
    { title: '关键词', dataIndex: 'keyword', key: 'keyword', width: 150 },
    { title: '搜索引擎', dataIndex: 'engine', key: 'engine', width: 80 },
    { title: '数据类型', dataIndex: 'dataType', key: 'dataType', width: 80 },
    {
      title: '智能分析结果',
      dataIndex: 'sentiment',
      key: 'sentiment',
      width: 110,
      render: (text) => <Tag color={sentimentColor(text)}>{text}</Tag>
    },
    {
      title: '主题关联度',
      dataIndex: 'themeRelevance',
      key: 'themeRelevance',
      width: 100,
      render: (text) => <Tag color={relevanceColor(text)}>{text}</Tag>
    },
    { title: '原因', dataIndex: 'themeRelevanceReason', key: 'themeRelevanceReason', width: 200, ellipsis: true },
    {
      title: '管理局关联度',
      dataIndex: 'adminRelevance',
      key: 'adminRelevance',
      width: 110,
      render: (text) => <Tag color={relevanceColor(text)}>{text}</Tag>
    },
    { title: '原因', dataIndex: 'adminRelevanceReason', key: 'adminRelevanceReason', width: 200, ellipsis: true },
    { title: '链接', dataIndex: 'url', key: 'url', width: 200, ellipsis: true, render: (url) => <a href={url} target="_blank" rel="noopener noreferrer">{url}</a> },
    { title: '片段', dataIndex: 'snippet', key: 'snippet', width: 250, ellipsis: true },
    { title: '内容', dataIndex: 'content', key: 'content', width: 300, ellipsis: true },
    { title: '站点', dataIndex: 'siteName', key: 'siteName', width: 100 },
    {
      title: '发布时间',
      dataIndex: 'publishAt',
      key: 'publishAt',
      width: 160,
      sorter: (a, b) => new Date(a.publishAt) - new Date(b.publishAt),
      sortOrder: 'descend'
    },
    {
      title: '创建时间',
      dataIndex: 'createAt',
      key: 'createAt',
      width: 160,
      sorter: (a, b) => new Date(a.createAt) - new Date(b.createAt)
    },
  ]

  return (
    <div>
      <Form form={form} layout="inline" style={{ marginBottom: 20 }}>
        <Form.Item name="theme" label="主体">
          <Select placeholder="请选择主体" style={{ width: 150 }} allowClear>
            <Option value="交个朋友">交个朋友</Option>
            <Option value="谦寻">谦寻</Option>
            <Option value="Babycare">Babycare</Option>
          </Select>
        </Form.Item>
        <Form.Item name="keyword" label="关键词">
          <Input placeholder="请输入关键词" style={{ width: 200 }} />
        </Form.Item>
        <Form.Item name="sentiment" label="智能分析结果">
          <Select placeholder="请选择" style={{ width: 120 }} allowClear>
            <Option value="正面">正面</Option>
            <Option value="负面">负面</Option>
            <Option value="中性">中性</Option>
          </Select>
        </Form.Item>
        <Form.Item name="siteName" label="站点">
          <Input placeholder="请输入站点" style={{ width: 150 }} />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" onClick={handleSearch} icon={<SearchOutlined />}>查询</Button>
            <Button onClick={handleReset}>重置</Button>
          </Space>
        </Form.Item>
      </Form>

      <div style={{ marginBottom: 16 }}>
        <Space>
          <Button onClick={handleRefresh} icon={<SyncOutlined />}>刷新</Button>
          <Button onClick={handleExport} icon={<DownloadOutlined />}>全部导出</Button>
        </Space>
      </div>

      <Table
        key={refreshKey}
        dataSource={filteredData}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 20, showTotal: (total) => `共 ${total} 条记录` }}
        scroll={{ x: 2400 }}
      />
    </div>
  )
}

export default MonitorLog
