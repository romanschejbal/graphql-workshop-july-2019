import React from 'react';
import gql from 'graphql-tag';
import Link from 'next/link';
import { Icon } from 'antd';

interface IProps {
  polls: any;
}

export default function PollList(props: IProps) {
  return (
    <ul>
      {props.polls.map(poll => (
        <li key={poll.id}>
          <Link href={`detail?id=${poll.id}`}>
            <a>{poll.question}</a>
          </Link>{' '}
          ({poll.voteCount} <Icon type="like" />)
        </li>
      ))}
    </ul>
  );
}

const Polllist: React.FC<IProps> = (props: IProps) => <div />;

PollList.fragment = gql`
  fragment PollListFragment on Poll {
    id
    question
    voteCount
  }
`;
