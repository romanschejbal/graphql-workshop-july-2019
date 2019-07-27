import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import { Icon } from 'antd';

import Layout from '../components/Layout';
import Subscribe from '../components/Subscribe';
import PollList from '../components/PollList';

import { GetPolls } from '../__generated__/GetPolls';

const GET_POLL_QUERY = gql`
  query GetPolls {
    viewer {
      ...LayoutFragment
    }
    polls {
      ...PollListFragment
    }
  }
  ${Layout.fragment}
  ${PollList.fragment}
`;

const POLL_ADDED_SUBSCRIPTION = gql`
  subscription PollAdded {
    pollAdded {
      ...PollListFragment
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
              <PollList polls={data.polls} />
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
