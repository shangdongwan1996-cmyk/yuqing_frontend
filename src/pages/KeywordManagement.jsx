import { useState, useMemo } from 'react'
import { Table, Button, Modal, Form, Input, Select, Upload, message, Space, InputNumber } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, DownloadOutlined, UploadOutlined, SyncOutlined } from '@ant-design/icons'
import * as XLSX from 'xlsx'

const { Option } = Select

const mockData = [
  { id: 1, keyword: '谦寻', relatedKeywords: '谦寻 投诉', createdAt: '2026-05-31 10:00', updatedAt: '2026-06-01 14:30', creator: '管理员', platform: '微博' },
  { id: 2, keyword: '交个朋友', relatedKeywords: '交个朋友 投诉', createdAt: '2026-05-31 11:00', updatedAt: '2026-06-01 15:00', creator: '管理员', platform: '抖音' },
  { id: 3, keyword: 'Babycare', relatedKeywords: 'babycare 投诉', createdAt: '2026-05-31 14:00', updatedAt: '2026-06-01 16:00', creator: '管理员', platform: '小红书' },
]

function KeywordManagement() {
  const [data, setData] = useState(mockData)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchRelatedKeywords, setSearchRelatedKeywords] = useState('')
  const [searchPlatform, setSearchPlatform] = useState('')
  const [filterKeyword, setFilterKeyword] = useState('')
  const [filterRelatedKeywords, setFilterRelatedKeywords] = useState('')
  const [filterPlatform, setFilterPlatform] = useState('')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isRuleModalVisible, setIsRuleModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [form] = Form.useForm()
  const [ruleForm] = Form.useForm()

  const platforms = ['微博', '微信', '抖音', '知乎', '小红书', 'B站']

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchKeyword = filterKeyword ? item.keyword.includes(filterKeyword) : true
      const matchRelatedKeyword = filterRelatedKeywords ? item.relatedKeywords.includes(filterRelatedKeywords) : true
      const matchPlatform = filterPlatform ? item.platform === filterPlatform : true
      return matchKeyword && matchRelatedKeyword && matchPlatform
    })
  }, [data, filterKeyword, filterRelatedKeywords, filterPlatform])

  const columns = [
    { title: '关键词', dataIndex: 'keyword', key: 'keyword', width: 120 },
    { title: '关联关键词', dataIndex: 'relatedKeywords', key: 'relatedKeywords', width: 180 },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 140, sorter: (a, b) => a.createdAt.localeCompare(b.createdAt) },
    { title: '最后修改时间', dataIndex: 'updatedAt', key: 'updatedAt', width: 140, sorter: (a, b) => a.updatedAt.localeCompare(b.updatedAt) },
    { title: '创建人', dataIndex: 'creator', key: 'creator', width: 80 },
    { title: '平台', dataIndex: 'platform', key: 'platform', width: 80 },
    { 
      title: '操作', 
      key: 'action', 
      width: 160,
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button 
            type="link" 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record.id)}
            danger
          >
            删除
          </Button>
          <Button 
            type="link" 
            icon={<SearchOutlined />} 
            onClick={() => handleConfigureRules(record)}
          >
            配置规则
          </Button>
        </Space>
      )
    }
  ]

  const showModal = () => {
    setEditingItem(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  const handleEdit = (record) => {
    setEditingItem(record)
    form.setFieldsValue(record)
    setIsModalVisible(true)
  }

  const handleConfigureRules = (record) => {
    ruleForm.setFieldsValue({
      keyword: record.keyword,
      crawlInterval: 60,
      maxResults: 100,
      enable: true
    })
    setIsRuleModalVisible(true)
  }

  const handleDelete = (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个关键词吗？',
      onOk: () => {
        setData(data.filter(item => item.id !== id))
        message.success('删除成功')
      }
    })
  }

  const handleOk = () => {
    form.validateFields().then(values => {
      if (editingItem) {
        setData(data.map(item => 
          item.id === editingItem.id 
            ? { ...item, ...values, updatedAt: new Date().toLocaleString('zh-CN') }
            : item
        ))
        message.success('修改成功')
      } else {
        const newItem = {
          ...values,
          id: Date.now(),
          createdAt: new Date().toLocaleString('zh-CN'),
          updatedAt: new Date().toLocaleString('zh-CN'),
          creator: '管理员'
        }
        setData([...data, newItem])
        message.success('添加成功')
      }
      setIsModalVisible(false)
    }).catch(err => {
      console.error(err)
    })
  }

  const handleRuleOk = () => {
    ruleForm.validateFields().then(values => {
      message.success('爬取规则配置成功')
      setIsRuleModalVisible(false)
    }).catch(err => {
      console.error(err)
    })
  }

  const handleSearch = () => {
    setFilterKeyword(searchKeyword)
    setFilterRelatedKeywords(searchRelatedKeywords)
    setFilterPlatform(searchPlatform)
    setPage(1)
  }

  const handleReset = () => {
    setSearchKeyword('')
    setSearchRelatedKeywords('')
    setSearchPlatform('')
    setFilterKeyword('')
    setFilterRelatedKeywords('')
    setFilterPlatform('')
    setPage(1)
  }

  const handleExport = () => {
    const exportData = filteredData.map(item => ({
      ...item,
      key: item.id
    }))
    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, '关键词列表')
    XLSX.writeFile(workbook, `关键词列表_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.xlsx`)
    message.success('导出成功')
  }

  const handleImport = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result)
      const workbook = XLSX.read(data, { type: 'array' })
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)
      const newData = jsonData.map((item, index) => ({
        id: Date.now() + index,
        keyword: item.keyword || item.关键词 || '',
        relatedKeywords: item.relatedKeywords || item.关联关键词 || '',
        createdAt: new Date().toLocaleString('zh-CN'),
        updatedAt: new Date().toLocaleString('zh-CN'),
        creator: '管理员',
        platform: item.platform || item.平台 || '微博'
      })).filter(item => item.keyword)
      setData([...data, ...newData])
      message.success(`成功导入 ${newData.length} 条数据`)
    }
    reader.readAsArrayBuffer(file)
    return false
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Input
            placeholder="关键词"
            prefix={<SearchOutlined />}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            style={{ width: 180 }}
          />
          <Input
            placeholder="关联关键词"
            prefix={<SearchOutlined />}
            value={searchRelatedKeywords}
            onChange={(e) => setSearchRelatedKeywords(e.target.value)}
            style={{ width: 180 }}
          />
          <Select
            placeholder="平台"
            value={searchPlatform}
            onChange={(value) => setSearchPlatform(value)}
            style={{ width: 120 }}
          >
            <Option value="">全部</Option>
            {platforms.map(p => <Option key={p} value={p}>{p}</Option>)}
          </Select>
          <Button type="primary" onClick={handleSearch}>查询</Button>
          <Button onClick={handleReset}>重置查询</Button>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Button 
            icon={<UploadOutlined />} 
            onClick={() => document.getElementById('keyword-import').click()}
          >
            导入
          </Button>
          <input
            id="keyword-import"
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                handleImport(e.target.files[0])
                e.target.value = ''
              }
            }}
            style={{ display: 'none' }}
          />
          <Button icon={<DownloadOutlined />} onClick={handleExport}>导出</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>新增</Button>
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

      <Modal
        title={editingItem ? '编辑关键词' : '新增关键词'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="keyword" label="关键词" rules={[{ required: true }]}>
            <Input placeholder="请输入关键词" />
          </Form.Item>
          <Form.Item name="relatedKeywords" label="关联关键词">
            <Input placeholder="多个关键词用逗号分隔" />
          </Form.Item>
          <Form.Item name="platform" label="平台" rules={[{ required: true }]}>
            <Select placeholder="请选择平台">
              {platforms.map(p => <Option key={p} value={p}>{p}</Option>)}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="配置爬取规则"
        visible={isRuleModalVisible}
        onOk={handleRuleOk}
        onCancel={() => setIsRuleModalVisible(false)}
      >
        <Form form={ruleForm} layout="vertical">
          <Form.Item name="keyword" label="关键词" rules={[{ required: true }]}>
            <Input disabled />
          </Form.Item>
          <Form.Item name="crawlInterval" label="爬取间隔(分钟)" rules={[{ required: true }]}>
            <InputNumber min={1} max={1440} />
          </Form.Item>
          <Form.Item name="maxResults" label="单次最大结果数" rules={[{ required: true }]}>
            <InputNumber min={10} max={1000} />
          </Form.Item>
          <Form.Item name="enable" label="启用爬取">
            <Select>
              <Option value={true}>启用</Option>
              <Option value={false}>禁用</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default KeywordManagement
