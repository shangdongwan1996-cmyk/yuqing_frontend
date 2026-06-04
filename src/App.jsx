import { useState } from 'react'
import { Layout, Menu, Avatar, Dropdown } from 'antd'
import { 
  KeyOutlined, 
  FileTextOutlined, 
  BarChartOutlined, 
  UserOutlined, 
  LogoutOutlined,
  TagOutlined,
  ClockCircleOutlined,
  SlidersOutlined,
  HomeOutlined,
  DatabaseOutlined
} from '@ant-design/icons'
import Login from './pages/Login'
import ThemeManagement from './pages/ThemeManagement'
import KeywordManagement from './pages/KeywordManagement'
import TaskManagement from './pages/TaskManagement'
import MonitorLog from './pages/MonitorLog'
import ReportManagement from './pages/ReportManagement'
import MonitorLevel from './pages/MonitorLevel'
import UserManagement from './pages/UserManagement'
import Workbench from './pages/Workbench'
import FrequencyMaintenance from './pages/FrequencyMaintenance'
import DynamicKeywords from './pages/DynamicKeywords'
import PermissionManagement from './pages/PermissionManagement'

const { Header, Content, Sider } = Layout

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentPage, setCurrentPage] = useState('workbench')

  const handleLogin = () => {
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setCurrentPage('workbench')
  }

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />
  }

  const menuItems = [
    { key: 'workbench', icon: <HomeOutlined />, label: '工作台' },
    { key: 'theme', icon: <TagOutlined />, label: '主体管理' },
    { key: 'keyword', icon: <KeyOutlined />, label: '关键词管理' },
    { key: 'task', icon: <FileTextOutlined />, label: '监测任务' },
    { key: 'log', icon: <ClockCircleOutlined />, label: '监测日志' },
    { key: 'report', icon: <BarChartOutlined />, label: '舆情报告' },
    { key: 'dynamic', icon: <DatabaseOutlined />, label: '动态关键词库' },
    { type: 'divider' },
    { key: 'level', icon: <SlidersOutlined />, label: '监测等级管理' },
    { key: 'frequency', icon: <ClockCircleOutlined />, label: '执行频次维护' },
    { key: 'user', icon: <UserOutlined />, label: '用户管理' },
    { key: 'permission', icon: <UserOutlined />, label: '个人信息' },
  ]

  const dropdownMenu = (
    <Menu>
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        退出登录
      </Menu.Item>
    </Menu>
  )

  const renderContent = () => {
    switch (currentPage) {
      case 'workbench':
        return <Workbench />
      case 'theme':
        return <ThemeManagement />
      case 'keyword':
        return <KeywordManagement />
      case 'task':
        return <TaskManagement />
      case 'log':
        return <MonitorLog />
      case 'report':
        return <ReportManagement />
      case 'dynamic':
        return <DynamicKeywords />
      case 'level':
        return <MonitorLevel />
      case 'frequency':
        return <FrequencyMaintenance />
      case 'user':
        return <UserManagement />
      case 'permission':
        return <PermissionManagement />
      default:
        return <Workbench />
    }
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        style={{ background: '#001529' }}
      >
        <div className="logo" style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: '#fff',
          fontSize: 18,
          fontWeight: 'bold'
        }}>
          舆情数据管理
        </div>
        <Menu 
          theme="dark" 
          mode="inline" 
          selectedKeys={[currentPage]}
          onClick={(e) => setCurrentPage(e.key)}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header style={{ 
          background: '#fff', 
          padding: '0 20px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'flex-end',
          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)'
        }}>
          <Dropdown overlay={dropdownMenu}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              padding: '8px'
            }}>
              <Avatar icon={<UserOutlined />} />
              <span style={{ marginLeft: 8 }}>管理员</span>
            </div>
          </Dropdown>
        </Header>
        <Content style={{ padding: 24, margin: 20, background: '#fff', borderRadius: 8 }}>
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  )
}

export default App