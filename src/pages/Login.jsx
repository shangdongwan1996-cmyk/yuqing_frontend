import { useState } from 'react'
import { Form, Input, Button, Card, message, Row, Col } from 'antd'
import { UserOutlined, LockOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons'

function Login({ onLogin }) {
  const [form] = Form.useForm()
  const [loginType, setLoginType] = useState('password')
  const [captcha, setCaptcha] = useState('')
  const [captchaText, setCaptchaText] = useState('')
  const [showCaptcha, setShowCaptcha] = useState(false)

  const generateCaptcha = () => {
    const chars = '0123456789'
    let text = ''
    for (let i = 0; i < 4; i++) {
      text += chars[Math.floor(Math.random() * chars.length)]
    }
    setCaptchaText(text)
  }

  const handleSendSms = () => {
    if (!captcha || captcha !== captchaText) {
      message.error('请输入正确的数字验证码')
      return
    }
    message.success('短信验证码已发送')
    setShowCaptcha(false)
    setCaptcha('')
  }

  const onFinish = (values) => {
    if (loginType === 'password') {
      if ((values.username === 'admin' || values.username === '13800138000') && values.password === '123456') {
        message.success('登录成功')
        onLogin()
      } else {
        message.error('账号或密码错误')
      }
    } else {
      if ((values.username === 'admin' || values.username === '13800138000') && values.smsCode === '123456') {
        message.success('登录成功')
        onLogin()
      } else {
        message.error('账号或验证码错误')
      }
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Card 
        style={{ 
          width: 450, 
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)' 
        }}
        title={
          <div style={{ textAlign: 'center', fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
            舆情数据管理后台
          </div>
        }
      >
        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="username"
            label="账号"
            rules={[
              { required: true, message: '请输入账号' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="请输入手机号或唯一ID"
            />
          </Form.Item>

          {loginType === 'password' ? (
            <Form.Item
              name="password"
              label="密码"
              rules={[
                { required: true, message: '请输入密码' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请输入密码"
              />
            </Form.Item>
          ) : (
            <>
              {showCaptcha ? (
                <div>
                  <Form.Item
                    name="captcha"
                    label="数字验证码"
                    rules={[
                      { required: true, message: '请输入数字验证码' },
                    ]}
                  >
                    <Row gutter={8}>
                      <Col span={16}>
                        <Input
                          prefix={<MailOutlined />}
                          placeholder="请输入数字验证码"
                          value={captcha}
                          onChange={(e) => setCaptcha(e.target.value)}
                        />
                      </Col>
                      <Col span={8}>
                        <Button 
                          type="primary"
                          onClick={generateCaptcha}
                          style={{ height: 40 }}
                        >
                          {captchaText || '获取'}
                        </Button>
                      </Col>
                    </Row>
                  </Form.Item>
                  <Button 
                    type="default" 
                    onClick={handleSendSms}
                    style={{ width: '100%', marginBottom: 16 }}
                  >
                    发送短信验证码
                  </Button>
                </div>
              ) : (
                <>
                  <Form.Item
                    name="smsCode"
                    label="短信验证码"
                    rules={[
                      { required: true, message: '请输入短信验证码' },
                    ]}
                  >
                    <Input
                      prefix={<PhoneOutlined />}
                      placeholder="请输入短信验证码"
                    />
                  </Form.Item>
                  <Button 
                    type="default" 
                    onClick={() => {
                      generateCaptcha()
                      setShowCaptcha(true)
                    }}
                    style={{ width: '100%', marginBottom: 16 }}
                  >
                    获取短信验证码
                  </Button>
                </>
              )}
            </>
          )}

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%', height: 44 }}>
              登 录
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Button 
              type="text" 
              onClick={() => setLoginType(loginType === 'password' ? 'sms' : 'password')}
            >
              {loginType === 'password' ? '使用短信验证码登录' : '使用密码登录'}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  )
}

export default Login
