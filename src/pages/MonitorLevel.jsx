import { useState, useMemo } from 'react'
import { Table, Button, Modal, Form, Select, Tag, Space, message, Popconfirm, Switch } from 'antd'
import { SearchOutlined, PlusOutlined } from '@ant-design/icons'

const { Option } = Select

const levels = ['高', '中', '低']
const frequencies = ['3天', '7天', '30天']

const mockData = [
  { id: 1, level: '高', frequency: '3天', enabled: true, inUse: true, createdAt: '2026-05-20 10:00:00' },
  { id: 2, level: '中', frequency: '7天', enabled: true, inUse: false, createdAt: '2026-05-20 10:30:00' },
  { id: 3, level: '低', frequency: '30天', enabled: true, inUse: false, createdAt: '2026-05-20 11:00:00' },
]

function MonitorLevel() {
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
      form.setFieldsValue({ level: item.level, frequency: item.frequency })
    } else {
      form.resetFields()
    }
    setIsModalVisible(true)
  }

  const handleOk = () => {
    form.validateFields().then(values => {
      const duplicate = data.find(item => item.level === values.level && item.id !== editingItem?.id)
      if (duplicate) {
        message.warning(`监测等级"${values.level}"已存在，不可重复创建`)
        return
      }
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
        message.warning('当前有主体正在使用该监测等级，无法停用')
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
      if (filterValues.level && item.level !== filterValues.level) return false
      if (filterValues.enabled !== undefined && item.enabled !== filterValues.enabled) return false
      return true
    })
  }, [data, filterValues])

  const columns = [
    {
      title: '等级',
      dataIndex: 'level',
      key: 'level',
      width: 100,
      render: (level) => (
        <Tag color={level === '高' ? 'red' : level === '中' ? 'orange' : 'gray'}>{level}</Tag>
      )
    },
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
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      sortOrder: 'descend'
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => showModal(record)} disabled={record.enabled}>编辑</Button>
          <Popconfirm title="确定删除该等级？" onConfirm={() => handleDelete(record.id)} okText="确定" cancelText="取消">
            <Button type="link" danger disabled={record.enabled}>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <Form form={form} layout="inline" style={{ marginBottom: 20 }}>
        <Form.Item name="level" label="等级">
          <Select placeholder="请选择等级" style={{ width: 120 }} allowClear>
            {levels.map(l => <Option key={l} value={l}>{l}</Option>)}
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
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>新增等级</Button>
      </div>

      <Table
        dataSource={filteredData}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 20, showTotal: (total) => `共 ${total} 条记录` }}
      />

      <Modal
        title={editingItem ? '编辑监测等级' : '新增监测等级'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={400}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="level" label="等级" rules={[{ required: true, message: '请选择等级' }]}>
            <Select placeholder="请选择等级">
              {levels.map(l => <Option key={l} value={l}>{l}</Option>)}
            </Select>
          </Form.Item>
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

export default MonitorLevel
