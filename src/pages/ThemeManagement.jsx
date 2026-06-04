import { useState, useMemo } from 'react'
import { Table, Button, Form, Input, Select, Modal, Tag, Space, message, Popconfirm } from 'antd'
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'

const { Option } = Select

const mockLevelData = [
  { id: 1, level: '高', frequency: '3天', warningThreshold: '即时推送', enabled: true, createdAt: '2026-05-20 10:00:00', remark: '重要舆情实时监控' },
  { id: 2, level: '中', frequency: '7天', warningThreshold: '每日汇总推送', enabled: true, createdAt: '2026-05-20 10:30:00', remark: '常规舆情监控' },
  { id: 3, level: '低', frequency: '30天', warningThreshold: '不推送', enabled: true, createdAt: '2026-05-20 11:00:00', remark: '低优先级舆情监控' },
]

const frequencies = ['3天', '7天', '30天']
const thresholds = ['即时推送', '每小时汇总推送', '每日汇总推送', '每周汇总推送', '不推送']
const levels = ['高', '中', '低']

function ThemeManagement() {
  const [form] = Form.useForm()
  const [filterValues, setFilterValues] = useState({})
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [data, setData] = useState([
    { id: 1, name: '谦寻', level: '高', frequency: '每1小时', warningThreshold: '即时推送', period: '7天', enabled: true, createdAt: '2026-05-31 10:00:00', remark: '电商直播头部机构舆情监测' },
    { id: 2, name: '交个朋友', level: '中', frequency: '每天1次', warningThreshold: '每日汇总推送', period: '7天', enabled: true, createdAt: '2026-05-30 14:30:00', remark: '数码产品直播监测' },
    { id: 3, name: 'Babycare', level: '高', frequency: '每1小时', warningThreshold: '即时推送', period: '30天', enabled: true, createdAt: '2026-05-28 09:15:00', remark: '母婴产品品牌监测' }
  ])

  const [levelForm] = Form.useForm()
  const [isLevelModalVisible, setIsLevelModalVisible] = useState(false)
  const [levelData, setLevelData] = useState(mockLevelData)
  const [editingLevel, setEditingLevel] = useState(null)

  const showLevelModal = () => {
    setIsLevelModalVisible(true)
  }

  const handleLevelModalCancel = () => {
    setIsLevelModalVisible(false)
  }

  const handleLevelEdit = (item) => {
    setEditingLevel(item)
    levelForm.setFieldsValue({
      level: item.level,
      frequency: item.frequency,
      warningThreshold: item.warningThreshold,
      enabled: item.enabled,
      remark: item.remark
    })
  }

  const handleLevelSave = () => {
    levelForm.validateFields().then(values => {
      if (editingLevel) {
        setLevelData(levelData.map(item => item.id === editingLevel.id ? { ...item, ...values } : item))
        message.success('修改成功')
      } else {
        const newItem = {
          ...values,
          id: Date.now(),
          createdAt: new Date().toLocaleString('zh-CN')
        }
        setLevelData([newItem, ...levelData])
        message.success('添加成功')
      }
      levelForm.resetFields()
      setEditingLevel(null)
    })
  }

  const handleLevelDelete = (id) => {
    setLevelData(levelData.filter(item => item.id !== id))
    message.success('删除成功')
  }

  const handleLevelAdd = () => {
    setEditingLevel(null)
    levelForm.resetFields()
  }

  const levelColumns = [
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
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 160 },
    { title: '备注', dataIndex: 'remark', key: 'remark', ellipsis: true, width: 200 },
    {
      title: '操作',
      key: 'action',
      width: 140,
      render: (_, record) => (
        <Space>
          <Button type="text" onClick={() => handleLevelEdit(record)}>编辑</Button>
          {!record.enabled && (
            <Popconfirm
              title="确定删除该等级？"
              onConfirm={() => handleLevelDelete(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="text" danger>删除</Button>
            </Popconfirm>
          )}
        </Space>
      )
    }
  ]

  const levels = [
    { value: '高', frequency: '每1小时', warningThreshold: '即时推送' },
    { value: '中', frequency: '每天1次', warningThreshold: '每日汇总推送' },
    { value: '低', frequency: '每3天', warningThreshold: '不推送' }
  ]

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
        name: item.name,
        level: item.level,
        frequency: item.frequency,
        warningThreshold: item.warningThreshold,
        period: item.period,
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

  const handleLevelChange = (level) => {
    const levelInfo = levels.find(l => l.value === level)
    if (levelInfo) {
      form.setFieldsValue({
        frequency: levelInfo.frequency,
        warningThreshold: levelInfo.warningThreshold
      })
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
    { title: '主体名称', dataIndex: 'name', key: 'name', width: 150 },
    { 
      title: '监测等级', 
      dataIndex: 'level', 
      key: 'level', 
      width: 100,
      render: (text) => (
        <Tag color={text === '高' ? 'red' : text === '中' ? 'orange' : 'gray'}>
          {text}
        </Tag>
      )
    },
    { title: '执行频次', dataIndex: 'frequency', key: 'frequency', width: 120 },
    { title: '预警阈值', dataIndex: 'warningThreshold', key: 'warningThreshold', width: 120 },
    { title: '监测周期', dataIndex: 'period', key: 'period', width: 100 },
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
      width: 120,
      render: (_, record) => (
        <Space>
          <Button type="text" onClick={() => showModal(record)}>编辑</Button>
          <Button type="text" danger onClick={() => handleDelete(record.id)}>删除</Button>
        </Space>
      )
    }
  ]

  return (
    <div>
      <Form form={form} layout="inline" style={{ marginBottom: 20 }}>
        <Form.Item name="name" label="主体名称">
          <Input placeholder="请输入主体名称" style={{ width: 200 }} />
        </Form.Item>
        <Form.Item name="level" label="监测等级">
          <Select placeholder="请选择等级" style={{ width: 120 }}>
            <Option value="高">高</Option>
            <Option value="中">中</Option>
            <Option value="低">低</Option>
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

      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button type="primary" onClick={() => showModal()}>新增主体</Button>
        <Button type="default" onClick={showLevelModal}>监测等级管理</Button>
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
        title={editingItem ? '编辑主体' : '新增主体'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="主体名称" rules={[{ required: true, message: '请输入主体名称' }]}>
            <Input placeholder="请输入主体名称" />
          </Form.Item>
          <Form.Item name="level" label="监测等级" rules={[{ required: true, message: '请选择监测等级' }]}>
            <Select placeholder="请选择监测等级" onChange={handleLevelChange}>
              <Option value="高">高</Option>
              <Option value="中">中</Option>
              <Option value="低">低</Option>
            </Select>
          </Form.Item>
          <Form.Item name="frequency" label="执行频次">
            <Input disabled style={{ background: '#f5f5f5' }} />
          </Form.Item>
          <Form.Item name="warningThreshold" label="预警阈值">
            <Input disabled style={{ background: '#f5f5f5' }} />
          </Form.Item>
          <Form.Item name="period" label="监测周期">
            <Select placeholder="请选择监测周期">
              <Option value="1天">1天</Option>
              <Option value="7天">7天</Option>
              <Option value="30天">30天</Option>
              <Option value="90天">90天</Option>
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

      <Modal
        title="监测等级管理"
        visible={isLevelModalVisible}
        onCancel={handleLevelModalCancel}
        footer={null}
        width={1100}
      >
        <div style={{ marginBottom: 16 }}>
          <Button type="primary" onClick={handleLevelAdd}>新增等级</Button>
        </div>
        <Table
          dataSource={levelData}
          columns={levelColumns}
          rowKey="id"
          pagination={{ pageSize: 20 }}
        />
        {editingLevel && (
          <Modal
            title={editingLevel.id ? '编辑等级' : '新增等级'}
            visible={!!editingLevel}
            onOk={handleLevelSave}
            onCancel={() => setEditingLevel(null)}
            width={500}
          >
            <Form form={levelForm} layout="vertical">
              <Form.Item name="level" label="等级" rules={[{ required: true, message: '请选择等级' }]}>
                <Select placeholder="请选择等级">
                  {levels.map(level => (
                    <Option key={level} value={level}>{level}</Option>
                  ))}
                </Select>
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
              <Form.Item name="enabled" label="状态" valuePropName="checked">
                <Select placeholder="请选择状态">
                  <Option value={true}>启用</Option>
                  <Option value={false}>禁用</Option>
                </Select>
              </Form.Item>
              <Form.Item name="remark" label="备注">
                <Input.TextArea placeholder="请输入备注信息" rows={3} />
              </Form.Item>
            </Form>
          </Modal>
        )}
      </Modal>
    </div>
  )
}

export default ThemeManagement
