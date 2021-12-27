import React from 'react';
import { Form, Input } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { Block, Button } from '../../../components';
import { validateField } from '../../../utils/helpers';

const RegisterForm = (props) => {
  const {
    touched,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting,
  } = props;
  return (
    <div>
      <div className="auth__top">
        <h2>Регистрация</h2>
        <p>Для входа в чат, вам нужно зарегистрироваться</p>
      </div>
      <Block>
        <Form onSubmit={handleSubmit} className="login-form">
          <Form.Item
            name="email"
            validateStatus={validateField('email', touched, errors)}
            help={!touched.email ? '' : errors.email}
            hasFeedback
          >
            <Input
              id="email"
              prefix={<MailOutlined className="site-form-item-icon" />}
              placeholder="Е-Mail"
              size="large"
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </Form.Item>
          <Form.Item
            name="username"
            validateStatus={validateField('username', touched, errors)}
            help={!touched.username ? '' : errors.username}
            hasFeedback
          >
            <Input
              id="username"
              prefix={<UserOutlined className="site-form-item-icon" />}
              placeholder="Имя пользователя"
              size="large"
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </Form.Item>
          <Form.Item
            name="userfullname"
            validateStatus={validateField('userfullname', touched, errors)}
            help={!touched.userfullname ? '' : errors.userfullname}
            hasFeedback
          >
            <Input
              id="userfullname"
              prefix={<UserOutlined className="site-form-item-icon" />}
              placeholder="Ваше имя"
              size="large"
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </Form.Item>
          <Form.Item
            name="phone"
            validateStatus={validateField('phone', touched, errors)}
            help={!touched.phone ? '' : errors.phone}
            hasFeedback
          >
            <Input
              id="phone"
              prefix={<PhoneOutlined className="site-form-item-icon" />}
              placeholder="Ваш телефон"
              size="large"
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </Form.Item>
          <Form.Item
            name="password"
            validateStatus={validateField('password', touched, errors)}
            help={!touched.password ? '' : errors.password}
            hasFeedback
          >
            <Input
              id="password"
              prefix={<LockOutlined className="site-form-item-icon" />}
              type="password"
              placeholder="Пароль"
              size="large"
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </Form.Item>
          <Form.Item
            name="confirm__password"
            validateStatus={validateField('confirm__password', touched, errors)}
            help={!touched.confirm__password ? '' : errors.confirm__password}
            hasFeedback
          >
            <Input
              id="confirm__password"
              prefix={<LockOutlined className="site-form-item-icon" />}
              type="password"
              placeholder="Повторите пароль"
              size="large"
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </Form.Item>
          <Form.Item>
            <Button
              disabled={isSubmitting}
              onClick={handleSubmit}
              type="primary"
              size="large"
            >
              Зарегистрироваться
            </Button>
          </Form.Item>
          <Link className="auth__register-link" to="/login">
            Войти в аккаунт
          </Link>
        </Form>
      </Block>
    </div>
  );
};

export default RegisterForm;
