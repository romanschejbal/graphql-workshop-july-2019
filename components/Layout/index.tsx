import React from 'react';
import Link from 'next/link';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { Layout, Menu, Icon, Breadcrumb, Row, Col } from 'antd';
import { useRouter } from 'next/router';

import './Layout.scss';
import 'antd/dist/antd.css';

import { GetViewer } from '../../__generated__/GetViewer';

const { Header, Content, Sider } = Layout;

export default function CustomLayout({ children }) {
  const router = useRouter();
  return (
    <Query<GetViewer>
      query={gql`
        query GetViewer {
          viewer {
            ...LayoutFragment
          }
        }
        ${CustomLayout.fragment}
      `}
    >
      {({ data }) => (
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
              <Menu.Item>
                <a href="/graphql">
                  <Icon type="radar-chart" />
                  GraphiQL
                </a>
              </Menu.Item>
              <Menu.Item>
                <a href="/auth/github">
                  <Icon type="user" />
                  {data && data.viewer ? '@' + data.viewer.username : 'Login'}
                </a>
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
      )}
    </Query>
  );
}

CustomLayout.fragment = gql`
  fragment LayoutFragment on User {
    id
    username
  }
`;
