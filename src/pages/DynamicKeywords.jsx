import { useState, useMemo } from 'react'
import { Table, Button, Form, Input, Select, Tag, Space, message } from 'antd'
import { SearchOutlined, SyncOutlined, DownloadOutlined, ArrowUpOutlined, ArrowDownOutlined, MinusOutlined } from '@ant-design/icons'
import * as XLSX from 'xlsx'

const { Option } = Select

const themes = ['谦寻', '交个朋友', 'Babycare']

const mockData = [
  // 谦寻
  { id: 1, theme: '谦寻', keyword: '谦寻 投诉', mentions: 4, trend: 'stable', trendValue: '+0', platforms: ['百家号'], firstSeen: '2026-05-31', lastSeen: '2026-06-02', summary: '监测期未捕获负面投诉，均为新总部启用正面报道' },
  { id: 2, theme: '谦寻', keyword: '谦寻新总部', mentions: 4, trend: 'up', trendValue: '+100%', platforms: ['百家号', '潮新闻'], firstSeen: '2026-05-31', lastSeen: '2026-06-02', summary: '新总部大楼启用仪式引发多角度媒体报道' },
  { id: 3, theme: '谦寻', keyword: '流浪猫 浅浅 翠花', mentions: 1, trend: 'stable', trendValue: '+0', platforms: ['百家号'], firstSeen: '2026-06-01', lastSeen: '2026-06-01', summary: '潮新闻报道新总部人文细节，流浪动物关怀话题' },
  { id: 4, theme: '谦寻', keyword: '董海锋', mentions: 1, trend: 'stable', trendValue: '+0', platforms: ['百家号'], firstSeen: '2026-06-01', lastSeen: '2026-06-01', summary: '企业负责人关联关键词，建议纳入常规监测' },
  { id: 5, theme: '谦寻', keyword: '林依轮 谦寻', mentions: 0, trend: 'new', trendValue: '新增', platforms: ['建议监测'], firstSeen: '—', lastSeen: '—', summary: '建议新增：监测谦寻旗下头部主播关联舆情' },
  // 交个朋友
  { id: 6, theme: '交个朋友', keyword: '交个朋友 投诉', mentions: 4, trend: 'up', trendValue: '+50%', platforms: ['黑猫投诉', '消费保'], firstSeen: '2026-05-29', lastSeen: '2026-06-02', summary: '全部为负面投诉，集中在第三方维权平台，投诉量48条' },
  { id: 7, theme: '交个朋友', keyword: '交个朋友电商学苑', mentions: 3, trend: 'up', trendValue: '+30%', platforms: ['黑猫投诉', '消费保'], firstSeen: '2026-05-29', lastSeen: '2026-06-02', summary: '课程虚假宣传与退款纠纷集群事件，涉及多分公司' },
  { id: 8, theme: '交个朋友', keyword: '交个朋友 退款', mentions: 2, trend: 'up', trendValue: '+25%', platforms: ['黑猫投诉'], firstSeen: '2026-05-29', lastSeen: '2026-06-02', summary: '退款纠纷持续近一年未解决，解决率仅5.26%' },
  { id: 9, theme: '交个朋友', keyword: '交个朋友 3980', mentions: 1, trend: 'up', trendValue: '+100%', platforms: ['黑猫投诉'], firstSeen: '2026-06-01', lastSeen: '2026-06-02', summary: '3980元课程价格投诉标签，建议作为搜索关键词' },
  { id: 10, theme: '交个朋友', keyword: '杭州交个朋友教育科技', mentions: 0, trend: 'new', trendValue: '新增', platforms: ['建议监测'], firstSeen: '—', lastSeen: '—', summary: '建议新增：监测企业全称关联舆情及分支机构' },
  // Babycare
  { id: 11, theme: 'Babycare', keyword: 'babycare 投诉', mentions: 2, trend: 'down', trendValue: '-50%', platforms: ['新闻媒体站'], firstSeen: '2026-05-31', lastSeen: '2026-06-01', summary: '未捕获负面投诉，均为品牌澄清不实传言的回应报道' },
  { id: 12, theme: 'Babycare', keyword: 'Babycare 湿巾 锑', mentions: 2, trend: 'down', trendValue: '-80%', platforms: ['新闻媒体站'], firstSeen: '2026-04-01', lastSeen: '2026-06-01', summary: '行业级舆情：湿巾含重金属锑不实传言，已回落期' },
  { id: 13, theme: 'Babycare', keyword: 'Babycare 重金属', mentions: 0, trend: 'new', trendValue: '新增', platforms: ['建议监测'], firstSeen: '—', lastSeen: '—', summary: '建议新增：母婴品类对安全类传言极度敏感，重点监测' },
  { id: 14, theme: 'Babycare', keyword: 'Babycare 质量问题', mentions: 0, trend: 'new', trendValue: '新增', platforms: ['建议监测'], firstSeen: '—', lastSeen: '—', summary: '建议新增：扩展监测维度覆盖产品安全与质量类舆情' },
]

