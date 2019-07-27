import { makeExecutableSchema } from 'graphql-tools';
import { PubSub } from 'graphql-subscriptions';
import fs from 'fs';
import * as repository from './repository';

const typeDefs = fs.readFileSync('./schema.graphql', 'utf8');

const pubsub = new PubSub();

enum Event {
  POLL_ADDED = 'POLL_ADDED',
  POLL_UPDATED = 'POLL_UPDATED'
}

const resolvers = {
  Poll: {
    voteCount: (poll: any) =>
      poll.answers.reduce(
        (total: number, answer: any) => total + answer.users.length,
        0
      ),
    owner: poll => repository.getUser(poll.ownerId)
  },
  User: {
    polls: user => repository.getPolls().filter(poll => poll.ownerId == user.id)
  },
  Query: {
    poll: (_: any, { id }: any) => repository.getPoll(id),
    polls: () => repository.getPolls(),
    users: () => repository.getUsers(),
    viewer: (_: any, __: any, ctx: any) => ctx.user
  },
  Subscription: {
    pollAdded: {
      subscribe: () => pubsub.asyncIterator(Event.POLL_ADDED)
    },
    pollVoted: {
      subscribe: () => pubsub.asyncIterator(Event.POLL_UPDATED)
    }
  },
  Mutation: {
    addPoll: async (_: any, { poll }, ctx) => {
      if (!ctx.user) {
        throw new Error('Not logged in');
      }
      poll = repository.addPoll(poll);
      poll.ownerId = ctx.user.id;
      await pubsub.publish(Event.POLL_ADDED, { pollAdded: poll });
      return poll;
    },
    votePoll: async (_: any, { pollId, answerId }, ctx) => {
      if (!ctx.user) {
        throw new Error('Not logged in');
      }
      const poll = repository.getPoll(pollId);
      poll.answers = poll.answers.map(answer => ({
        ...answer,
        users: answer.users.filter(user => user.id !== ctx.user.id)
      }));
      const pollVoted = repository.votePoll(pollId, answerId, ctx.user);
      await pubsub.publish(Event.POLL_UPDATED, { pollVoted });
      return pollVoted;
    }
  }
};

export default function createExecutableSchema() {
  return makeExecutableSchema({ typeDefs, resolvers });
}
