import { useState, useMemo } from 'react'
import { Table, Button, Form, Input, Select, Tag, Space, message } from 'antd'
import { SearchOutlined, SyncOutlined, DownloadOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'
import * as XLSX from 'xlsx'

const { Option } = Select

const mockData = [
  { id: 1, keyword: '流浪猫', source: '百家号', weight: 95, trend: 'up', trendValue: '+12%', relatedKeywords: '浅浅, 翠花, 谦寻', createdAt: '2026-06-01 16:58:26' },
  { id: 2, keyword: '谦寻新总部', source: '百家号', weight: 88, trend: 'up', trendValue: '+8%', relatedKeywords: '董海锋, 杭州滨江', createdAt: '2026-06-01 16:54:16' },
  { id: 3, keyword: '电商直播', source: '亿邦动力', weight: 75, trend: 'neutral', trendValue: '0%', relatedKeywords: '供应链, 产业基础设施', createdAt: '2026-05-31 15:28:19' },
  { id: 4, keyword: '罗永浩', source: '新浪科技', weight: 82, trend: 'up', trendValue: '+5%', relatedKeywords: '交个朋友, 数码产品', createdAt: '2026-06-02 10:30:00' },
  { id: 5, keyword: 'Babycare', source: '消费者报道', weight: 78, trend: 'down', trendValue: '-3%', relatedKeywords: '质量问题, 安全隐患', createdAt: '2026-06-01 09:15:00' },
  { id: 6, keyword: '直播带货', source: '黑猫投诉', weight: 65, trend: 'down', trendValue: '-8%', relatedKeywords: '售后服务, 用户反馈', createdAt: '2026-06-02 14:20:00' },
]

const sources = ['百家号', '微博', '抖音', '小红书', '知乎', '新浪科技', '亿邦动力', '消费者报道', '黑猫投诉']

function DynamicKeywords() {
  const [form] = Form.useForm()
  const [filterValues, setFilterValues] = useState({})
  const [refreshKey, setRefreshKey] = useState(0)

  const handleSearch = () => {
    form.validateFields().then(values => {
      setFilterValues(values)
    })
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
    const exportData = filteredData.map(item => ({
      '关键词': item.keyword,
      '来源': item.source,
      '权重': item.weight,
      '趋势': item.trend === 'up' ? '上升' : item.trend === 'down' ? '下降' : '持平',
      '趋势值': item.trendValue,
      '关联关键词': item.relatedKeywords,
      '发现时间': item.createdAt
    }))
    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, '动态关键词')
    XLSX.writeFile(workbook, '动态关键词库.xlsx')
    message.success('导出成功')
  }

  const filteredData = useMemo(() => {
    return mockData.filter(item => {
      if (filterValues.keyword && !item.keyword.includes(filterValues.keyword)) return false
      if (filterValues.source && item.source !== filterValues.source) return false
      if (filterValues.trend && item.trend !== filterValues.trend) return false
      return true
    })
  }, [mockData, filterValues])

  const columns = [
    { title: '关键词', dataIndex: 'keyword', key: 'keyword', width: 150 },
    { title: '来源', dataIndex: 'source', key: 'source', width: 120 },
    { 
      title: '权重', 
      dataIndex: 'weight', 
      key: 'weight', 
      width: 100,
      render: (weight) => (
        <Tag color={weight >= 80 ? 'red' : weight >= 60 ? 'orange' : 'gray'}>
          {weight}
        </Tag>
      )
    },
    { 
      title: '趋势', 
      dataIndex: 'trend', 
      key: 'trend', 
      width: 120,
      render: (trend, record) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {trend === 'up' && <ArrowUpOutlined style={{ color: '#ff4d4f' }} />}
          {trend === 'down' && <ArrowDownOutlined style={{ color: '#52c41a' }} />}
          <span style={{ color: trend === 'up' ? '#ff4d4f' : trend === 'down' ? '#52c41a' : '#666' }}>
            {record.trendValue}
          </span>
        </span>
      )
    },
    { title: '关联关键词', dataIndex: 'relatedKeywords', key: 'relatedKeywords', width: 200, ellipsis: true },
    { 
      title: '发现时间', 
      dataIndex: 'createdAt', 
      key: 'createdAt', 
      width: 180,
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      sortOrder: 'descend'
    },
  ]

  return (
    <div>
      <Form form={form} layout="inline" style={{ marginBottom: 20, alignItems: 'center' }}>
        <Form.Item name="keyword" label="关键词">
          <Input placeholder="请输入关键词" style={{ width: 200 }} />
        </Form.Item>
        <Form.Item name="source" label="来源">
          <Select placeholder="请选择来源" style={{ width: 150 }}>
            <Option value="">全部</Option>
            {sources.map(source => (
              <Option key={source} value={source}>{source}</Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="trend" label="趋势">
          <Select placeholder="请选择趋势" style={{ width: 120 }}>
            <Option value="">全部</Option>
            <Option value="up">上升</Option>
            <Option value="down">下降</Option>
            <Option value="neutral">持平</Option>
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
      </div>


      <Table
        key={refreshKey}
        dataSource={filteredData}
        columns={columns}
        rowKey="id"
        pagination={{ 
          pageSize: 20,
          showTotal: (total) => `共 ${total} 条记录`
        }}
      />
    </div>
  )
}

export default DynamicKeywords
