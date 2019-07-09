import React from 'react';
import Link from 'next/link';
import { Icon } from 'antd';

import Layout from '../components/Layout';

export default function Index() {
  return (
    <Layout>
      <h2>Latest Questions</h2>
      <ul>
        <li>
          <Link href={`detail?id=`}>
            <a>Question?</a>
          </Link>{' '}
          ({2} <Icon type="like" />)
        </li>
      </ul>
    </Layout>
  );
}
