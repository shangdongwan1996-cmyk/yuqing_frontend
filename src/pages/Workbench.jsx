import { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Table, Tag, Progress } from 'antd'
import {
  TagOutlined, KeyOutlined, FileTextOutlined, ClockCircleOutlined,
  BarChartOutlined, CheckCircleOutlined, CloseCircleOutlined,
  ArrowUpOutlined, ArrowDownOutlined
} from '@ant-design/icons'

const mockData = {
  stats: {
    themes: 3,
    keywords: 7,
    tasks: 6,
    tasksSuccess: 5,
    tasksFailed: 1,
    reports: 3,
    logEntries: 7
  },
  themeSummary: [
    { theme: '谦寻', taskCount: 2, logCount: 3, level: '高', riskLevel: '低风险', riskColor: 'green' },
    { theme: '交个朋友', taskCount: 2, logCount: 2, level: '中', riskLevel: '极高风险', riskColor: 'red' },
    { theme: 'Babycare', taskCount: 2, logCount: 2, level: '高', riskLevel: '低-中风险', riskColor: 'orange' },
  ],
  sentimentSummary: { positive: 1, negative: 3, neutral: 3 },
  recentTasks: [
    { id: 1, taskNo: '20260603164009', theme: '交个朋友', keyword: '交个朋友投诉', status: '成功', resultCount: 4, createdAt: '2026-06-03 16:40:09' },
    { id: 2, taskNo: '20260603164036', theme: 'Babycare', keyword: 'babycare投诉', status: '成功', resultCount: 2, createdAt: '2026-06-03 16:40:36' },
    { id: 3, taskNo: '20260602100000', theme: '谦寻', keyword: '流浪猫 浅浅', status: '成功', resultCount: 3, createdAt: '2026-06-02 10:00:00' },
    { id: 4, taskNo: '20260601153000', theme: '交个朋友', keyword: '交个朋友售后', status: '成功', resultCount: 12, createdAt: '2026-06-01 15:30:00' },
    { id: 5, taskNo: '20260531090000', theme: 'Babycare', keyword: 'Babycare质量问题', status: '已失败', resultCount: 0, createdAt: '2026-05-31 09:00:00' },
  ],
  recentLogs: [
    { id: 1, theme: '交个朋友', keyword: '交个朋友投诉', sentiment: '负面', themeRelevance: '高', siteName: '黑猫投诉', createAt: '2026-06-03 16:40:25' },
    { id: 2, theme: 'Babycare', keyword: 'Babycare 质量问题', sentiment: '负面', themeRelevance: '高', siteName: '消费者报道', createAt: '2026-06-03 16:50:00' },
    { id: 3, theme: '谦寻', keyword: '流浪猫 浅浅', sentiment: '正面', themeRelevance: '高', siteName: '百家号', createAt: '2026-06-03 16:40:25' },
    { id: 4, theme: '交个朋友', keyword: '交个朋友售后', sentiment: '中性', themeRelevance: '中', siteName: '黑猫投诉', createAt: '2026-06-03 16:55:00' },
    { id: 5, theme: '谦寻', keyword: '谦寻控股 新总部', sentiment: '中性', themeRelevance: '低', siteName: '百家号', createAt: '2026-06-03 16:40:25' },
  ],
  lastMonitorTime: '2026-06-04 16:40:25'
}

const sentimentColor = (text) => text === '正面' ? 'green' : text === '负面' ? 'red' : 'gray'
const relevanceColor = (text) => text === '高' ? 'red' : text === '中' ? 'orange' : 'gray'

