import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import Link from 'next/link';
import { Icon } from 'antd';

import Layout from '../components/Layout';
import Subscribe from '../components/Subscribe';

import { GetPolls } from '../__generated__/GetPolls';

const GET_POLL_QUERY = gql`
  query GetPolls {
    viewer {
      ...LayoutFragment
    }
    polls {
      id
      question
      voteCount
    }
  }
  ${Layout.fragment}
`;

const POLL_ADDED_SUBSCRIPTION = gql`
  subscription PollAdded {
    pollAdded {
      id
      question
      voteCount
    }
  }
`;

export default function Index() {
  return (
    <Layout>
      <Query<GetPolls> query={GET_POLL_QUERY} fetchPolicy="cache-and-network">
        {({ data, loading, error, subscribeToMore }: any) => {
          if (loading) {
            return <Icon type="loading" style={{ fontSize: 24 }} />;
          }
          if (error) {
            return error.toString();
          }
          return (
            <>
              <h2>Latest Questions</h2>
              <ul>
                {data.polls.map((poll: any) => (
                  <li key={poll.id}>
                    <Link href={`detail?id=${poll.id}`}>
                      <a>{poll.question}</a>
                    </Link>{' '}
                    ({poll.voteCount} <Icon type="like" />)
                  </li>
                ))}
              </ul>
              <Subscribe
                callback={() =>
                  subscribeToMore({
                    document: POLL_ADDED_SUBSCRIPTION,
                    updateQuery: (prev, { subscriptionData }) => {
                      if (!subscriptionData.data) return prev;
                      const newPoll = subscriptionData.data.pollAdded;

                      return {
                        ...prev,
                        polls: [newPoll, ...prev.polls]
                      };
                    }
                  })
                }
              />
            </>
          );
        }}
      </Query>
    </Layout>
  );
}

Index.query = () => ({
  query: GET_POLL_QUERY
});
