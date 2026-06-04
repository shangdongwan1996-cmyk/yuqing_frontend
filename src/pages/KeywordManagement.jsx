import { useState, useMemo } from 'react'
import { Table, Button, Modal, Form, Input, Select, Switch, Space, message, Popconfirm, Upload } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, UploadOutlined } from '@ant-design/icons'
import * as XLSX from 'xlsx'

const { Option } = Select

const themes = ['交个朋友', '谦寻', 'Babycare']
const platforms = ['微博', '抖音', '小红书', '百家号', '知乎']

const mockDynamicKeywords = [
  { id: 1, keyword: '直播带货 新玩法', source: '微博热点', theme: '谦寻', mentions: 15680, createdAt: '2026-06-03 10:00:00' },
  { id: 2, keyword: '电商直播 新规', source: '行业新闻', theme: '交个朋友', mentions: 8920, createdAt: '2026-06-03 09:30:00' },
  { id: 3, keyword: '618 大促', source: '平台活动', theme: '谦寻', mentions: 54320, createdAt: '2026-06-02 14:00:00' },
  { id: 4, keyword: '直播电商 监管', source: '政策公告', theme: 'Babycare', mentions: 3210, createdAt: '2026-06-03 11:00:00' },
  { id: 5, keyword: '短视频 带货', source: '抖音热榜', theme: '交个朋友', mentions: 21560, createdAt: '2026-06-03 08:00:00' },
]
const matchModes = [
  { value: 'exact', label: '精确匹配', desc: '完全匹配关键词' },
  { value: 'phrase', label: '短语匹配', desc: '包含完整短语' },
  { value: 'broad', label: '广泛匹配', desc: '包含任意词' },
]
const sentimentOptions = [
  { value: 'none', label: '不预设', desc: '监控所有情感' },
  { value: 'negative', label: '仅监控负面', desc: '只抓取负面内容' },
]

const mockData = [
  { id: 1, keyword: '流浪猫 浅浅', relatedKeywords: '流浪狗 翠花, 谦寻新总部', theme: '谦寻', platform: '百家号', matchMode: 'phrase', matchModeName: '短语匹配', sentiment: 'positive', sentimentName: '正面', enabled: true, createdAt: '2026-06-01 16:58:26', updatedAt: '2026-06-01 16:58:26', creator: '管理员' },
  { id: 2, keyword: '谦寻控股 新总部', relatedKeywords: '董海锋, 杭州滨江', theme: '谦寻', platform: '百家号', matchMode: 'exact', matchModeName: '精确匹配', sentiment: 'none', sentimentName: '不预设', enabled: true, createdAt: '2026-06-01 16:54:16', updatedAt: '2026-06-01 16:54:16', creator: '管理员' },
  { id: 3, keyword: '电商直播 运行规则', relatedKeywords: '供应链, 产业基础设施', theme: '谦寻', platform: '百家号', matchMode: 'broad', matchModeName: '广泛匹配', sentiment: 'none', sentimentName: '不预设', enabled: true, createdAt: '2026-05-31 15:28:19', updatedAt: '2026-05-31 15:28:19', creator: '管理员' },
  { id: 4, keyword: '交个朋友投诉', relatedKeywords: '罗永浩, 直播售后', theme: '交个朋友', platform: '微博', matchMode: 'phrase', matchModeName: '短语匹配', sentiment: 'negative', sentimentName: '仅监控负面', enabled: true, createdAt: '2026-05-31 10:00:00', updatedAt: '2026-05-31 10:00:00', creator: '管理员' },
  { id: 5, keyword: '交个朋友售后', relatedKeywords: '售后服务, 用户反馈', theme: '交个朋友', platform: '抖音', matchMode: 'broad', matchModeName: '广泛匹配', sentiment: 'none', sentimentName: '不预设', enabled: true, createdAt: '2026-05-31 10:15:00', updatedAt: '2026-05-31 10:15:00', creator: '管理员' },
  { id: 6, keyword: '罗永浩 数码产品', relatedKeywords: '直播带货, 销量', theme: '交个朋友', platform: '小红书', matchMode: 'phrase', matchModeName: '短语匹配', sentiment: 'positive', sentimentName: '正面', enabled: true, createdAt: '2026-06-02 10:30:00', updatedAt: '2026-06-02 10:30:00', creator: '管理员' },
  { id: 7, keyword: 'Babycare 质量问题', relatedKeywords: '安全隐患, 消费者投诉', theme: 'Babycare', platform: '知乎', matchMode: 'phrase', matchModeName: '短语匹配', sentiment: 'negative', sentimentName: '仅监控负面', enabled: true, createdAt: '2026-06-01 09:15:00', updatedAt: '2026-06-01 09:15:00', creator: '管理员' },
  { id: 8, keyword: 'Babycare 新品发布', relatedKeywords: '天然环保, 婴儿用品', theme: 'Babycare', platform: '微博', matchMode: 'broad', matchModeName: '广泛匹配', sentiment: 'positive', sentimentName: '正面', enabled: true, createdAt: '2026-06-03 11:00:00', updatedAt: '2026-06-03 11:00:00', creator: '管理员' },
]

