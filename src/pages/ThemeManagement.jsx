import { useState, useMemo } from 'react'
import { Table, Button, Form, Input, Select, Modal, Tag, Space, message, Popconfirm, Switch } from 'antd'
import { SearchOutlined, PlusOutlined } from '@ant-design/icons'

const { Option } = Select

const levels = ['高', '中', '低']

function ThemeManagement() {
  const [form] = Form.useForm()
  const [filterValues, setFilterValues] = useState({})
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [data, setData] = useState([
    { id: 1, name: '谦寻', level: '高', enabled: true, inUse: true, createdAt: '2026-05-31 10:00:00' },
    { id: 2, name: '交个朋友', level: '中', enabled: true, inUse: false, createdAt: '2026-05-30 14:30:00' },
    { id: 3, name: 'Babycare', level: '高', enabled: true, inUse: false, createdAt: '2026-05-28 09:15:00' }
  ])

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
      form.setFieldsValue({ name: item.name, level: item.level, enabled: item.enabled })
    } else {
      form.resetFields()
    }
    setIsModalVisible(true)
  }

  const handleOk = () => {
    form.validateFields().then(values => {
      const duplicate = data.find(item => item.name === values.name && item.id !== editingItem?.id)
      if (duplicate) {
        message.warning(`主体"${values.name}"已存在，不可重复创建`)
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
        message.warning('当前有监测任务正在使用该主体，无法停用')
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
      if (filterValues.name && !item.name.includes(filterValues.name)) return false
      if (filterValues.level && item.level !== filterValues.level) return false
      if (filterValues.enabled !== undefined && item.enabled !== filterValues.enabled) return false
      return true
    })
  }, [data, filterValues])

  const columns = [
    { title: '主体', dataIndex: 'name', key: 'name', width: 150 },
    {
      title: '监测等级',
      dataIndex: 'level',
      key: 'level',
      width: 100,
      render: (text) => (
        <Tag color={text === '高' ? 'red' : text === '中' ? 'orange' : 'gray'}>{text}</Tag>
      )
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
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      sortOrder: 'descend'
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => showModal(record)} disabled={record.enabled}>编辑</Button>
          <Popconfirm title="确定删除该主体？" onConfirm={() => handleDelete(record.id)} okText="确定" cancelText="取消">
            <Button type="link" danger disabled={record.enabled}>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <Form form={form} layout="inline" style={{ marginBottom: 20 }}>
        <Form.Item name="name" label="主题">
          <Input placeholder="请输入主题名称" style={{ width: 200 }} />
        </Form.Item>
        <Form.Item name="level" label="监测等级">
          <Select placeholder="请选择等级" style={{ width: 120 }} allowClear>
            <Option value="高">高</Option>
            <Option value="中">中</Option>
            <Option value="低">低</Option>
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

      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>新增主题</Button>
      </div>

      <Table
        dataSource={filteredData}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 20, showTotal: (total) => `共 ${total} 条记录` }}
      />

      <Modal
        title={editingItem ? '编辑主题' : '新增主题'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={400}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="主题" rules={[{ required: true, message: '请输入主题名称' }]}>
            <Input placeholder="请输入主题名称" />
          </Form.Item>
          <Form.Item name="level" label="监测等级" rules={[{ required: true, message: '请选择监测等级' }]}>
            <Select placeholder="请选择监测等级">
              {levels.map(l => <Option key={l} value={l}>{l}</Option>)}
            </Select>
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

export default ThemeManagement
