import { makeExecutableSchema } from 'graphql-tools';
import resolvers from './resolvers';
import fs from 'fs';
import path from 'path';

const typeDefs = fs.readFileSync(
  path.join(__dirname, '..', 'schema.graphql'),
  'utf8'
);

export default function createSchema() {
  return makeExecutableSchema({ typeDefs, resolvers });
}
