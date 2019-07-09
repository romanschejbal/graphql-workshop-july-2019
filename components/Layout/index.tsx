import React from 'react';
import Link from 'next/link';
import gql from 'graphql-tag';
import { Layout, Menu, Icon } from 'antd';
import { useRouter } from 'next/router';

import './Layout.scss';
import 'antd/dist/antd.css';

const { Content } = Layout;

export default function CustomLayout({ children }) {
  const router = useRouter();
  return (
    <Layout className="app">
      <header>
        <Menu
          theme="dark"
          mode="horizontal"
          style={{ lineHeight: '64px' }}
          selectedKeys={router.route === '/' ? ['home'] : []}
        >
          <Menu.Item key="home">
            <Link href="/">
              <a>
                <Icon type="home" />
                Home
              </a>
            </Link>
          </Menu.Item>
        </Menu>
      </header>
      <Layout>
        <Content
          style={{
            background: '#fff',
            padding: 16
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}

CustomLayout.fragment = gql`
  fragment LayoutFragment on User {
    id
    username
  }
`;
