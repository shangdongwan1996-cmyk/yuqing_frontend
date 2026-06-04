import { useState, useMemo } from 'react'
import { Table, Button, Modal, Form, Input, Select, Tag, Space, message, Popconfirm, Switch } from 'antd'
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'

const { Option } = Select

const mockData = [
  { id: 1, username: 'admin', phone: '138****8888', email: 'admin@example.com', enabled: true, createdAt: '2026-05-20 09:00:00', role: '管理员' },
  { id: 2, username: 'zhangshan', phone: '139****6666', email: 'zhangshan@example.com', enabled: true, createdAt: '2026-05-25 10:30:00', role: '普通用户' },
  { id: 3, username: 'lisi', phone: '137****5555', email: 'lisi@example.com', enabled: false, createdAt: '2026-05-28 14:00:00', role: '普通用户' },
  { id: 4, username: 'wangwu', phone: '136****4444', email: 'wangwu@example.com', enabled: true, createdAt: '2026-06-01 11:00:00', role: '普通用户' },
]

const roles = ['管理员', '普通用户']

function UserManagement() {
  const [data, setData] = useState(mockData)
  const [form] = Form.useForm()
  const [filterValues, setFilterValues] = useState({})
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState(null)

  const handleSearch = () => {
    form.validateFields().then(values => {
      setFilterValues(values)
    })
  }

  const handleReset = () => {
    form.resetFields()
    setFilterValues({})
  }

  const showModal = (item = null) => {
    setEditingItem(item)
    if (item) {
      form.setFieldsValue({
        username: item.username,
        phone: item.phone.replace(/\*/g, ''),
        email: item.email,
        role: item.role,
        enabled: item.enabled
      })
    } else {
      form.resetFields()
    }
    setIsModalVisible(true)
  }

  const handleOk = () => {
    form.validateFields().then(values => {
      const maskedPhone = values.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
      if (editingItem) {
        setData(data.map(item => item.id === editingItem.id ? { ...item, ...values, phone: maskedPhone } : item))
        message.success('修改成功')
      } else {
        const newItem = {
          ...values,
          phone: maskedPhone,
          id: Date.now(),
          createdAt: new Date().toLocaleString('zh-CN')
        }
        setData([newItem, ...data])
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
    const newValue = !record.enabled
    setData(data.map(item => 
      item.id === record.id ? { ...item, enabled: newValue } : item
    ))
    message.success(newValue ? '启用成功' : '停用成功')
  }

  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (filterValues.username && !item.username.includes(filterValues.username)) return false
      if (filterValues.phone && !item.phone.includes(filterValues.phone)) return false
      if (filterValues.role && item.role !== filterValues.role) return false
      if (filterValues.enabled !== undefined && item.enabled !== filterValues.enabled) return false
      return true
    })
  }, [data, filterValues])

  const columns = [
    { title: '用户名', dataIndex: 'username', key: 'username', width: 120 },
    { title: '手机号', dataIndex: 'phone', key: 'phone', width: 130 },
    { title: '邮箱', dataIndex: 'email', key: 'email', width: 200 },
    { 
      title: '角色', 
      dataIndex: 'role', 
      key: 'role', 
      width: 100,
      render: (role) => (
        <Tag color={role === '管理员' ? 'red' : 'blue'}>{role}</Tag>
      )
    },
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
      width: 160,
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      sortOrder: 'descend'
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      render: (_, record) => (
        <Space>
          <Button type="text" onClick={() => showModal(record)}>编辑</Button>
          <Popconfirm
            title="确定删除该用户？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="text" danger>删除</Button>
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
        <Form.Item name="role" label="角色">
          <Select placeholder="请选择角色" style={{ width: 120 }}>
            <Option value="">全部</Option>
            {roles.map(role => (
              <Option key={role} value={role}>{role}</Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="enabled" label="状态">
          <Select placeholder="请选择状态" style={{ width: 100 }}>
            <Option value={true}>启用</Option>
            <Option value={false}>禁用</Option>
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
        pagination={{ 
          pageSize: 20,
          showTotal: (total) => `共 ${total} 条记录`
        }}
      />

      <Modal
        title={editingItem ? '编辑用户' : '新增用户'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item name="phone" label="手机号" rules={[{ required: true, message: '请输入手机号' }, { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }]}>
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item name="email" label="邮箱" rules={[{ type: 'email', message: '请输入正确的邮箱' }]}>
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item name="role" label="角色" rules={[{ required: true, message: '请选择角色' }]}>
            <Select placeholder="请选择角色">
              {roles.map(role => (
                <Option key={role} value={role}>{role}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="enabled" label="是否启用" valuePropName="checked">
            <Switch defaultChecked checkedChildren="启用" unCheckedChildren="停用" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default UserManagement
