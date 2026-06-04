import { useState, useMemo } from 'react'
import { Table, Button, Modal, Form, Input, Select, Space, message, DatePicker, Tag } from 'antd'
import { PlayCircleOutlined, SearchOutlined, SyncOutlined, DownloadOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import * as XLSX from 'xlsx'

const { Option } = Select
const { RangePicker } = DatePicker

const themes = ['交个朋友', '谦寻', 'Babycare']
const platforms = ['微博', '抖音', '小红书', '百家号', '知乎']
const executeTypes = ['定时触发', '手动触发']
const statuses = ['进行中', '已完成', '已失败', '已生成']

const mockData = [
  { id: 1, taskNo: '20260603164009', theme: '交个朋友', keyword: '交个朋友投诉', platform: '微博', executeType: '手动触发', timeRange: '2026-06-02 至 2026-06-03', status: '已完成', resultCount: 4, errorLog: '', createdAt: '2026-06-03 16:40:09' },
  { id: 2, taskNo: '20260603164036', theme: 'Babycare', keyword: 'babycare投诉', platform: '知乎', executeType: '定时触发', timeRange: '2026-05-31 至 2026-06-01', status: '已完成', resultCount: 2, errorLog: '', createdAt: '2026-06-03 16:40:36' },
  { id: 3, taskNo: '20260602100000', theme: '谦寻', keyword: '流浪猫 浅浅', platform: '百家号', executeType: '定时触发', timeRange: '2026-06-01 至 2026-06-02', status: '已完成', resultCount: 3, errorLog: '', createdAt: '2026-06-02 10:00:00' },
  { id: 4, taskNo: '20260601153000', theme: '交个朋友', keyword: '交个朋友售后', platform: '抖音', executeType: '手动触发', timeRange: '最近24小时', status: '已生成', resultCount: 12, errorLog: '', createdAt: '2026-06-01 15:30:00' },
  { id: 5, taskNo: '20260531090000', theme: 'Babycare', keyword: 'Babycare质量问题', platform: '小红书', executeType: '定时触发', timeRange: '2026-05-30 至 2026-05-31', status: '已失败', resultCount: 0, errorLog: 'API限流，请求被拒绝', createdAt: '2026-05-31 09:00:00' },
  { id: 6, taskNo: '20260603110000', theme: '谦寻', keyword: '谦寻控股新总部', platform: '百家号', executeType: '定时触发', timeRange: '2026-06-02 至 2026-06-03', status: '进行中', resultCount: 0, errorLog: '', createdAt: '2026-06-03 11:00:00' },
]

function TaskManagement() {
  const [data, setData] = useState(mockData)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [form] = Form.useForm()
  const [filterValues, setFilterValues] = useState({})
  const [modalVisible, setModalVisible] = useState(false)
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
    const exportData = filteredData.map(item => ({
      '任务流水号': item.taskNo,
      '归属主体': item.theme,
      '关键词': item.keyword,
      '平台': item.platform,
      '执行方式': item.executeType,
      '时间范围': item.timeRange,
      '执行状态': item.status,
      '关联结果数': item.resultCount,
      '错误日志': item.errorLog || '-',
      '创建时间': item.createdAt
    }))
    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, '监测任务')
    XLSX.writeFile(workbook, '监测任务.xlsx')
  }

  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (filterValues.platform && item.platform !== filterValues.platform) return false
      if (filterValues.keyword && !item.keyword.includes(filterValues.keyword)) return false
      if (filterValues.status && item.status !== filterValues.status) return false
      if (filterValues.theme && item.theme !== filterValues.theme) return false
      return true
    })
  }, [data, filterValues])

  const handleExecuteTask = () => {
    form.validateFields().then(values => {
      const timeRangeStr = values.timeRange 
        ? `${dayjs(values.timeRange[0]).format('YYYY-MM-DD')} 至 ${dayjs(values.timeRange[1]).format('YYYY-MM-DD')}`
        : '最近24小时'
      
      const newTask = {
        id: Date.now(),
        taskNo: dayjs().format('YYYYMMDDHHmmss'),
        theme: values.theme,
        keyword: `${values.theme}相关舆情`,
        platform: values.platform || '全部',
        executeType: '手动触发',
        timeRange: timeRangeStr,
        status: '进行中',
        resultCount: 0,
        errorLog: '',
        createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss')
      }
      
      setData([newTask, ...data])
      message.success('任务已提交，正在执行...')
      
      setTimeout(() => {
        setData(data.map(item => 
          item.id === newTask.id 
            ? { ...item, status: '已完成', resultCount: Math.floor(Math.random() * 10) + 1 }
            : item
        ))
      }, 2000)
      
      setModalVisible(false)
      form.resetFields()
    }).catch(err => {
      message.error('表单验证失败')
    })
  }

  const getStatusColor = (status) => {
    switch(status) {
      case '已完成': return 'green'
      case '已生成': return 'blue'
      case '进行中': return 'orange'
      case '已失败': return 'red'
      default: return 'gray'
    }
  }

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys
  }

  const columns = [
    { title: '任务流水号', dataIndex: 'taskNo', key: 'taskNo', width: 160 },
    { 
      title: '归属主题', 
      dataIndex: 'theme', 
      key: 'theme', 
      width: 120,
      render: (theme) => <span style={{ color: '#1890ff', fontWeight: 'bold' }}>{theme}</span>
    },
    { title: '关键词', dataIndex: 'keyword', key: 'keyword', width: 180 },
    { title: '平台', dataIndex: 'platform', key: 'platform', width: 100 },
    { 
      title: '执行方式', 
      dataIndex: 'executeType', 
      key: 'executeType', 
      width: 120,
      render: (type) => (
        <Tag color={type === '手动触发' ? 'orange' : 'green'}>{type}</Tag>
      )
    },
    { title: '时间范围', dataIndex: 'timeRange', key: 'timeRange', width: 180 },
    { 
      title: '执行状态', 
      dataIndex: 'status', 
      key: 'status', 
      width: 100,
      render: (status) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      )
    },
    { 
      title: '关联结果数', 
      dataIndex: 'resultCount', 
      key: 'resultCount', 
      width: 120,
      render: (count) => (
        <span style={{ color: count > 0 ? '#1890ff' : '#bfbfbf' }}>{count}</span>
      )
    },
    { 
      title: '错误日志', 
      dataIndex: 'errorLog', 
      key: 'errorLog', 
      width: 200,
      render: (log) => log ? (
        <span style={{ color: '#ff4d4f', fontSize: '12px' }}>{log}</span>
      ) : (
        <span style={{ color: '#bfbfbf' }}>-</span>
      )
    },
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
      <Form form={form} layout="inline" style={{ marginBottom: 20, alignItems: 'center' }}>
        <Form.Item name="platform" label="平台">
          <Select placeholder="请选择平台" style={{ width: 120 }}>
            <Option value="">全部</Option>
            {platforms.map(platform => (
              <Option key={platform} value={platform}>{platform}</Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="keyword" label="关键词">
          <Input placeholder="请输入关键词" style={{ width: 200 }} />
        </Form.Item>
        <Form.Item name="status" label="状态">
          <Select placeholder="请选择状态" style={{ width: 120 }}>
            <Option value="">全部</Option>
            {statuses.map(status => (
              <Option key={status} value={status}>{status}</Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="theme" label="归属主题">
          <Select placeholder="请选择主题" style={{ width: 120 }}>
            <Option value="">全部</Option>
            {themes.map(theme => (
              <Option key={theme} value={theme}>{theme}</Option>
            ))}
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
        <Button type="primary" icon={<PlayCircleOutlined />} onClick={() => setModalVisible(true)}>执行任务</Button>
      </div>

      <Table
        key={refreshKey}
        rowSelection={rowSelection}
        dataSource={filteredData}
        columns={columns}
        rowKey="id"
        pagination={{
          current: page,
          pageSize: pageSize,
          total: filteredData.length,
          onChange: (page) => setPage(page),
          showTotal: (total) => `共 ${total} 条记录`
        }}
        scroll={{ x: 1200 }}
      />

      <Modal
        title="手动执行任务"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleExecuteTask}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="theme"
            label="归属主体"
            rules={[{ required: true, message: '请选择归属主体' }]}
          >
            <Select placeholder="请选择归属主体">
              {themes.map(theme => (
                <Option key={theme} value={theme}>{theme}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="platform"
            label="平台"
          >
            <Select placeholder="请选择平台">
              <Option value="">全部平台</Option>
              {platforms.map(platform => (
                <Option key={platform} value={platform}>{platform}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="timeRange"
            label="时间范围"
          >
            <RangePicker 
              placeholder={['开始时间', '结束时间']}
              format="YYYY-MM-DD"
            />
            <span style={{ marginLeft: 12, color: '#999', fontSize: 12 }}>
              不选择则默认抓取最近24小时数据
            </span>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default TaskManagement
