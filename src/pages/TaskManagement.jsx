import { useState, useMemo } from 'react'
import { Table, Button, Form, Input, Select, Space, message, Modal, Tag } from 'antd'
import { PlayCircleOutlined, SearchOutlined, SyncOutlined, DownloadOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import * as XLSX from 'xlsx'

const { Option } = Select

const mockData = [
  { id: 1, taskNo: '20260603164009', theme: '交个朋友', keyword: '交个朋友投诉', status: '成功', resultCount: 4, remark: '', createdAt: '2026-06-03 16:40:09' },
  { id: 2, taskNo: '20260603164036', theme: 'Babycare', keyword: 'babycare投诉', status: '成功', resultCount: 2, remark: '', createdAt: '2026-06-03 16:40:36' },
  { id: 3, taskNo: '20260602100000', theme: '谦寻', keyword: '流浪猫 浅浅', status: '成功', resultCount: 3, remark: '', createdAt: '2026-06-02 10:00:00' },
  { id: 4, taskNo: '20260601153000', theme: '交个朋友', keyword: '交个朋友售后', status: '成功', resultCount: 12, remark: '', createdAt: '2026-06-01 15:30:00' },
  { id: 5, taskNo: '20260531090000', theme: 'Babycare', keyword: 'Babycare质量问题', status: '已失败', resultCount: 0, remark: 'API限流，请求被拒绝', createdAt: '2026-05-31 09:00:00' },
  { id: 6, taskNo: '20260603110000', theme: '谦寻', keyword: '谦寻控股新总部', status: '成功', resultCount: 1, remark: '', createdAt: '2026-06-03 11:00:00' },
]

function TaskManagement() {
  const [data, setData] = useState(mockData)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [form] = Form.useForm()
  const [filterValues, setFilterValues] = useState({})
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])

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

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
    message.success('数据已刷新')
  }

  const handleExport = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选中需要导出的数据')
      return
    }
    const exportData = data
      .filter(item => selectedRowKeys.includes(item.id))
      .map(item => ({
        '任务流水号': item.taskNo,
        '主体': item.theme,
        '关键词': item.keyword,
        '执行状态': item.status,
        '关联结果数': item.resultCount,
        '备注': item.remark || '',
        '创建时间': item.createdAt
      }))
    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, '监测任务')
    XLSX.writeFile(workbook, '监测任务.xlsx')
    message.success(`成功导出 ${selectedRowKeys.length} 条数据`)
    setSelectedRowKeys([])
  }

  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (filterValues.keyword && !item.keyword.includes(filterValues.keyword)) return false
      if (filterValues.status && item.status !== filterValues.status) return false
      if (filterValues.theme && item.theme !== filterValues.theme) return false
      return true
    })
  }, [data, filterValues])

  const handleExecuteTask = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选中需要执行的任务')
      return
    }
    const selectedItems = data.filter(item => selectedRowKeys.includes(item.id))
    const themes = [...new Set(selectedItems.map(item => item.theme))].join('、')
    const keywords = selectedItems.map(item => item.keyword).join('、')

    Modal.confirm({
      title: '确认生成任务',
      content: `确定要执行以下任务吗？\n主体：${themes}\n关键词：${keywords}`,
      okText: '确认生成',
      cancelText: '取消',
      onOk() {
        const newTasks = selectedItems.map(item => ({
          id: Date.now() + Math.random(),
          taskNo: dayjs().format('YYYYMMDDHHmmss') + Math.random().toString().slice(2, 6),
          theme: item.theme,
          keyword: item.keyword,
          status: '成功',
          resultCount: Math.floor(Math.random() * 10) + 1,
          remark: '',
          createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss')
        }))
        setData([...newTasks, ...data])
        setSelectedRowKeys([])
        message.success(`已生成 ${newTasks.length} 条任务`)
      }
    })
  }

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys
  }

  const columns = [
    { title: '任务流水号', dataIndex: 'taskNo', key: 'taskNo', width: 160 },
    {
      title: '主体',
      dataIndex: 'theme',
      key: 'theme',
      width: 120,
      render: (theme) => <span style={{ color: '#1890ff', fontWeight: 'bold' }}>{theme}</span>
    },
    { title: '关键词', dataIndex: 'keyword', key: 'keyword', width: 180 },
    {
      title: '执行状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === '成功' ? 'green' : 'red'}>{status}</Tag>
      )
    },
    {
      title: '关联结果数',
      dataIndex: 'resultCount',
      key: 'resultCount',
      width: 120,
      render: (count) => <span style={{ color: count > 0 ? '#1890ff' : '#bfbfbf' }}>{count}</span>
    },
    { title: '备注', dataIndex: 'remark', key: 'remark', width: 200, ellipsis: true, render: (text) => text || <span style={{ color: '#bfbfbf' }}>-</span> },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      sortOrder: 'descend'
    },
  ]

  return (
    <div>
      <Form form={form} layout="inline" style={{ marginBottom: 20 }}>
        <Form.Item name="keyword" label="关键词">
          <Input placeholder="请输入关键词" style={{ width: 200 }} />
        </Form.Item>
        <Form.Item name="status" label="执行状态">
          <Select placeholder="请选择状态" style={{ width: 120 }} allowClear>
            <Option value="">全部</Option>
            <Option value="成功">成功</Option>
            <Option value="已失败">已失败</Option>
          </Select>
        </Form.Item>
        <Form.Item name="theme" label="主体">
          <Select placeholder="请选择主体" style={{ width: 150 }} allowClear>
            <Option value="">全部</Option>
            <Option value="交个朋友">交个朋友</Option>
            <Option value="谦寻">谦寻</Option>
            <Option value="Babycare">Babycare</Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" onClick={handleSearch} icon={<SearchOutlined />}>查询</Button>
            <Button onClick={handleReset}>重置</Button>
          </Space>
        </Form.Item>
      </Form>

      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Space>
          <Button onClick={handleRefresh} icon={<SyncOutlined />}>刷新</Button>
          <Button onClick={handleExport} icon={<DownloadOutlined />}>导出</Button>
        </Space>
        <Button type="primary" icon={<PlayCircleOutlined />} onClick={handleExecuteTask}>手动执行单主题任务</Button>
      </div>

      <Table
        key={refreshKey}
        rowSelection={rowSelection}
        dataSource={filteredData}
        columns={columns}
        rowKey="id"
        pagination={{
          current: page,
          pageSize,
          total: filteredData.length,
          onChange: (p) => setPage(p),
          showTotal: (total) => `共 ${total} 条记录`
        }}
        scroll={{ x: 1000 }}
      />
    </div>
  )
}

export default TaskManagement