function KeywordManagement() {
  const [data, setData] = useState(mockData)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [form] = Form.useForm()
  const [filterValues, setFilterValues] = useState({})
  const [modalVisible, setModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState(null)

  const [isDynamicModalVisible, setIsDynamicModalVisible] = useState(false)
  const [dynamicData, setDynamicData] = useState(mockDynamicKeywords)

  const showDynamicModal = () => {
    setIsDynamicModalVisible(true)
  }

  const handleDynamicModalCancel = () => {
    setIsDynamicModalVisible(false)
  }

  const [dynamicFilterForm] = Form.useForm()
  const [dynamicFilterValues, setDynamicFilterValues] = useState({})

  const handleDynamicSearch = () => {
    dynamicFilterForm.validateFields().then(values => {
      setDynamicFilterValues(values)
    })
  }

  const handleDynamicReset = () => {
    dynamicFilterForm.resetFields()
    setDynamicFilterValues({})
  }

  const handleDynamicRefresh = () => {
    message.success('数据已刷新')
  }

  const filteredDynamicData = useMemo(() => {
    return dynamicData.filter(item => {
      if (dynamicFilterValues.keyword && !item.keyword.includes(dynamicFilterValues.keyword)) return false
      if (dynamicFilterValues.source && !item.source.includes(dynamicFilterValues.source)) return false
      if (dynamicFilterValues.theme && item.theme !== dynamicFilterValues.theme) return false
      return true
    })
  }, [dynamicData, dynamicFilterValues])

  const dynamicColumns = [
    { title: '关键词', dataIndex: 'keyword', key: 'keyword', width: 200, ellipsis: true },
    { title: '来源', dataIndex: 'source', key: 'source', width: 120 },
    { title: '关联主体', dataIndex: 'theme', key: 'theme', width: 120 },
    { title: '提及量', dataIndex: 'mentions', key: 'mentions', width: 100 },
    { title: '生成时间', dataIndex: 'createdAt', key: 'createdAt', width: 160 },
  ]

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
      if (filterValues.platform && item.platform !== filterValues.platform) return false
      if (filterValues.theme && item.theme !== filterValues.theme) return false
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
    form.setFieldsValue({
      keyword: record.keyword,
      theme: record.theme,
      platform: record.platform,
      matchMode: record.matchMode,
      sentiment: record.sentiment,
      enabled: record.enabled,
    })
    setModalVisible(true)
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

  const handleSubmit = () => {
    form.validateFields().then(values => {
      const matchModeName = matchModes.find(m => m.value === values.matchMode)?.label || values.matchMode
      const sentimentName = sentimentOptions.find(s => s.value === values.sentiment)?.label || values.sentiment
      
      if (editingItem) {
        setData(data.map(item => 
          item.id === editingItem.id ? { ...item, ...values, matchModeName, sentimentName, updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19) } : item
        ))
        message.success('修改成功')
      } else {
        const newItem = {
          id: Date.now(),
          ...values,
          matchModeName,
          sentimentName,
          createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
          updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
          creator: '管理员'
        }
        setData([newItem, ...data])
        message.success('添加成功')
      }
      setModalVisible(false)
      form.resetFields()
    }).catch(err => {
      message.error('表单验证失败')
    })
  }

  const handleExport = () => {
    const exportData = data.map(item => ({
      '关键词': item.keyword,
      '归属主题': item.theme,
      '平台': item.platform,
      '匹配模式': item.matchModeName,
      '情感倾向': item.sentimentName,
      '状态': item.enabled ? '启用' : '停用',
      '创建时间': item.createdAt,
      '最后修改时间': item.updatedAt,
      '创建人': item.creator
    }))
    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, '关键词')
    XLSX.writeFile(workbook, '关键词列表.xlsx')
  }

  const handleImport = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const data = e.target.result
      const workbook = XLSX.read(data, { type: 'binary' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)

      const newKeywords = jsonData.map(item => ({
        id: Date.now() + Math.random(),
        keyword: item['关键词'] || '',
        theme: item['归属主体'] || '',
        platform: item['平台'] || '',
        matchMode: 'phrase',
        matchModeName: '短语匹配',
        sentiment: 'none',
        sentimentName: '不预设',
        enabled: true,
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
        updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
        creator: '管理员'
      }))

      setData([...newKeywords, ...data])
      message.success(`成功导入 ${newKeywords.length} 条关键词`)
    }
    reader.readAsBinaryString(file)
  }

  const columns = [
    { title: '关键词', dataIndex: 'keyword', key: 'keyword', width: 180 },
    {
      title: '归属主题',
      dataIndex: 'theme',
      key: 'theme',
      width: 120,
      render: (theme) => (
        <span style={{ color: '#1890ff', fontWeight: 'bold' }}>{theme}</span>
      )
    },
    { title: '平台', dataIndex: 'platform', key: 'platform', width: 100 },
    { 
      title: '匹配模式', 
      dataIndex: 'matchModeName', 
      key: 'matchModeName', 
      width: 120,
      render: (mode) => (
        <span style={{ color: mode === '精确匹配' ? '#52c41a' : mode === '短语匹配' ? '#1890ff' : '#faad14' }}>
          {mode}
        </span>
      )
    },
    { 
      title: '情感倾向预设', 
      dataIndex: 'sentimentName', 
      key: 'sentimentName', 
      width: 120,
      render: (sentiment) => (
        <span style={{ color: sentiment === '仅监控负面' ? '#ff4d4f' : sentiment === '正面' ? '#52c41a' : '#666' }}>
          {sentiment}
        </span>
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
      width: 180,
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    },
    { 
      title: '最后修改时间', 
      dataIndex: 'updatedAt', 
      key: 'updatedAt', 
      width: 180,
      sorter: (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt)
    },
    { title: '创建人', dataIndex: 'creator', key: 'creator', width: 100 },
    { 
      title: '操作', 
      key: 'actions',
      width: 160,
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            onClick={() => handleEdit(record)}
          >
            修改
          </Button>
          <Popconfirm
            title="确定删除该关键词？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              type="link" 
              danger 
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    },
  ]

  return (
    <div>
      <Form form={form} layout="inline" style={{ marginBottom: 20, alignItems: 'center' }}>
        <Form.Item name="keyword" label="关键词">
          <Input placeholder="请输入关键词" style={{ width: 200 }} />
        </Form.Item>
        <Form.Item name="platform" label="平台">
          <Select placeholder="请选择平台" style={{ width: 120 }}>
            <Option value="">全部</Option>
            {platforms.map(platform => (
              <Option key={platform} value={platform}>{platform}</Option>
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
          <Button 
            type="default" 
            icon={<UploadOutlined />} 
            onClick={() => document.getElementById('keyword-import-input')?.click()}
          >导入</Button>
          <input 
            id="keyword-import-input"
            type="file" 
            accept=".xlsx,.xls" 
            style={{ display: 'none' }} 
            onChange={(e) => { 
              if (e.target.files?.[0]) {
                handleImport(e.target.files[0])
                e.target.value = ''
              }
            }} 
          />
          <Button onClick={handleExport} icon={<UploadOutlined />}>导出</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>添加关键词</Button>
        </Space>
        <Button type="default" onClick={showDynamicModal}>动态关键词库</Button>
      </div>

      <Table
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
        scroll={{ x: 1400 }}
      />

      <Modal
        title={editingItem ? '修改关键词' : '添加关键词'}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="keyword"
            label="关键词"
            rules={[{ required: true, message: '请输入关键词' }]}
          >
            <Input placeholder="请输入关键词" />
          </Form.Item>
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
              {platforms.map(platform => (
                <Option key={platform} value={platform}>{platform}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="matchMode"
            label="匹配模式"
            rules={[{ required: true, message: '请选择匹配模式' }]}
          >
            <Select placeholder="请选择匹配模式">
              {matchModes.map(mode => (
                <Option key={mode.value} value={mode.value}>
                  {mode.label} - {mode.desc}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="sentiment"
            label="情感倾向预设"
            rules={[{ required: true, message: '请选择情感倾向预设' }]}
          >
            <Select placeholder="请选择情感倾向预设">
              {sentimentOptions.map(opt => (
                <Option key={opt.value} value={opt.value}>
                  {opt.label} - {opt.desc}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="enabled"
            label="状态"
            valuePropName="checked"
          >
            <Switch defaultChecked checkedChildren="启用" unCheckedChildren="停用" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="动态关键词库"
        visible={isDynamicModalVisible}
        onCancel={handleDynamicModalCancel}
        footer={null}
        width={900}
      >
        <Form form={dynamicFilterForm} layout="inline" style={{ marginBottom: 16 }}>
          <Form.Item name="keyword" label="关键词">
            <Input placeholder="请输入关键词" style={{ width: 200 }} />
          </Form.Item>
          <Form.Item name="source" label="来源">
            <Input placeholder="请输入来源" style={{ width: 120 }} />
          </Form.Item>
          <Form.Item name="theme" label="关联主体">
            <Select placeholder="请选择主体" style={{ width: 120 }}>
              {themes.map(theme => (
                <Option key={theme} value={theme}>{theme}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" onClick={handleDynamicSearch} icon={<SearchOutlined />}>查询</Button>
              <Button onClick={handleDynamicReset}>重置</Button>
            </Space>
          </Form.Item>
        </Form>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Button onClick={handleDynamicRefresh} icon={<SearchOutlined />}>刷新</Button>
            <Button onClick={() => {}} icon={<UploadOutlined />}>导出</Button>
          </Space>
        </div>
        <Table
          dataSource={filteredDynamicData}
          columns={dynamicColumns}
          rowKey="id"
          pagination={{ pageSize: 20 }}
        />
      </Modal>
    </div>
  )
}

export default KeywordManagement
