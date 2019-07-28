import next from 'next';
import express from 'express';
import { createServer } from 'http';
import graphqlHTTP from 'express-graphql';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { execute, subscribe } from 'graphql';
import createSchema from './createSchema';
import createContext from './context';

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const expressServer = express();
  const wsServer = createServer(expressServer);

  const schema = createSchema();

  SubscriptionServer.create(
    {
      execute,
      subscribe,
      schema,
      onConnect(connection) {
        console.log('New connection 😇');
      }
    },
    { server: wsServer }
  );

  expressServer.use('/graphql', (req, res) =>
    graphqlHTTP({
      schema,
      context: createContext(),
      graphiql: true
    })(req, res)
  );

  expressServer.get('*', (req: any, res: any) => handle(req, res));

  wsServer.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`);
  });
});
