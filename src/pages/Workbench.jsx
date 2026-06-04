import { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Tag, Table, Progress, Select, Button } from 'antd'
import { BarChartOutlined, BellOutlined, FileTextOutlined, ClockCircleOutlined, ArrowUpOutlined, ArrowDownOutlined, SyncOutlined, MoreOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

const { Option } = Select

const mockStatistics = {
  lastMonitorTime: '2026-06-04 16:40:25',
  generatedTasks: { daily: 8, threeDays: 24, weekly: 56, monthly: 240 },
  executedTasks: { daily: 8, threeDays: 23, weekly: 54, monthly: 235 },
  generatedReports: { daily: 6, threeDays: 18, weekly: 42, monthly: 180 }
}

const mockRecentTasks = [
  { id: 1, theme: '谦寻', status: '已完成', time: '2026-06-04 16:40:25', count: 4 },
  { id: 2, theme: 'Babycare', status: '已完成', time: '2026-06-04 16:30:15', count: 2 },
  { id: 3, theme: '交个朋友', status: '进行中', time: '2026-06-04 16:20:30', count: 0 },
  { id: 4, theme: '谦寻', status: '已失败', time: '2026-06-04 15:00:00', count: 0 },
]

const mockHotKeywords = {
  daily: [
    { id: 1, keyword: '流浪猫 浅浅', count: 15, trend: 'up', platform: '百家号' },
    { id: 2, keyword: '谦寻控股新总部', count: 12, trend: 'up', platform: '百家号' },
    { id: 3, keyword: 'Babycare质量问题', count: 8, trend: 'down', platform: '知乎' },
    { id: 4, keyword: '交个朋友售后', count: 6, trend: 'up', platform: '抖音' },
  ],
  threeDays: [
    { id: 1, keyword: '流浪猫 浅浅', count: 45, trend: 'up', platform: '百家号' },
    { id: 2, keyword: '谦寻控股新总部', count: 36, trend: 'up', platform: '百家号' },
    { id: 3, keyword: 'Babycare质量问题', count: 24, trend: 'down', platform: '知乎' },
    { id: 4, keyword: '交个朋友售后', count: 18, trend: 'up', platform: '抖音' },
  ],
  weekly: [
    { id: 1, keyword: '流浪猫 浅浅', count: 105, trend: 'up', platform: '百家号' },
    { id: 2, keyword: '谦寻控股新总部', count: 84, trend: 'up', platform: '百家号' },
    { id: 3, keyword: 'Babycare质量问题', count: 56, trend: 'down', platform: '知乎' },
    { id: 4, keyword: '交个朋友售后', count: 42, trend: 'up', platform: '抖音' },
  ],
  monthly: [
    { id: 1, keyword: '流浪猫 浅浅', count: 450, trend: 'up', platform: '百家号' },
    { id: 2, keyword: '谦寻控股新总部', count: 360, trend: 'up', platform: '百家号' },
    { id: 3, keyword: 'Babycare质量问题', count: 240, trend: 'down', platform: '知乎' },
    { id: 4, keyword: '交个朋友售后', count: 180, trend: 'up', platform: '抖音' },
  ]
}

const mockSentimentData = {
  daily: { positive: 3, negative: 2, neutral: 3 },
  threeDays: { positive: 9, negative: 6, neutral: 9 },
  weekly: { positive: 21, negative: 14, neutral: 21 },
  monthly: { positive: 90, negative: 60, neutral: 90 }
}

function Workbench() {
  const [currentTime, setCurrentTime] = useState(dayjs().format('YYYY-MM-DD HH:mm:ss'))
  const [statsPeriod, setStatsPeriod] = useState('daily')
  const [sentimentPeriod, setSentimentPeriod] = useState('daily')
  const [keywordPeriod, setKeywordPeriod] = useState('daily')

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs().format('YYYY-MM-DD HH:mm:ss'))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const recentTasksColumns = [
    { title: '归属主体', dataIndex: 'theme', key: 'theme', width: 120, render: (theme) => <span style={{ color: '#1890ff', fontWeight: 'bold' }}>{theme}</span> },
    { 
      title: '状态', 
      dataIndex: 'status', 
      key: 'status', 
      width: 100,
      render: (status) => {
        const color = status === '已完成' ? 'green' : status === '进行中' ? 'orange' : 'red'
        return <Tag color={color}>{status}</Tag>
      }
    },
    { title: '执行时间', dataIndex: 'time', key: 'time', width: 180 },
    { title: '结果数', dataIndex: 'count', key: 'count', width: 100, render: (count) => <span style={{ color: count > 0 ? '#52c41a' : '#bfbfbf' }}>{count}</span> },
  ]

  const hotKeywordsColumns = [
    { title: '排名', dataIndex: 'rank', key: 'rank', width: 60, render: (_, __, index) => index + 1 },
    { title: '关键词', dataIndex: 'keyword', key: 'keyword', width: 180 },
    { title: '平台', dataIndex: 'platform', key: 'platform', width: 100 },
    { title: '提及量', dataIndex: 'count', key: 'count', width: 100 },
    { 
      title: '趋势', 
      dataIndex: 'trend', 
      key: 'trend', 
      width: 80,
      render: (trend) => (
        trend === 'up' 
          ? <span style={{ color: '#ff4d4f' }}><ArrowUpOutlined /> 上升</span>
          : <span style={{ color: '#52c41a' }}><ArrowDownOutlined /> 下降</span>
      )
    },
  ]

  const periodLabels = {
    daily: '每日',
    threeDays: '每3日',
    weekly: '每周',
    monthly: '每月'
  }

  const currentStats = {
    generatedTasks: mockStatistics.generatedTasks[statsPeriod],
    executedTasks: mockStatistics.executedTasks[statsPeriod],
    generatedReports: mockStatistics.generatedReports[statsPeriod]
  }

  const currentSentiment = mockSentimentData[sentimentPeriod]
  const totalSentiment = currentSentiment.positive + currentSentiment.negative + currentSentiment.neutral

  const handleMoreTasks = () => {
    window.location.href = '/yuqing_frontend/#/task'
  }

  return (
    <div style={{ backgroundColor: '#f5f5f5', minHeight: '100%', padding: 24, margin: -24 }}>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
              <div>
                <div style={{ color: '#8c8c8c', fontSize: 14, marginBottom: 8 }}>当前时间</div>
                <div style={{ fontSize: 20, fontWeight: 'bold', color: '#1890ff' }}>
                  {currentTime}
                </div>
              </div>
              <div style={{ width: 1, height: 40, backgroundColor: '#f0f0f0' }}></div>
              <div>
                <div style={{ color: '#8c8c8c', fontSize: 14, marginBottom: 8 }}>最近一次监测时间</div>
                <div style={{ fontSize: 20, fontWeight: 'bold', color: '#52c41a' }}>
                  {mockStatistics.lastMonitorTime}
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ color: '#8c8c8c', fontSize: 14 }}>已生成任务数</span>
              <Select 
                value={statsPeriod} 
                onChange={setStatsPeriod} 
                size="small" 
                style={{ width: 80 }}
              >
                <Option value="daily">每日</Option>
                <Option value="threeDays">每3日</Option>
                <Option value="weekly">每周</Option>
                <Option value="monthly">每月</Option>
              </Select>
            </div>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
              {currentStats.generatedTasks}
            </div>
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ color: '#8c8c8c', fontSize: 14 }}>已执行任务数</span>
              <Select 
                value={statsPeriod} 
                onChange={setStatsPeriod} 
                size="small" 
                style={{ width: 80 }}
              >
                <Option value="daily">每日</Option>
                <Option value="threeDays">每3日</Option>
                <Option value="weekly">每周</Option>
                <Option value="monthly">每月</Option>
              </Select>
            </div>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>
              {currentStats.executedTasks}
            </div>
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ color: '#8c8c8c', fontSize: 14 }}>已生成报告数</span>
              <Select 
                value={statsPeriod} 
                onChange={setStatsPeriod} 
                size="small" 
                style={{ width: 80 }}
              >
                <Option value="daily">每日</Option>
                <Option value="threeDays">每3日</Option>
                <Option value="weekly">每周</Option>
                <Option value="monthly">每月</Option>
              </Select>
            </div>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#722ed1' }}>
              {currentStats.generatedReports}
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card 
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>情感分布</span>
                <Select 
                  value={sentimentPeriod} 
                  onChange={setSentimentPeriod} 
                  size="small" 
                  style={{ width: 80 }}
                >
                  <Option value="daily">每日</Option>
                  <Option value="threeDays">每3日</Option>
                  <Option value="weekly">每周</Option>
                  <Option value="monthly">每月</Option>
                </Select>
              </div>
            } 
            style={{ height: 300 }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div style={{ marginBottom: 8 }}>
                  <span>正面</span>
                  <span style={{ marginLeft: 8, color: '#666' }}>{currentSentiment.positive} 条 ({((currentSentiment.positive / totalSentiment) * 100).toFixed(0)}%)</span>
                </div>
                <Progress percent={((currentSentiment.positive / totalSentiment) * 100).toFixed(0)} strokeColor="#52c41a" />
              </div>
              <div>
                <div style={{ marginBottom: 8 }}>
                  <span>负面</span>
                  <span style={{ marginLeft: 8, color: '#666' }}>{currentSentiment.negative} 条 ({((currentSentiment.negative / totalSentiment) * 100).toFixed(0)}%)</span>
                </div>
                <Progress percent={((currentSentiment.negative / totalSentiment) * 100).toFixed(0)} strokeColor="#ff4d4f" />
              </div>
              <div>
                <div style={{ marginBottom: 8 }}>
                  <span>中性</span>
                  <span style={{ marginLeft: 8, color: '#666' }}>{currentSentiment.neutral} 条 ({((currentSentiment.neutral / totalSentiment) * 100).toFixed(0)}%)</span>
                </div>
                <Progress percent={((currentSentiment.neutral / totalSentiment) * 100).toFixed(0)} strokeColor="#d9d9d9" />
              </div>
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card 
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>关键词排行</span>
                <Select 
                  value={keywordPeriod} 
                  onChange={setKeywordPeriod} 
                  size="small" 
                  style={{ width: 80 }}
                >
                  <Option value="daily">每日</Option>
                  <Option value="threeDays">每3日</Option>
                  <Option value="weekly">每周</Option>
                  <Option value="monthly">每月</Option>
                </Select>
              </div>
            }
            style={{ height: 300 }}
          >
            <Table
              dataSource={mockHotKeywords[keywordPeriod].slice(0, 3)}
              columns={hotKeywordsColumns}
              rowKey="id"
              pagination={false}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card 
            title="最近执行任务"
            extra={
              <Button type="text" onClick={handleMoreTasks}>
                <MoreOutlined /> 更多
              </Button>
            }
          >
            <Table
              dataSource={mockRecentTasks}
              columns={recentTasksColumns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Workbench
