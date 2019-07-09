import React from 'react';
import { Icon, Progress } from 'antd';

import Layout from '../components/Layout';

export default function Detail() {
  return (
    <Layout>
      <h2>Question</h2>
      <ol>
        <li>
          <a href="#">Answer</a>

          <Progress
            percent={(100 / 4) * 2}
            format={number => (
              <div style={{ float: 'right' }}>
                {2} <Icon type="like" />
              </div>
            )}
          />
        </li>
      </ol>
    </Layout>
  );
}