function Workbench() {
  const [currentTime, setCurrentTime] = useState('')

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleString('zh-CN', { hour12: false }))
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  const taskColumns = [
    { title: '任务流水号', dataIndex: 'taskNo', key: 'taskNo', width: 160 },
    { title: '主体', dataIndex: 'theme', key: 'theme', width: 110, render: (t) => <span style={{ color: '#1890ff', fontWeight: 'bold' }}>{t}</span> },
    { title: '关键词', dataIndex: 'keyword', key: 'keyword', width: 170, ellipsis: true },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (s) => <Tag color={s === '成功' ? 'green' : 'red'}>{s}</Tag> },
    { title: '结果数', dataIndex: 'resultCount', key: 'resultCount', width: 80 },
    { title: '时间', dataIndex: 'createdAt', key: 'createdAt', width: 170 },
  ]

  const logColumns = [
    { title: '主体', dataIndex: 'theme', key: 'theme', width: 100, render: (t) => <span style={{ color: '#1890ff' }}>{t}</span> },
    { title: '关键词', dataIndex: 'keyword', key: 'keyword', width: 160, ellipsis: true },
    { title: '分析结果', dataIndex: 'sentiment', key: 'sentiment', width: 90, render: (s) => <Tag color={sentimentColor(s)}>{s}</Tag> },
    { title: '关联度', dataIndex: 'themeRelevance', key: 'themeRelevance', width: 80, render: (r) => <Tag color={relevanceColor(r)}>{r}</Tag> },
    { title: '站点', dataIndex: 'siteName', key: 'siteName', width: 120 },
    { title: '时间', dataIndex: 'createAt', key: 'createAt', width: 170 },
  ]

  const themeColumns = [
    { title: '主体', dataIndex: 'theme', key: 'theme', width: 100, render: (t) => <span style={{ color: '#1890ff', fontWeight: 'bold' }}>{t}</span> },
    { title: '监测等级', dataIndex: 'level', key: 'level', width: 90, render: (l) => <Tag color={l === '高' ? 'red' : l === '中' ? 'orange' : 'gray'}>{l}</Tag> },
    { title: '任务数', dataIndex: 'taskCount', key: 'taskCount', width: 80 },
    { title: '日志数', dataIndex: 'logCount', key: 'logCount', width: 80 },
    {
      title: '风险等级', dataIndex: 'riskLevel', key: 'riskLevel', width: 110,
      render: (r, record) => <Tag color={record.riskColor}>{r}</Tag>
    },
  ]

  const totalSentiment = mockData.sentimentSummary.positive + mockData.sentimentSummary.negative + mockData.sentimentSummary.neutral

  return (
    <div style={{ backgroundColor: '#f5f5f5', minHeight: '100%', padding: 24, margin: -24 }}>
      {/* 顶部时间栏 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
              <div>
                <div style={{ color: '#8c8c8c', fontSize: 14, marginBottom: 8 }}>当前时间</div>
                <div style={{ fontSize: 20, fontWeight: 'bold', color: '#1890ff' }}>{currentTime}</div>
              </div>
              <div style={{ width: 1, height: 40, backgroundColor: '#f0f0f0' }} />
              <div>
                <div style={{ color: '#8c8c8c', fontSize: 14, marginBottom: 8 }}>最近一次监测时间</div>
                <div style={{ fontSize: 20, fontWeight: 'bold', color: '#52c41a' }}>{mockData.lastMonitorTime}</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={3}>
          <Card><Statistic title="主体总数" value={mockData.stats.themes} prefix={<TagOutlined />} valueStyle={{ color: '#1890ff' }} /></Card>
        </Col>
        <Col span={3}>
          <Card><Statistic title="关键词总数" value={mockData.stats.keywords} prefix={<KeyOutlined />} valueStyle={{ color: '#722ed1' }} /></Card>
        </Col>
        <Col span={3}>
          <Card><Statistic title="任务总数" value={mockData.stats.tasks} prefix={<FileTextOutlined />} suffix={<span style={{ fontSize: 14 }}>/ 成功{mockData.stats.tasksSuccess} 失败{mockData.stats.tasksFailed}</span>} valueStyle={{ color: '#fa8c16' }} /></Card>
        </Col>
        <Col span={3}>
          <Card><Statistic title="报告总数" value={mockData.stats.reports} prefix={<BarChartOutlined />} valueStyle={{ color: '#52c41a' }} /></Card>
        </Col>
      </Row>

      {/* 任务统计 & 情感分布 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <Card title="任务执行统计" style={{ height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              <div style={{ textAlign: 'center' }}>
                <CheckCircleOutlined style={{ fontSize: 32, color: '#52c41a' }} />
                <div style={{ marginTop: 8, fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>{mockData.stats.tasksSuccess}</div>
                <div style={{ color: '#8c8c8c' }}>成功</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <CloseCircleOutlined style={{ fontSize: 32, color: '#ff4d4f' }} />
                <div style={{ marginTop: 8, fontSize: 24, fontWeight: 'bold', color: '#ff4d4f' }}>{mockData.stats.tasksFailed}</div>
                <div style={{ color: '#8c8c8c' }}>失败</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ marginTop: 8, fontSize: 24, fontWeight: 'bold' }}>
                  {mockData.stats.tasksSuccess + mockData.stats.tasksFailed ? ((mockData.stats.tasksSuccess / (mockData.stats.tasksSuccess + mockData.stats.tasksFailed)) * 100).toFixed(0) : 0}%
                </div>
                <div style={{ color: '#8c8c8c' }}>成功率</div>
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <Progress percent={mockData.stats.tasksSuccess + mockData.stats.tasksFailed ? parseFloat(((mockData.stats.tasksSuccess / (mockData.stats.tasksSuccess + mockData.stats.tasksFailed)) * 100).toFixed(0)) : 0} strokeColor="#52c41a" />
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="情感分布概览" style={{ height: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>正面 <Tag color="green">{mockData.sentimentSummary.positive}</Tag></span>
                  <span>{((mockData.sentimentSummary.positive / totalSentiment) * 100).toFixed(0)}%</span>
                </div>
                <Progress percent={parseFloat(((mockData.sentimentSummary.positive / totalSentiment) * 100).toFixed(0))} strokeColor="#52c41a" showInfo={false} />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>负面 <Tag color="red">{mockData.sentimentSummary.negative}</Tag></span>
                  <span>{((mockData.sentimentSummary.negative / totalSentiment) * 100).toFixed(0)}%</span>
                </div>
                <Progress percent={parseFloat(((mockData.sentimentSummary.negative / totalSentiment) * 100).toFixed(0))} strokeColor="#ff4d4f" showInfo={false} />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>中性 <Tag color="gray">{mockData.sentimentSummary.neutral}</Tag></span>
                  <span>{((mockData.sentimentSummary.neutral / totalSentiment) * 100).toFixed(0)}%</span>
                </div>
                <Progress percent={parseFloat(((mockData.sentimentSummary.neutral / totalSentiment) * 100).toFixed(0))} strokeColor="#d9d9d9" showInfo={false} />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 主体概览 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={24}>
          <Card title="主体监测概览">
            <Table dataSource={mockData.themeSummary} columns={themeColumns} rowKey="theme" pagination={false} />
          </Card>
        </Col>
      </Row>

      {/* 最近任务 & 最近日志 */}
      <Row gutter={16}>
        <Col span={12}>
          <Card title="最近执行任务">
            <Table dataSource={mockData.recentTasks} columns={taskColumns} rowKey="id" pagination={false} size="small" scroll={{ x: 700 }} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="最近监测日志">
            <Table dataSource={mockData.recentLogs} columns={logColumns} rowKey="id" pagination={false} size="small" scroll={{ x: 700 }} />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Workbench
