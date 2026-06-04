import { useState } from 'react'
import { Form, Input, Button, Card, message, Modal, Row, Col } from 'antd'
import { UserOutlined, PhoneOutlined, LockOutlined, MailOutlined } from '@ant-design/icons'

function PermissionManagement() {
  const [userInfo, setUserInfo] = useState({
    name: '管理员',
    userId: 'ADMIN001',
    phone: '13800138000',
    password: '******'
  })
  const [isPhoneModalVisible, setIsPhoneModalVisible] = useState(false)
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false)
  const [isNameModalVisible, setIsNameModalVisible] = useState(false)
  const [captcha, setCaptcha] = useState('')
  const [captchaText, setCaptchaText] = useState('')
  const [showCaptcha, setShowCaptcha] = useState(false)

  const phoneForm = Form.useForm()[0]
  const passwordForm = Form.useForm()[0]
  const nameForm = Form.useForm()[0]

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

  const handlePhoneOk = () => {
    phoneForm.validateFields().then(values => {
      if (values.smsCode === '123456') {
        setUserInfo(prev => ({ ...prev, phone: values.phone }))
        message.success('手机号修改成功')
        setIsPhoneModalVisible(false)
        phoneForm.resetFields()
      } else {
        message.error('验证码错误')
      }
    }).catch(err => {
      console.error(err)
    })
  }

  const handlePasswordOk = () => {
    passwordForm.validateFields().then(values => {
      if (values.oldPassword !== '123456') {
        message.error('旧密码错误')
        return
      }
      if (values.newPassword !== values.confirmPassword) {
        message.error('两次输入的密码不一致')
        return
      }
      setUserInfo(prev => ({ ...prev, password: '******' }))
      message.success('密码修改成功')
      setIsPasswordModalVisible(false)
      passwordForm.resetFields()
    }).catch(err => {
      console.error(err)
    })
  }

  const handleNameOk = () => {
    nameForm.validateFields().then(values => {
      setUserInfo(prev => ({ ...prev, name: values.name }))
      message.success('姓名修改成功')
      setIsNameModalVisible(false)
      nameForm.resetFields()
    }).catch(err => {
      console.error(err)
    })
  }

  return (
    <div>
      <Card title="个人信息" style={{ maxWidth: 600, margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <UserOutlined style={{ fontSize: 20, color: '#1890ff' }} />
              <span style={{ fontWeight: 'bold' }}>姓名</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span>{userInfo.name}</span>
              <Button type="link" onClick={() => setIsNameModalVisible(true)}>修改</Button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <LockOutlined style={{ fontSize: 20, color: '#1890ff' }} />
              <span style={{ fontWeight: 'bold' }}>唯一ID</span>
            </div>
            <span>{userInfo.userId}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <PhoneOutlined style={{ fontSize: 20, color: '#1890ff' }} />
              <span style={{ fontWeight: 'bold' }}>手机号</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span>{userInfo.phone}</span>
              <Button type="link" onClick={() => setIsPhoneModalVisible(true)}>修改</Button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <LockOutlined style={{ fontSize: 20, color: '#1890ff' }} />
              <span style={{ fontWeight: 'bold' }}>密码</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span>{userInfo.password}</span>
              <Button type="link" onClick={() => setIsPasswordModalVisible(true)}>修改</Button>
            </div>
          </div>
        </div>
      </Card>

      <Modal
        title="修改姓名"
        visible={isNameModalVisible}
        onOk={handleNameOk}
        onCancel={() => setIsNameModalVisible(false)}
      >
        <Form form={nameForm} layout="vertical">
          <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input placeholder="请输入姓名" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="修改手机号"
        visible={isPhoneModalVisible}
        onOk={handlePhoneOk}
        onCancel={() => {
          setIsPhoneModalVisible(false)
          setShowCaptcha(false)
          setCaptcha('')
          phoneForm.resetFields()
        }}
      >
        <Form form={phoneForm} layout="vertical">
          <Form.Item name="phone" label="新手机号" rules={[{ required: true, message: '请输入手机号' }, { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }]}>
            <Input prefix={<PhoneOutlined />} placeholder="请输入新手机号" />
          </Form.Item>
          {showCaptcha ? (
            <Form.Item name="captcha" label="数字验证码" rules={[{ required: true, message: '请输入数字验证码' }]}>
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
                  <Button type="primary" onClick={generateCaptcha} style={{ height: 40 }}>
                    {captchaText || '获取'}
                  </Button>
                </Col>
              </Row>
            </Form.Item>
          ) : null}
          <Form.Item name="smsCode" label="短信验证码" rules={[{ required: true, message: '请输入短信验证码' }]}>
            <Row gutter={8}>
              <Col span={16}>
                <Input prefix={<PhoneOutlined />} placeholder="请输入短信验证码" />
              </Col>
              <Col span={8}>
                <Button 
                  type="primary" 
                  onClick={() => {
                    generateCaptcha()
                    setShowCaptcha(true)
                  }}
                  style={{ height: 40 }}
                >
                  获取验证码
                </Button>
              </Col>
            </Row>
          </Form.Item>
          {showCaptcha && (
            <Button type="default" onClick={handleSendSms} style={{ width: '100%', marginTop: 8 }}>
              发送短信验证码
            </Button>
          )}
        </Form>
      </Modal>

      <Modal
        title="修改密码"
        visible={isPasswordModalVisible}
        onOk={handlePasswordOk}
        onCancel={() => {
          setIsPasswordModalVisible(false)
          passwordForm.resetFields()
        }}
      >
        <Form form={passwordForm} layout="vertical">
          <Form.Item name="oldPassword" label="旧密码" rules={[{ required: true, message: '请输入旧密码' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="请输入旧密码" />
          </Form.Item>
          <Form.Item name="newPassword" label="新密码" rules={[{ required: true, message: '请输入新密码' }, { min: 6, message: '密码长度不能少于6位' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="请输入新密码" />
          </Form.Item>
          <Form.Item name="confirmPassword" label="确认密码" rules={[{ required: true, message: '请确认密码' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="请确认新密码" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default PermissionManagement
