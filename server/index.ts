import next from 'next';
import { createServer } from 'http';
import express from 'express';
import graphqlHTTP from 'express-graphql';
import { execute, subscribe } from 'graphql';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import createExecutableSchema from './createExecutableSchema';
import setupAuth from './setupAuth';
import * as repository from './repository';

const schema = createExecutableSchema();
const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

console.log('Booting...');
app.prepare().then(() => {
  console.log('Initializing...');
  const expressServer = express();
  const wsServer = createServer(expressServer);

  expressServer.use(cookieParser());
  expressServer.use(
    session({
      secret: 'keyboard cat...',
      resave: false // prevents race conditions
    })
  );
  setupAuth(expressServer);

  expressServer.use('/graphql', cors(), (req, res) => {
    if (req.headers.jwt) {
      req.user = repository.getUser(req.headers.jwt);
    }

    graphqlHTTP({
      schema,
      graphiql: true,
      context: { req, res, user: req.user }
    })(req, res);
  });

  expressServer.get('*', (req: any, res: any) => handle(req, res));

  SubscriptionServer.create(
    {
      execute,
      schema,
      subscribe,
      onConnect: connectionParams => {
        return { user: repository.getUser(connectionParams.jwt) };
      }
    },
    {
      server: wsServer
    }
  );

  wsServer.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`);
  });
});
