import React, { useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import gql from 'graphql-tag';
import { Query, ApolloConsumer, Subscription } from 'react-apollo';
import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import ApolloClient, { WatchQueryOptions } from 'apollo-client';
import { Icon, Progress } from 'antd';

import Layout from '../components/Layout';
import Subscribe from '../components/Subscribe';

import { GetPollDetail } from '../__generated__/GetPollDetail';
import { PollVoted } from '../__generated__/PollVoted';
import { ApolloClientCopy } from './_app';

const GET_POLL_QUERY = gql`
  query GetPollDetail($id: String!) {
    viewer {
      ...LayoutFragment
    }
    poll(id: $id) {
      id
      question
      answers {
        id
        text
        users {
          id
        }
      }
      voteCount
      status
    }
  }
  ${Layout.fragment}
`;

const POLL_VOTED_SUBSCRIPTION = gql`
  subscription PollVoted {
    pollVoted {
      id
      question
      answers {
        id
        text
        users {
          id
        }
      }
      voteCount
      status
    }
  }
`;

function useQuery<TData, TVariables = {}>(
  options: WatchQueryOptions<TVariables>
) {
  const client = useContext(ApolloClientCopy);
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null
  });
  useEffect(() => {
    const subscription = client
      .watchQuery<TData, TVariables>(options)
      .subscribe({
        next: response =>
          setState({ loading: false, error: null, data: response.data }),
        error: error => setState({ ...state, loading: false, error })
      });
    return () => subscription.unsubscribe();
  }, []);
  return state;
}

export default function Detail() {
  const router = useRouter();

  const vote = (
    client: ApolloClient<NormalizedCacheObject>,
    pollId: string,
    answerId: string
  ) => (e: React.SyntheticEvent) => {
    e.preventDefault();

    client.mutate({
      mutation: gql`
        mutation VotePoll($pollId: String!, $answerId: String!) {
          votePoll(pollId: $pollId, answerId: $answerId) {
            answers {
              id
              text
              users {
                id
              }
            }
            voteCount
          }
        }
      `,
      variables: { pollId, answerId }
    });
  };

  const client = useContext(ApolloClientCopy);
  const { data, loading, error } = useQuery<GetPollDetail>({
    query: GET_POLL_QUERY,
    variables: { id: router.query.id }
  });

  if (loading) {
    return <Icon type="loading" style={{ fontSize: 24 }} />;
  }

  if (error) {
    return error.toString();
  }

  return (
    <Layout>
      <h2>{data.poll.question}</h2>
      {!data.viewer ? <p>(You need to login in order to participate)</p> : null}
      <ol>
        {data.poll.answers.map(answer => (
          <li key={answer.id}>
            {data.viewer ? (
              <a href="#" onClick={vote(client, data.poll.id, answer.id)}>
                {answer.text}
              </a>
            ) : (
              answer.text
            )}{' '}
            <Progress
              percent={(100 / data.poll.voteCount) * answer.users.length}
              format={number => (
                <div style={{ float: 'right' }}>
                  {answer.users.length} <Icon type="like" />
                </div>
              )}
            />
          </li>
        ))}
      </ol>
      <Subscription subscription={POLL_VOTED_SUBSCRIPTION} />
    </Layout>
  );
}

Detail.qquery = ({ query }) => ({
  query: GET_POLL_QUERY,
  variables: { id: query.id }
});
