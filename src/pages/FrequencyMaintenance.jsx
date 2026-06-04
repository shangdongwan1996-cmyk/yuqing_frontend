import { useState, useMemo } from 'react'
import { Table, Button, Modal, Form, Select, Space, message, Popconfirm, Switch } from 'antd'
import { SearchOutlined, PlusOutlined } from '@ant-design/icons'

const { Option } = Select

const frequencies = ['3天', '7天', '30天']

const mockData = [
  { id: 1, frequency: '3天', enabled: true, inUse: true, createdAt: '2026-05-20 10:00:00' },
  { id: 2, frequency: '7天', enabled: true, inUse: false, createdAt: '2026-05-20 10:30:00' },
  { id: 3, frequency: '30天', enabled: true, inUse: false, createdAt: '2026-05-20 11:00:00' },
]

function FrequencyMaintenance() {
  const [data, setData] = useState(mockData)
  const [form] = Form.useForm()
  const [filterValues, setFilterValues] = useState({})
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState(null)

  const handleSearch = () => {
    form.validateFields().then(values => setFilterValues(values))
  }

  const handleReset = () => {
    form.resetFields()
    setFilterValues({})
  }

  const showModal = (item = null) => {
    setEditingItem(item)
    if (item) {
      form.setFieldsValue({ frequency: item.frequency })
    } else {
      form.resetFields()
    }
    setIsModalVisible(true)
  }

  const handleOk = () => {
    form.validateFields().then(values => {
      if (editingItem) {
        setData(data.map(item => item.id === editingItem.id ? { ...item, ...values } : item))
        message.success('修改成功')
      } else {
        setData([{ ...values, id: Date.now(), enabled: true, inUse: false, createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19) }, ...data])
        message.success('添加成功')
      }
      setIsModalVisible(false)
      setEditingItem(null)
    })
  }

  const handleCancel = () => {
    setIsModalVisible(false)
    setEditingItem(null)
  }

  const handleDelete = (id) => {
    setData(data.filter(item => item.id !== id))
    message.success('删除成功')
  }

  const handleToggle = (record) => {
    if (record.enabled) {
      // 正在尝试停用
      if (record.inUse) {
        message.warning('当前有主体正在使用该执行频次配置，无法停用')
        return
      }
      setData(data.map(item =>
        item.id === record.id ? { ...item, enabled: false } : item
      ))
      message.success('已停用')
    } else {
      setData(data.map(item =>
        item.id === record.id ? { ...item, enabled: true } : item
      ))
      message.success('已启用')
    }
  }

  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (filterValues.frequency && item.frequency !== filterValues.frequency) return false
      if (filterValues.enabled !== undefined && item.enabled !== filterValues.enabled) return false
      return true
    })
  }, [data, filterValues])

  const columns = [
    { title: '任务执行频次', dataIndex: 'frequency', key: 'frequency', width: 150 },
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 100,
      render: (enabled, record) => (
        <Switch
          checked={enabled}
          onChange={() => handleToggle(record)}
          checkedChildren="启用"
          unCheckedChildren="停用"
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
      key: 'action',
      width: 160,
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => showModal(record)} disabled={record.enabled}>编辑</Button>
          <Popconfirm title="确定删除该配置？" onConfirm={() => handleDelete(record.id)} okText="确定" cancelText="取消">
            <Button type="link" danger disabled={record.enabled}>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <Form form={form} layout="inline" style={{ marginBottom: 20 }}>
        <Form.Item name="frequency" label="执行频次">
          <Select placeholder="请选择频次" style={{ width: 120 }} allowClear>
            {frequencies.map(f => <Option key={f} value={f}>{f}</Option>)}
          </Select>
        </Form.Item>
        <Form.Item name="enabled" label="状态">
          <Select placeholder="请选择" style={{ width: 100 }} allowClear>
            <Option value={true}>启用</Option>
            <Option value={false}>停用</Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" onClick={handleSearch} icon={<SearchOutlined />}>查询</Button>
            <Button onClick={handleReset}>重置</Button>
          </Space>
        </Form.Item>
      </Form>

      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>新增配置</Button>
      </div>

      <Table
        dataSource={filteredData}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 20, showTotal: (total) => `共 ${total} 条记录` }}
      />

      <Modal
        title={editingItem ? '编辑执行频次' : '新增执行频次'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={400}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="frequency" label="任务执行频次" rules={[{ required: true, message: '请选择执行频次' }]}>
            <Select placeholder="请选择执行频次">
              {frequencies.map(f => <Option key={f} value={f}>{f}</Option>)}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default FrequencyMaintenance
