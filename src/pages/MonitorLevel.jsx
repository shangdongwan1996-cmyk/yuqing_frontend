import { useState, useMemo } from 'react'
import { Table, Button, Modal, Form, Input, Select, Tag, Space, message, Popconfirm } from 'antd'
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'

const { Option } = Select

const mockData = [
  { id: 1, level: '高', frequency: '每1小时', warningThreshold: '即时推送', enabled: true, createdAt: '2026-05-20 10:00:00', remark: '重要舆情实时监控' },
  { id: 2, level: '中', frequency: '每天1次', warningThreshold: '每日汇总推送', enabled: true, createdAt: '2026-05-20 10:30:00', remark: '常规舆情监控' },
  { id: 3, level: '低', frequency: '每3天', warningThreshold: '不推送', enabled: true, createdAt: '2026-05-20 11:00:00', remark: '低优先级舆情监控' },
]

const frequencies = ['每15分钟', '每30分钟', '每1小时', '每4小时', '每天1次', '每2天', '每3天', '每周1次']
const thresholds = ['即时推送', '每小时汇总推送', '每日汇总推送', '每周汇总推送', '不推送']

function MonitorLevel() {
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
        level: item.level,
        frequency: item.frequency,
        warningThreshold: item.warningThreshold,
        enabled: item.enabled,
        remark: item.remark
      })
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
        const newItem = {
          ...values,
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

  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (filterValues.level && !item.level.includes(filterValues.level)) return false
      if (filterValues.enabled !== undefined && item.enabled !== filterValues.enabled) return false
      return true
    })
  }, [data, filterValues])

  const columns = [
    { 
      title: '等级', 
      dataIndex: 'level', 
      key: 'level', 
      width: 80,
      render: (level) => (
        <Tag color={level === '高' ? 'red' : level === '中' ? 'orange' : 'gray'}>
          {level}
        </Tag>
      )
    },
    { title: '任务执行频次', dataIndex: 'frequency', key: 'frequency', width: 120 },
    { title: '预警阈值', dataIndex: 'warningThreshold', key: 'warningThreshold', width: 140 },
    { 
      title: '状态', 
      dataIndex: 'enabled', 
      key: 'enabled', 
      width: 80,
      render: (text) => (
        <Tag color={text ? 'green' : 'red'}>
          {text ? '启用' : '禁用'}
        </Tag>
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
    { title: '备注', dataIndex: 'remark', key: 'remark', ellipsis: true, width: 200 },
    {
      title: '操作',
      key: 'action',
      width: 140,
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => showModal(record)}>编辑</Button>
          <Popconfirm
            title="确定删除该等级？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="text" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <Form form={form} layout="inline" style={{ marginBottom: 20 }}>
        <Form.Item name="level" label="等级">
          <Input placeholder="请输入等级" style={{ width: 150 }} />
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
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>新增等级</Button>
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
        title={editingItem ? '编辑监测等级' : '新增监测等级'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="level" label="等级" rules={[{ required: true, message: '请输入等级名称' }]}>
            <Input placeholder="请输入等级名称（如：高、中、低）" />
          </Form.Item>
          <Form.Item name="frequency" label="任务执行频次" rules={[{ required: true, message: '请选择执行频次' }]}>
            <Select placeholder="请选择执行频次">
              {frequencies.map(freq => (
                <Option key={freq} value={freq}>{freq}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="warningThreshold" label="预警阈值" rules={[{ required: true, message: '请选择预警阈值' }]}>
            <Select placeholder="请选择预警阈值">
              {thresholds.map(threshold => (
                <Option key={threshold} value={threshold}>{threshold}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="enabled" label="是否启用" valuePropName="checked">
            <Select>
              <Option value={true}>启用</Option>
              <Option value={false}>禁用</Option>
            </Select>
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea placeholder="请输入备注信息" rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default MonitorLevel
