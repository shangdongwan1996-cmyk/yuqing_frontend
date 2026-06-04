import { useState, useMemo } from 'react'
import { Table, Button, Modal, Form, Input, Select, Space, message, Popconfirm, Switch } from 'antd'
import { SearchOutlined, PlusOutlined } from '@ant-design/icons'

const { Option } = Select

const mockData = [
  { id: 1, username: 'admin', phone: '13800138000', enabled: true, inUse: true, createdAt: '2026-05-20 09:00:00' },
  { id: 2, username: 'zhangsan', phone: '13912345678', enabled: true, inUse: false, createdAt: '2026-05-25 10:30:00' },
  { id: 3, username: 'lisi', phone: '13787654321', enabled: false, inUse: false, createdAt: '2026-05-28 14:00:00' },
  { id: 4, username: 'wangwu', phone: '13611112222', enabled: true, inUse: false, createdAt: '2026-06-01 11:00:00' },
]

function UserManagement() {
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
      form.setFieldsValue({ username: item.username, phone: item.phone, enabled: item.enabled })
    } else {
      form.resetFields()
    }
    setIsModalVisible(true)
  }

  const handleOk = () => {
    form.validateFields().then(values => {
      const dupUser = data.find(item => item.username === values.username && item.id !== editingItem?.id)
      if (dupUser) {
        message.warning(`用户名"${values.username}"已存在，不可重复创建`)
        return
      }
      const dupPhone = data.find(item => item.phone === values.phone && item.id !== editingItem?.id)
      if (dupPhone) {
        message.warning(`手机号"${values.phone}"已被使用，不可重复创建`)
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
      if (record.inUse) {
        message.warning('该用户当前为系统管理员，无法停用')
        return
      }
      setData(data.map(item => item.id === record.id ? { ...item, enabled: false } : item))
      message.success('已停用')
    } else {
      setData(data.map(item => item.id === record.id ? { ...item, enabled: true } : item))
      message.success('已启用')
    }
  }

  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (filterValues.username && !item.username.includes(filterValues.username)) return false
      if (filterValues.phone && !item.phone.includes(filterValues.phone)) return false
      if (filterValues.enabled !== undefined && item.enabled !== filterValues.enabled) return false
      return true
    })
  }, [data, filterValues])

  const columns = [
    { title: '用户名', dataIndex: 'username', key: 'username', width: 150 },
    { title: '手机号', dataIndex: 'phone', key: 'phone', width: 150 },
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
          <Popconfirm title="确定删除该用户？" onConfirm={() => handleDelete(record.id)} okText="确定" cancelText="取消">
            <Button type="link" danger disabled={record.enabled}>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <Form form={form} layout="inline" style={{ marginBottom: 20 }}>
        <Form.Item name="username" label="用户名">
          <Input placeholder="请输入用户名" style={{ width: 150 }} />
        </Form.Item>
        <Form.Item name="phone" label="手机号">
          <Input placeholder="请输入手机号" style={{ width: 150 }} />
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

      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>新增用户</Button>
      </div>

      <Table
        dataSource={filteredData}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 20, showTotal: (total) => `共 ${total} 条记录` }}
      />

      <Modal
        title={editingItem ? '编辑用户' : '新增用户'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={400}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item name="phone" label="手机号" rules={[{ required: true, message: '请输入手机号' }, { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }]}>
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item name="enabled" label="是否启用" valuePropName="checked">
            <Select>
              <Option value={true}>是</Option>
              <Option value={false}>否</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default UserManagement
