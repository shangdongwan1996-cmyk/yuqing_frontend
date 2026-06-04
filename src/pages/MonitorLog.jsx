import { useState, useMemo } from 'react'
import { Table, Button, Form, Input, Select, DatePicker, Card, Tag, Space } from 'antd'
import { SearchOutlined, SyncOutlined, DownloadOutlined } from '@ant-design/icons'
import * as XLSX from 'xlsx'

const { Option } = Select
const { RangePicker } = DatePicker

function MonitorLog() {
  const [form] = Form.useForm()
  const [filterValues, setFilterValues] = useState({})
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [refreshKey, setRefreshKey] = useState(0)

  const mockData = [
    {
      id: 1,
      theme: '谦寻',
      keyword: '流浪猫 浅浅 流浪狗 翠花',
      resultType: 'PAGE',
      resultTypeName: '网页',
      sentiment: 'POSITIVE',
      sentimentName: '正面',
      entityRelevance: 'HIGH',
      entityRelevanceName: '高',
      entityRelevanceReason: '提及谦寻新总部及企业文化',
      authorityRelevance: 'MEDIUM',
      authorityRelevanceName: '中',
      authorityRelevanceReason: '提及企业负责人及员工',
      url: 'https://baijiahao.baidu.com/s?id=1866784451764945742&wfr=spider&for=pc',
      snippet: '流浪猫“浅浅”和流浪狗“翠花”有工位!在谦寻新总部,我们发现不少秘密...',
      summary: '流浪猫“浅浅”和流浪狗“翠花”有工位!在谦寻新总部,我们发现不少秘密 潮新闻客户端...',
      siteName: '百家号',
      siteIcon: 'https://baijiahao.baidu.com/favicon.ico',
      publishAt: '2026-06-01 16:58:26',
      createAt: '2026-06-03 16:40:25'
    },
    {
      id: 2,
      theme: '谦寻',
      keyword: '谦寻控股 新总部',
      resultType: 'PAGE',
      resultTypeName: '网页',
      sentiment: 'NEUTRAL',
      sentimentName: '中性',
      entityRelevance: 'LOW',
      entityRelevanceName: '低',
      entityRelevanceReason: '未提及具体投诉内容，仅描述企业新总部启用仪式',
      authorityRelevance: 'LOW',
      authorityRelevanceName: '低',
      authorityRelevanceReason: '未涉及滨江区市场监管局或具体监管行动',
      url: 'https://baijiahao.baidu.com/s?id=1866784264382895544&wfr=spider&for=pc',
      snippet: '5月31日,谦寻控股新总部大楼启用仪式在杭州滨江区隆重举行...',
      summary: '5月31日,谦寻控股新总部大楼启用仪式在杭州滨江区隆重举行...',
      siteName: '百家号',
      siteIcon: 'https://baijiahao.baidu.com/favicon.ico',
      publishAt: '2026-06-01 16:54:16',
      createAt: '2026-06-03 16:40:25'
    },
    {
      id: 3,
      theme: '谦寻',
      keyword: '电商直播 运行规则',
      resultType: 'PAGE',
      resultTypeName: '网页',
      sentiment: 'NEUTRAL',
      sentimentName: '中性',
      entityRelevance: 'LOW',
      entityRelevanceName: '低',
      entityRelevanceReason: '未提及具体投诉内容，仅分析企业新总部战略意义',
      authorityRelevance: 'LOW',
      authorityRelevanceName: '低',
      authorityRelevanceReason: '未涉及滨江区市场监管局或具体监管行动',
      url: 'https://baijiahao.baidu.com/s?id=1866688101728489320&wfr=spider&for=pc',
      snippet: '谦寻新总部背后,电商直播的运行规则变了...',
      summary: '谦寻新总部背后,电商直播的运行规则变了...',
      siteName: '百家号',
      siteIcon: 'https://baijiahao.baidu.com/favicon.ico',
      publishAt: '2026-05-31 15:28:19',
      createAt: '2026-06-03 16:40:25'
    },
    {
      id: 4,
      theme: '交个朋友',
      keyword: '罗永浩 直播 数码产品',
      resultType: 'PAGE',
      resultTypeName: '网页',
      sentiment: 'POSITIVE',
      sentimentName: '正面',
      entityRelevance: 'HIGH',
      entityRelevanceName: '高',
      entityRelevanceReason: '提及交个朋友直播间数码产品销售',
      authorityRelevance: 'MEDIUM',
      authorityRelevanceName: '中',
      authorityRelevanceReason: '涉及企业主要负责人',
      url: 'https://example.com/luoyonghao-digital',
      snippet: '交个朋友直播间数码产品销量创新高...',
      summary: '交个朋友直播间数码产品销量创新高，罗永浩亲自带货...',
      siteName: '新浪科技',
      siteIcon: 'https://sina.com/favicon.ico',
      publishAt: '2026-06-02 10:30:00',
      createAt: '2026-06-03 16:45:00'
    },
    {
      id: 5,
      theme: 'Babycare',
      keyword: 'Babycare 质量问题',
      resultType: 'PAGE',
      resultTypeName: '网页',
      sentiment: 'NEGATIVE',
      sentimentName: '负面',
      entityRelevance: 'HIGH',
      entityRelevanceName: '高',
      entityRelevanceReason: '消费者投诉Babycare产品质量问题',
      authorityRelevance: 'HIGH',
      authorityRelevanceName: '高',
      authorityRelevanceReason: '涉及市场监管部门调查',
      url: 'https://example.com/babycare-quality',
      snippet: '消费者投诉Babycare产品存在安全隐患...',
      summary: '消费者投诉Babycare产品存在安全隐患，已引起监管部门关注...',
      siteName: '消费者报道',
      siteIcon: 'https://example.com/favicon.ico',
      publishAt: '2026-06-01 09:15:00',
      createAt: '2026-06-03 16:50:00'
    },
    {
      id: 6,
      theme: '交个朋友',
      keyword: '直播带货 售后服务',
      resultType: 'PAGE',
      resultTypeName: '网页',
      sentiment: 'NEGATIVE',
      sentimentName: '负面',
      entityRelevance: 'MEDIUM',
      entityRelevanceName: '中',
      entityRelevanceReason: '用户反馈售后服务问题',
      authorityRelevance: 'LOW',
      authorityRelevanceName: '低',
      authorityRelevanceReason: '未涉及监管部门',
      url: 'https://example.com/jiaogepengyou-service',
      snippet: '部分用户反映交个朋友直播间售后服务响应慢...',
      summary: '部分用户反映交个朋友直播间售后服务响应慢，等待时间过长...',
      siteName: '黑猫投诉',
      siteIcon: 'https://heimaotousu.com/favicon.ico',
      publishAt: '2026-06-02 14:20:00',
      createAt: '2026-06-03 16:55:00'
    },
    {
      id: 7,
      theme: 'Babycare',
      keyword: 'Babycare 新品发布',
      resultType: 'PAGE',
      resultTypeName: '网页',
      sentiment: 'POSITIVE',
      sentimentName: '正面',
      entityRelevance: 'MEDIUM',
      entityRelevanceName: '中',
      entityRelevanceReason: '报道新品发布信息',
      authorityRelevance: 'LOW',
      authorityRelevanceName: '低',
      authorityRelevanceReason: '未涉及监管部门',
      url: 'https://example.com/babycare-newproduct',
      snippet: 'Babycare发布全新系列婴儿用品...',
      summary: 'Babycare发布全新系列婴儿用品，主打天然环保理念...',
      siteName: '育儿网',
      siteIcon: 'https://yuer.com/favicon.ico',
      publishAt: '2026-06-03 11:00:00',
      createAt: '2026-06-03 17:00:00'
    },
    {
      id: 8,
      theme: '谦寻',
      keyword: '谦寻 供应链',
      resultType: 'PAGE',
      resultTypeName: '网页',
      sentiment: 'NEUTRAL',
      sentimentName: '中性',
      entityRelevance: 'MEDIUM',
      entityRelevanceName: '中',
      entityRelevanceReason: '分析谦寻供应链布局',
      authorityRelevance: 'LOW',
      authorityRelevanceName: '低',
      authorityRelevanceReason: '未涉及监管部门',
      url: 'https://example.com/qianxun-supply',
      snippet: '谦寻新总部打造一站式供应链体系...',
      summary: '谦寻新总部打造一站式供应链体系，整合上下游资源...',
      siteName: '亿邦动力',
      siteIcon: 'https://ebrun.com/favicon.ico',
      publishAt: '2026-06-02 16:30:00',
      createAt: '2026-06-03 17:05:00'
    }
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

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  const handleExport = () => {
    const exportData = filteredData.map(item => ({
      '归属主题': item.theme,
      '关键词': item.keyword,
      '结果类型': item.resultTypeName,
      '情感倾向': item.sentimentName,
      '实体相关性': item.entityRelevanceName,
      '权威相关性': item.authorityRelevanceName,
      '来源': item.siteName,
      '发布时间': item.publishAt,
      '创建时间': item.createAt,
      '链接': item.url
    }))
    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, '监测日志')
    XLSX.writeFile(workbook, '监测日志.xlsx')
  }

  const filteredData = useMemo(() => {
    return mockData.filter(item => {
      if (filterValues.theme && item.theme !== filterValues.theme) return false
      if (filterValues.keyword && !item.keyword.includes(filterValues.keyword)) return false
      if (filterValues.sentiment && item.sentiment !== filterValues.sentiment) return false
      if (filterValues.siteName && !item.siteName.includes(filterValues.siteName)) return false
      return true
    })
  }, [mockData, filterValues])

  const columns = [
    {
      title: '归属主题',
      dataIndex: 'theme',
      key: 'theme',
      width: 100
    },
    {
      title: '关键词',
      dataIndex: 'keyword',
      key: 'keyword',
      width: 150
    },
    {
      title: '结果类型',
      dataIndex: 'resultTypeName',
      key: 'resultTypeName',
      width: 80
    },
    {
      title: '情感倾向',
      dataIndex: 'sentimentName',
      key: 'sentimentName',
      width: 80,
      render: (text, record) => (
        <Tag color={record.sentiment === 'POSITIVE' ? 'green' : record.sentiment === 'NEGATIVE' ? 'red' : 'gray'}>
          {text}
        </Tag>
      )
    },
    {
      title: '实体相关性',
      dataIndex: 'entityRelevanceName',
      key: 'entityRelevanceName',
      width: 100,
      render: (text, record) => (
        <Tag color={record.entityRelevance === 'HIGH' ? 'red' : record.entityRelevance === 'MEDIUM' ? 'orange' : 'gray'}>
          {text}
        </Tag>
      )
    },
    {
      title: '权威相关性',
      dataIndex: 'authorityRelevanceName',
      key: 'authorityRelevanceName',
      width: 100,
      render: (text, record) => (
        <Tag color={record.authorityRelevance === 'HIGH' ? 'red' : record.authorityRelevance === 'MEDIUM' ? 'orange' : 'gray'}>
          {text}
        </Tag>
      )
    },
    {
      title: '来源',
      dataIndex: 'siteName',
      key: 'siteName',
      width: 100
    },
    {
      title: '发布时间',
      dataIndex: 'publishAt',
      key: 'publishAt',
      width: 150,
      sorter: (a, b) => new Date(a.publishAt) - new Date(b.publishAt),
      sortOrder: 'descend'
    },
    {
      title: '创建时间',
      dataIndex: 'createAt',
      key: 'createAt',
      width: 150,
      sorter: (a, b) => new Date(a.createAt) - new Date(b.createAt)
    },
    {
      title: '摘要',
      dataIndex: 'snippet',
      key: 'snippet',
      ellipsis: true,
      width: 250
    }
  ]

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys
  }

  return (
    <Card>
      <Form form={form} layout="inline" style={{ marginBottom: 20 }}>
        <Form.Item name="theme" label="归属主体">
          <Select placeholder="请选择主体" style={{ width: 150 }}>
            <Option value="谦寻">谦寻</Option>
            <Option value="交个朋友">交个朋友</Option>
            <Option value="Babycare">Babycare</Option>
          </Select>
        </Form.Item>
        <Form.Item name="keyword" label="关键词">
          <Input placeholder="请输入关键词" style={{ width: 200 }} />
        </Form.Item>
        <Form.Item name="sentiment" label="情感倾向">
          <Select placeholder="请选择情感倾向" style={{ width: 150 }}>
            <Option value="POSITIVE">正面</Option>
            <Option value="NEGATIVE">负面</Option>
            <Option value="NEUTRAL">中性</Option>
          </Select>
        </Form.Item>
        <Form.Item name="siteName" label="来源">
          <Input placeholder="请输入来源名称" style={{ width: 150 }} />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" onClick={handleSearch} icon={<SearchOutlined />}>
              查询
            </Button>
            <Button onClick={handleReset}>重置</Button>
          </Space>
        </Form.Item>
      </Form>

      <div style={{ display: 'flex', marginBottom: 16 }}>
        <Space>
          <Button onClick={handleRefresh} icon={<SyncOutlined />}>刷新</Button>
          <Button onClick={handleExport} icon={<DownloadOutlined />}>导出</Button>
        </Space>
      </div>

      <Table
        key={refreshKey}
        rowSelection={rowSelection}
        dataSource={filteredData}
        columns={columns}
        rowKey="id"
        pagination={{ 
          pageSize: 20,
          showTotal: (total) => `共 ${total} 条记录`
        }}
        scroll={{ x: 1200 }}
      />
    </Card>
  )
}

export default MonitorLog
