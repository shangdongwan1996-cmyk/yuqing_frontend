import { useState, useMemo } from 'react'
import { Table, Button, Modal, Form, Input, Select, Switch, Space, message, Popconfirm, Upload } from 'antd'
import { PlusOutlined, SearchOutlined, UploadOutlined, DownloadOutlined } from '@ant-design/icons'
import * as XLSX from 'xlsx'

const { Option } = Select

const themes = ['交个朋友', '谦寻', 'Babycare']

const mockData = [
  { id: 1, keyword: '交个朋友投诉', theme: '交个朋友', enabled: true, inUse: true, createdAt: '2026-06-01 16:58:26' },
  { id: 2, keyword: '谦寻控股 新总部', theme: '谦寻', enabled: true, inUse: false, createdAt: '2026-06-01 16:54:16' },
  { id: 3, keyword: '电商直播 运行规则', theme: '谦寻', enabled: true, inUse: false, createdAt: '2026-05-31 15:28:19' },
  { id: 4, keyword: '交个朋友售后', theme: '交个朋友', enabled: true, inUse: false, createdAt: '2026-05-31 10:15:00' },
  { id: 5, keyword: '罗永浩 数码产品', theme: '交个朋友', enabled: true, inUse: false, createdAt: '2026-06-02 10:30:00' },
  { id: 6, keyword: 'Babycare 质量问题', theme: 'Babycare', enabled: true, inUse: false, createdAt: '2026-06-01 09:15:00' },
  { id: 7, keyword: 'Babycare 新品发布', theme: 'Babycare', enabled: true, inUse: false, createdAt: '2026-06-03 11:00:00' },
]

function KeywordManagement() {
  const [data, setData] = useState(mockData)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [form] = Form.useForm()
  const [filterValues, setFilterValues] = useState({})
  const [modalVisible, setModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState(null)

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

  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (filterValues.keyword && !item.keyword.includes(filterValues.keyword)) return false
      if (filterValues.theme && item.theme !== filterValues.theme) return false
      if (filterValues.enabled !== undefined && item.enabled !== filterValues.enabled) return false
      return true
    })
  }, [data, filterValues])

  const handleAdd = () => {
    setEditingItem(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record) => {
    setEditingItem(record)
    form.setFieldsValue({ keyword: record.keyword, theme: record.theme, enabled: record.enabled })
    setModalVisible(true)
  }

  const handleDelete = (id) => {
    setData(data.filter(item => item.id !== id))
    message.success('删除成功')
  }

  const handleToggle = (record) => {
    if (record.enabled) {
      if (record.inUse) {
        message.warning('当前有监测任务正在使用该关键词，无法停用')
        return
      }
      setData(data.map(item => item.id === record.id ? { ...item, enabled: false } : item))
      message.success('已停用')
    } else {
      setData(data.map(item => item.id === record.id ? { ...item, enabled: true } : item))
      message.success('已启用')
    }
  }

  const handleSubmit = () => {
    form.validateFields().then(values => {
      if (editingItem) {
        setData(data.map(item =>
          item.id === editingItem.id ? { ...item, ...values } : item
        ))
        message.success('修改成功')
      } else {
        setData([{
          id: Date.now(),
          ...values,
          enabled: true,
          inUse: false,
          createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
        }, ...data])
        message.success('添加成功')
      }
      setModalVisible(false)
      form.resetFields()
    }).catch(() => message.error('表单验证失败'))
  }

  const handleExport = () => {
    const exportData = data.map(item => ({
      '关键词': item.keyword,
      '归属主体': item.theme,
      '是否启用': item.enabled ? '是' : '否',
      '创建时间': item.createdAt
    }))
    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, '关键词')
    XLSX.writeFile(workbook, '关键词列表.xlsx')
  }

  const handleImport = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const workbook = XLSX.read(e.target.result, { type: 'binary' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)
      const newKeywords = jsonData.map(item => ({
        id: Date.now() + Math.random(),
        keyword: item['关键词'] || '',
        theme: item['归属主体'] || '',
        enabled: true,
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
      }))
      setData([...newKeywords, ...data])
      message.success(`成功导入 ${newKeywords.length} 条关键词`)
    }
    reader.readAsBinaryString(file)
  }

  const columns = [
    { title: '关键词', dataIndex: 'keyword', key: 'keyword', width: 200 },
    {
      title: '归属主体',
      dataIndex: 'theme',
      key: 'theme',
      width: 150,
      render: (theme) => <span style={{ color: '#1890ff', fontWeight: 'bold' }}>{theme}</span>
    },
    {
      title: '是否启用',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 100,
      render: (enabled, record) => (
        <Switch
          checked={enabled}
          onChange={() => handleToggle(record)}
          checkedChildren="是"
          unCheckedChildren="否"
        />
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    },
    {
      title: '操作',
      key: 'actions',
      width: 160,
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleEdit(record)} disabled={record.enabled}>修改</Button>
          <Popconfirm title="确定删除该关键词？" onConfirm={() => handleDelete(record.id)} okText="确定" cancelText="取消">
            <Button type="link" danger disabled={record.enabled}>删除</Button>
          </Popconfirm>
        </Space>
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
          <Select placeholder="请选择主体" style={{ width: 150 }} allowClear>
            <Option value="">全部</Option>
            {themes.map(t => <Option key={t} value={t}>{t}</Option>)}
          </Select>
        </Form.Item>
        <Form.Item name="enabled" label="是否启用">
          <Select placeholder="请选择" style={{ width: 100 }} allowClear>
            <Option value={true}>是</Option>
            <Option value={false}>否</Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" onClick={handleSearch} icon={<SearchOutlined />}>查询</Button>
            <Button onClick={handleReset}>重置</Button>
          </Space>
        </Form.Item>
      </Form>

      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <Button icon={<UploadOutlined />} onClick={() => document.getElementById('keyword-import-input')?.click()}>导入</Button>
        <input id="keyword-import-input" type="file" accept=".xlsx,.xls" style={{ display: 'none' }}
          onChange={(e) => { if (e.target.files?.[0]) { handleImport(e.target.files[0]); e.target.value = '' } }} />
        <Button onClick={handleExport} icon={<DownloadOutlined />}>导出</Button>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>添加关键词</Button>
      </div>

      <Table
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
      />

      <Modal
        title={editingItem ? '修改关键词' : '添加关键词'}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        width={450}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="keyword" label="关键词" rules={[{ required: true, message: '请输入关键词' }]}>
            <Input placeholder="请输入关键词" />
          </Form.Item>
          <Form.Item name="theme" label="归属主体" rules={[{ required: true, message: '请选择归属主体' }]}>
            <Select placeholder="请选择归属主体">
              {themes.map(t => <Option key={t} value={t}>{t}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="enabled" label="是否启用" valuePropName="checked">
            <Switch defaultChecked checkedChildren="是" unCheckedChildren="否" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default KeywordManagement
