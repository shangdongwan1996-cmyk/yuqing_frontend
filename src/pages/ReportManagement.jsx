import { useState, useMemo } from 'react'
import { Table, Button, Select, Input, message, Space, Checkbox, Tag, Form, Card } from 'antd'
import { DownloadOutlined, SyncOutlined, SearchOutlined, FileTextOutlined } from '@ant-design/icons'
import * as XLSX from 'xlsx'

const { Option } = Select

const mockData = [
  { id: 1, taskTime: '2026-06-03 16:40:09', generateTime: '2026-06-03 17:00:00', platform: '百家号', keyword: '流浪猫 浅浅', theme: '谦寻', reportType: '日报', status: '已生成' },
  { id: 2, taskTime: '2026-06-03 16:40:36', generateTime: '2026-06-03 17:15:00', platform: '知乎', keyword: 'babycare投诉', theme: 'Babycare', reportType: '周报', status: '已同步' },
  { id: 3, taskTime: '2026-06-02 10:00:00', generateTime: '2026-06-02 10:30:00', platform: '百家号', keyword: '谦寻投诉', theme: '谦寻', reportType: '日报', status: '已生成' },
  { id: 4, taskTime: '2026-06-01 15:30:00', generateTime: '2026-06-01 16:00:00', platform: '抖音', keyword: '交个朋友售后', theme: '交个朋友', reportType: '日报', status: '已同步' },
  { id: 5, taskTime: '2026-05-31 09:00:00', generateTime: '2026-05-31 09:30:00', platform: '小红书', keyword: 'Babycare质量问题', theme: 'Babycare', reportType: '周报', status: '已生成' },
  { id: 6, taskTime: '2026-06-03 11:00:00', generateTime: '2026-06-03 12:00:00', platform: '百家号', keyword: '谦寻控股新总部', theme: '谦寻', reportType: '专题报告', status: '已生成' },
  { id: 7, taskTime: '2026-06-02 14:00:00', generateTime: '2026-06-02 14:30:00', platform: '微博', keyword: '罗永浩 数码产品', theme: '交个朋友', reportType: '日报', status: '已同步' },
  { id: 8, taskTime: '2026-06-01 10:00:00', generateTime: '2026-06-01 10:30:00', platform: '微博', keyword: 'Babycare新品发布', theme: 'Babycare', reportType: '日报', status: '已生成' },
]

const platforms = ['微博', '抖音', '小红书', '百家号', '知乎']
const statuses = ['已生成', '已同步']
const themes = ['交个朋友', '谦寻', 'Babycare']
const reportTypes = ['日报', '周报', '月报', '专题报告']

function ReportManagement() {
  const [data, setData] = useState(mockData)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [form] = Form.useForm()
  const [filterValues, setFilterValues] = useState({})
  const [refreshKey, setRefreshKey] = useState(0)

  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (filterValues.platform && item.platform !== filterValues.platform) return false
      if (filterValues.keyword && !item.keyword.includes(filterValues.keyword)) return false
      if (filterValues.status && item.status !== filterValues.status) return false
      if (filterValues.theme && item.theme !== filterValues.theme) return false
      return true
    })
  }, [data, filterValues])

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys
  }

  const columns = [
    { title: '归属主题', dataIndex: 'theme', key: 'theme', width: 120, render: (theme) => <span style={{ color: '#1890ff', fontWeight: 'bold' }}>{theme}</span> },
    { title: '报告模板', dataIndex: 'reportType', key: 'reportType', width: 100, render: (type) => <Tag color="blue">{type}</Tag> },
    { title: '任务时间', dataIndex: 'taskTime', key: 'taskTime', width: 160, sorter: (a, b) => new Date(a.taskTime) - new Date(b.taskTime) },
    { title: '生成时间', dataIndex: 'generateTime', key: 'generateTime', width: 160, sorter: (a, b) => new Date(a.generateTime) - new Date(b.generateTime), sortOrder: 'descend' },
    { title: '平台', dataIndex: 'platform', key: 'platform', width: 100 },
    { title: '关键词', dataIndex: 'keyword', key: 'keyword', width: 180 },
    { 
      title: '状态', 
      dataIndex: 'status', 
      key: 'status', 
      width: 100,
      render: (status) => (
        <Tag color={status === '已生成' ? 'orange' : 'green'}>{status}</Tag>
      )
    }
  ]

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
    message.success('数据已同步')
  }

  const handleExport = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择报告')
      return
    }
    const exportData = data
      .filter(item => selectedRowKeys.includes(item.id))
      .map(item => ({
        '归属主题': item.theme,
        '报告模板': item.reportType,
        '任务时间': item.taskTime,
        '生成时间': item.generateTime,
        '平台': item.platform,
        '关键词': item.keyword,
        '状态': item.status
      }))
    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, '舆情报告')
    XLSX.writeFile(workbook, `舆情报告_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.xlsx`)
    message.success(`成功导出 ${selectedRowKeys.length} 条数据`)
  }

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRowKeys(filteredData.map(item => item.id))
    } else {
      setSelectedRowKeys([])
    }
  }

  const handleSearch = () => {
    form.validateFields().then(values => {
      setFilterValues(values)
      setPage(1)
    })
  }

  const handleReset = () => {
    form.resetFields()
    setFilterValues({})
    setPage(1)
  }

  return (
    <Card>
      <Form form={form} layout="inline" style={{ marginBottom: 20, alignItems: 'center' }}>
        <Form.Item name="platform" label="平台">
          <Select placeholder="请选择平台" style={{ width: 120 }}>
            <Option value="">全部</Option>
            {platforms.map(p => <Option key={p} value={p}>{p}</Option>)}
          </Select>
        </Form.Item>
        <Form.Item name="keyword" label="关键词">
          <Input placeholder="请输入关键词" style={{ width: 200 }} />
        </Form.Item>
        <Form.Item name="status" label="状态">
          <Select placeholder="请选择状态" style={{ width: 120 }}>
            <Option value="">全部</Option>
            {statuses.map(s => <Option key={s} value={s}>{s}</Option>)}
          </Select>
        </Form.Item>
        <Form.Item name="theme" label="归属主体">
          <Select placeholder="请选择主体" style={{ width: 120 }}>
            <Option value="">全部</Option>
            {themes.map(t => <Option key={t} value={t}>{t}</Option>)}
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
          <Button 
            onClick={handleExport} 
            icon={<DownloadOutlined />}
            disabled={selectedRowKeys.length === 0}
          >
            导出
          </Button>
        </Space>
      </div>

      <Table
        key={refreshKey}
        rowSelection={rowSelection}
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        pagination={{
          current: page,
          pageSize: pageSize,
          total: filteredData.length,
          onChange: (p) => setPage(p),
          showTotal: (total) => `共 ${total} 条记录`
        }}
        scroll={{ x: 1200 }}
      />
    </Card>
  )
}

export default ReportManagement