function DynamicKeywords() {
  const [form] = Form.useForm()
  const [filterValues, setFilterValues] = useState({})
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])

  const handleSearch = () => {
    form.validateFields().then(values => setFilterValues(values))
  }

  const handleReset = () => {
    form.resetFields()
    setFilterValues({})
  }

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
    message.success('数据已刷新')
  }

  const handleExport = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选中需要导出的数据')
      return
    }
    const exportData = mockData
      .filter(item => selectedRowKeys.includes(item.id))
      .map(item => ({
      '归属主体': item.theme,
      '关键词': item.keyword,
      '提及量': item.mentions,
      '趋势': item.trend === 'up' ? '上升' : item.trend === 'down' ? '下降' : item.trend === 'new' ? '新增' : '持平',
      '趋势值': item.trendValue,
      '来源平台': item.platforms.join('、'),
      '首次发现': item.firstSeen,
      '最近出现': item.lastSeen,
      '摘要说明': item.summary
    }))
    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, '动态关键词库')
    XLSX.writeFile(workbook, '动态关键词库.xlsx')
    message.success(`成功导出 ${selectedRowKeys.length} 条数据`)
    setSelectedRowKeys([])
  }

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys
  }

  const filteredData = useMemo(() => {
    return mockData.filter(item => {
      if (filterValues.keyword && !item.keyword.includes(filterValues.keyword)) return false
      if (filterValues.theme && item.theme !== filterValues.theme) return false
      if (filterValues.trend && item.trend !== filterValues.trend) return false
      return true
    })
  }, [filterValues])

  const trendIcon = (trend) => {
    if (trend === 'up') return <ArrowUpOutlined style={{ color: '#ff4d4f' }} />
    if (trend === 'down') return <ArrowDownOutlined style={{ color: '#52c41a' }} />
    if (trend === 'new') return <MinusOutlined style={{ color: '#1890ff' }} />
    return <MinusOutlined style={{ color: '#bfbfbf' }} />
  }

  const columns = [
    {
      title: '归属主体',
      dataIndex: 'theme',
      key: 'theme',
      width: 110,
      render: (theme) => <span style={{ color: '#1890ff', fontWeight: 'bold' }}>{theme}</span>
    },
    { title: '关键词', dataIndex: 'keyword', key: 'keyword', width: 200, ellipsis: true },
    {
      title: '提及量',
      dataIndex: 'mentions',
      key: 'mentions',
      width: 90,
      sorter: (a, b) => a.mentions - b.mentions,
      render: (count) => (
        <Tag color={count >= 3 ? 'red' : count >= 1 ? 'orange' : 'default'}>
          {count > 0 ? count : '建议'}
        </Tag>
      )
    },
    {
      title: '趋势',
      dataIndex: 'trend',
      key: 'trend',
      width: 110,
      render: (trend, record) => (
        <Space size={4}>
          {trendIcon(trend)}
          <span style={{
            color: trend === 'up' ? '#ff4d4f' : trend === 'down' ? '#52c41a' : trend === 'new' ? '#1890ff' : '#666'
          }}>
            {record.trendValue}
          </span>
        </Space>
      )
    },
    {
      title: '来源平台',
      dataIndex: 'platforms',
      key: 'platforms',
      width: 180,
      render: (platforms) => platforms.map(p => <Tag key={p} style={{ marginBottom: 2 }}>{p}</Tag>)
    },
    {
      title: '首次发现',
      dataIndex: 'firstSeen',
      key: 'firstSeen',
      width: 110
    },
    {
      title: '最近出现',
      dataIndex: 'lastSeen',
      key: 'lastSeen',
      width: 110
    },
    {
      title: '摘要说明',
      dataIndex: 'summary',
      key: 'summary',
      width: 300,
      ellipsis: true
    },
    {
      title: '分析说明',
      dataIndex: 'summary',
      key: 'analysis',
      width: 350,
      render: (text, record) => (
        <div>
          <span>{text}</span>
          {record.trend === 'new' && (
            <div style={{ marginTop: 4, padding: '4px 8px', background: '#e6f7ff', borderRadius: 2, border: '1px solid #91d5ff', fontSize: 12, color: '#1890ff' }}>
              建议新增，尚未纳入常规监测
            </div>
          )}
        </div>
      )
    },
  ]

  return (
    <div>
      <Form form={form} layout="inline" style={{ marginBottom: 20 }}>
        <Form.Item name="keyword" label="关键词">
          <Input placeholder="请输入关键词" style={{ width: 200 }} />
        </Form.Item>
        <Form.Item name="theme" label="归属主体">
          <Select placeholder="请选择主体" style={{ width: 140 }} allowClear>
            <Option value="">全部</Option>
            {themes.map(t => <Option key={t} value={t}>{t}</Option>)}
          </Select>
        </Form.Item>
        <Form.Item name="trend" label="趋势">
          <Select placeholder="请选择趋势" style={{ width: 110 }} allowClear>
            <Option value="">全部</Option>
            <Option value="up">上升</Option>
            <Option value="down">下降</Option>
            <Option value="stable">持平</Option>
            <Option value="new">新增</Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" onClick={handleSearch} icon={<SearchOutlined />}>查询</Button>
            <Button onClick={handleReset}>重置</Button>
          </Space>
        </Form.Item>
      </Form>

      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Button onClick={handleRefresh} icon={<SyncOutlined />}>刷新</Button>
          <Button onClick={handleExport} icon={<DownloadOutlined />}>导出</Button>
        </Space>
        <span style={{ color: '#8c8c8c', fontSize: 13 }}>
          基于搜索结果总结的主题关键词库，含建议新增词
        </span>
      </div>

      <Table
        key={refreshKey}
        rowSelection={rowSelection}
        dataSource={filteredData}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 20, showTotal: (total) => `共 ${total} 条` }}
        scroll={{ x: 1500 }}
      />
    </div>
  )
}

export default DynamicKeywords
