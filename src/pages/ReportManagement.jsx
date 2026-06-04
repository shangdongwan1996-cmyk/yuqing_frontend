import { useState, useMemo } from 'react'
import { Table, Button, Select, Input, message, Space, Checkbox } from 'antd'
import { DownloadOutlined, SyncOutlined, SearchOutlined } from '@ant-design/icons'
import * as XLSX from 'xlsx'

const { Option } = Select

const mockData = [
  { id: 1, taskTime: '2026-05-31 10:00', generateTime: '2026-06-04 09:00', platform: '微博', keyword: '谦寻', status: '已生成' },
  { id: 2, taskTime: '2026-05-31 11:00', generateTime: '2026-06-04 09:30', platform: '抖音', keyword: '交个朋友', status: '已生成' },
  { id: 3, taskTime: '2026-05-31 14:00', generateTime: '2026-06-04 10:00', platform: '小红书', keyword: 'Babycare', status: '已同步' },
  { id: 4, taskTime: '2026-06-01 09:00', generateTime: '2026-06-04 10:30', platform: '微博', keyword: '谦寻', status: '已同步' },
  { id: 5, taskTime: '2026-06-01 10:00', generateTime: '2026-06-04 11:00', platform: '抖音', keyword: '交个朋友', status: '已生成' },
]

const platforms = ['微博', '微信', '抖音', '知乎', '小红书', 'B站']
const statuses = ['已生成', '已同步']

function ReportManagement() {
  const [data, setData] = useState(mockData)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [searchPlatform, setSearchPlatform] = useState('')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchStatus, setSearchStatus] = useState('')
  const [filterPlatform, setFilterPlatform] = useState('')
  const [filterKeyword, setFilterKeyword] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchPlatform = filterPlatform ? item.platform === filterPlatform : true
      const matchKeyword = filterKeyword ? item.keyword.includes(filterKeyword) : true
      const matchStatus = filterStatus ? item.status === filterStatus : true
      return matchPlatform && matchKeyword && matchStatus
    })
  }, [data, filterPlatform, filterKeyword, filterStatus])

  const columns = [
    { 
      title: '选择', 
      key: 'select',
      width: 60,
      render: (_, record) => (
        <Checkbox 
          checked={selectedRowKeys.includes(record.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedRowKeys([...selectedRowKeys, record.id])
            } else {
              setSelectedRowKeys(selectedRowKeys.filter(id => id !== record.id))
            }
          }}
        />
      )
    },
    { title: '任务时间', dataIndex: 'taskTime', key: 'taskTime', width: 160, sorter: (a, b) => a.taskTime.localeCompare(b.taskTime) },
    { title: '生成时间', dataIndex: 'generateTime', key: 'generateTime', width: 160, sorter: (a, b) => a.generateTime.localeCompare(b.generateTime) },
    { title: '平台', dataIndex: 'platform', key: 'platform', width: 100 },
    { title: '关键词', dataIndex: 'keyword', key: 'keyword', width: 120 },
    { 
      title: '状态', 
      dataIndex: 'status', 
      key: 'status', 
      width: 100,
      render: (status) => {
        const statusColors = {
          '已生成': 'warning',
          '已同步': 'success'
        }
        return (
          <span className={`ant-tag ant-tag-${statusColors[status]}`}>
            {status}
          </span>
        )
      }
    }
  ]

  const handleRefresh = () => {
    message.success('数据已同步')
  }

  const handleExport = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择报告')
      return
    }
    const exportData = data
      .filter(item => selectedRowKeys.includes(item.id))
      .map(item => ({ ...item, key: item.id }))
    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, '报告列表')
    XLSX.writeFile(workbook, `报告列表_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.xlsx`)
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
    setFilterPlatform(searchPlatform)
    setFilterKeyword(searchKeyword)
    setFilterStatus(searchStatus)
    setPage(1)
  }

  const handleReset = () => {
    setSearchPlatform('')
    setSearchKeyword('')
    setSearchStatus('')
    setFilterPlatform('')
    setFilterKeyword('')
    setFilterStatus('')
    setPage(1)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Checkbox 
            checked={selectedRowKeys.length === filteredData.length && filteredData.length > 0} 
            onChange={handleSelectAll}
          >
            全选
          </Checkbox>
          <span>已选择 {selectedRowKeys.length} 项</span>
          <Select
            placeholder="平台"
            value={searchPlatform}
            onChange={(value) => setSearchPlatform(value)}
            style={{ width: 120 }}
          >
            <Option value="">全部</Option>
            {platforms.map(p => <Option key={p} value={p}>{p}</Option>)}
          </Select>
          <Input
            placeholder="关键词"
            prefix={<SearchOutlined />}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            style={{ width: 150 }}
          />
          <Select
            placeholder="状态"
            value={searchStatus}
            onChange={(value) => setSearchStatus(value)}
            style={{ width: 120 }}
          >
            <Option value="">全部</Option>
            {statuses.map(s => <Option key={s} value={s}>{s}</Option>)}
          </Select>
          <Button type="primary" onClick={handleSearch}>查询</Button>
          <Button onClick={handleReset}>重置查询</Button>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button icon={<SyncOutlined />} onClick={handleRefresh}>刷新同步</Button>
          <Button 
            icon={<DownloadOutlined />} 
            onClick={handleExport}
            disabled={selectedRowKeys.length === 0}
          >
            导出选中
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        pagination={{
          current: page,
          pageSize: pageSize,
          total: filteredData.length,
          onChange: (p) => setPage(p)
        }}
      />
    </div>
  )
}

export default ReportManagement
