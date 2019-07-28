import React from 'react';
import App, { Container } from 'next/app';
import { ApolloProvider } from 'react-apollo';
import ApolloClient from 'apollo-client';
import { InMemoryCache, NormalizedCacheObject } from 'apollo-cache-inmemory';
import { createHttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import fetch from 'isomorphic-fetch';
import { split } from 'apollo-link';
import { getMainDefinition } from 'apollo-utilities';

const getFetch = jwt => (url: string, opts: any = {}) =>
  fetch(url, {
    ...opts,
    headers: { ...opts.headers, jwt },
    credentials: 'same-origin'
  });

const isServer = typeof window === 'undefined';
// const baseUrl = isServer ? process.env.BASE_URL : window.location.host;
const baseUrl = 'graphql-workshop-2019.herokuapp.com';

const getHttpLink = (jwt?: string) =>
  createHttpLink({ uri: `http://${baseUrl}/graphql`, fetch: getFetch(jwt) });

const getWSLink = (jwt?: string) => {
  const subscriptionClient = new SubscriptionClient(`ws://${baseUrl}`, {
    reconnect: true,
    connectionParams: { jwt }
  });
  return new WebSocketLink(subscriptionClient);
};

const getClientLink = (jwt?: string) =>
  split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      );
    },
    getWSLink(jwt),
    getHttpLink(jwt)
  );

const initApollo = (initialState?: any, jwt?: string) =>
  new ApolloClient({
    cache: new InMemoryCache().restore(initialState),
    link: isServer ? getHttpLink(jwt) : getClientLink(jwt)
  });

export const ApolloClientCopy = React.createContext<
  ApolloClient<NormalizedCacheObject>
>(null);

export default class MyApp extends App {
  static async getInitialProps({ Component, ctx }) {
    let pageProps = {};
    let apolloState = {};
    const jwt = ctx.req && ctx.req.user ? ctx.req.user.id : null;

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }

    if (Component.query && isServer) {
      const client = initApollo(undefined, jwt);
      await client.query(Component.query(ctx));
      apolloState = client.extract();
    }

    return { pageProps, apolloState, jwt };
  }

  apolloClient: ApolloClient<NormalizedCacheObject>;

  constructor(props: any) {
    super(props);
    this.apolloClient = initApollo(props.apolloState, props.jwt);
  }

  render() {
    const { Component, pageProps } = this.props;

    return (
      <Container>
        <ApolloClientCopy.Provider value={this.apolloClient}>
          <ApolloProvider client={this.apolloClient}>
            <Component {...pageProps} />
          </ApolloProvider>
        </ApolloClientCopy.Provider>
      </Container>
    );
  }
}
