let i = 0;

const users = [];

const polls = [
  {
    id: i++,
    text: 'Your favourite colour?',
    ownerId: '1391212',
    answers: [
      { id: i++, text: 'Black', users: [] },
      { id: i++, text: 'Blue', users: [] },
      { id: i++, text: 'Green', users: [] },
      { id: i++, text: 'Orange', users: [] },
      { id: i++, text: 'Pink', users: [] },
      { id: i++, text: 'Purple', users: [] },
      { id: i++, text: 'Red', users: [] },
      { id: i++, text: 'Yellow', users: [] }
    ]
  },
  {
    id: i++,
    text: 'Your favourite car manufacturer?',
    ownerId: '1391212',
    answers: [
      { id: i++, text: 'Audi', users: [] },
      { id: i++, text: 'Bentley', users: [] },
      { id: i++, text: 'Bmw', users: [] },
      { id: i++, text: 'Ferrari', users: [] },
      { id: i++, text: 'Mercedes', users: [] },
      { id: i++, text: 'Porche', users: [] },
      { id: i++, text: 'Škoda', users: [] },
      { id: i++, text: 'Tesla', users: [] },
      { id: i++, text: 'Volkswagen', users: [] },
      { id: i++, text: 'Volkswagen', users: [] }
    ]
  }
];

export const getPolls = () => polls.slice(0).reverse();

export const getPoll = (id: any) => polls.find(poll => poll.id == id);

export const addPoll = (poll: any) => {
  const pollDetail = {
    ...poll,
    id: ++i,
    answers: poll.answers.map((answer: any) => ({
      ...answer,
      users: [],
      id: ++i
    }))
  };
  polls.push(pollDetail);
  return pollDetail;
};

export const votePoll = (pollId: any, answerId: any, user: any) => {
  const poll = polls.find(poll => poll.id == pollId);
  poll.answers.find(answer => answer.id == answerId).users.push(user);
  return poll;
};

export const addUser = (user: any) => users.push(user);

export const getUser = (id: string) => users.find(u => u.id == id);

export const getUsers = () => users;
