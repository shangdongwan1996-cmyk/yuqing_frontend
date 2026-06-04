import { useState } from 'react'
import { Layout, Menu, Button, Avatar, Dropdown } from 'antd'
import { 
  KeyOutlined, 
  FileTextOutlined, 
  BarChartOutlined, 
  UserOutlined, 
  LogoutOutlined,
  MenuOutlined
} from '@ant-design/icons'
import Login from './pages/Login'
import KeywordManagement from './pages/KeywordManagement'
import TaskManagement from './pages/TaskManagement'
import ReportManagement from './pages/ReportManagement'
import PermissionManagement from './pages/PermissionManagement'

const { Header, Content, Sider } = Layout

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentPage, setCurrentPage] = useState('keyword')
  const [collapsed, setCollapsed] = useState(false)

  const handleLogin = () => {
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setCurrentPage('keyword')
  }

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />
  }

  const menuItems = [
    { key: 'keyword', icon: <KeyOutlined />, label: '关键词管理' },
    { key: 'task', icon: <FileTextOutlined />, label: '任务管理' },
    { key: 'report', icon: <BarChartOutlined />, label: '报告管理' },
    { key: 'permission', icon: <UserOutlined />, label: '权限管理' },
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
      case 'keyword':
        return <KeywordManagement />
      case 'task':
        return <TaskManagement />
      case 'report':
        return <ReportManagement />
      case 'permission':
        return <PermissionManagement />
      default:
        return <KeywordManagement />
    }
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={setCollapsed}
        style={{ background: '#001529' }}
      >
        <div className="logo" style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: '#fff',
          fontSize: collapsed ? 20 : 18,
          fontWeight: 'bold'
        }}>
          {collapsed ? '舆情' : '舆情数据管理'}
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
          justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)'
        }}>
          <Button 
            type="text" 
            icon={<MenuOutlined />} 
            onClick={() => setCollapsed(!collapsed)}
            style={{ marginRight: 16 }}
          />
          <span style={{ fontSize: 18, fontWeight: 'bold', color: '#1890ff' }}>
            {menuItems.find(item => item.key === currentPage)?.label}
          </span>
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
