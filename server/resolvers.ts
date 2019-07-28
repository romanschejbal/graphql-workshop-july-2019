import { PubSub } from 'graphql-subscriptions';
import * as repository from './repository';

const pubsub = new PubSub();

enum SubscriptionEvent {
  POLL_VOTED = 'POLL_VOTED'
}

export default {
  Answer: {
    voteCount: answer => answer.users.length
  },
  Poll: {
    question: poll => poll.text
  },
  GithubUser: {
    username: user => user.login,
    followers: (user, __, ctx) => ctx.getter.load(user.followers_url)
  },
  Query: {
    polls: () => repository.getPolls(),
    poll: (_rootType: any, { id }) => repository.getPoll(id),
    githubUser: (_, { username }, ctx) =>
      ctx.getter.load(`https://api.github.com/users/${username}`)
  },
  Mutation: {
    votePoll: (_, { pollId, answerId }) => {
      const poll = repository.getPoll(pollId);
      if (!poll) {
        throw new Error('Poll not found');
      }
      repository.votePoll(pollId, answerId, { id: '1' });
      pubsub.publish(SubscriptionEvent.POLL_VOTED, { pollVoted: poll });
      return poll;
    }
  },
  Subscription: {
    pollVoted: {
      subscribe: () => {
        console.log('Subscribing...😎');
        return pubsub.asyncIterator(SubscriptionEvent.POLL_VOTED);
      }
    }
  }
};
