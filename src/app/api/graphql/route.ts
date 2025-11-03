import { graphql, buildSchema } from 'graphql';

// Basic GraphQL schema
const schema = buildSchema(`
  type Query {
    hello: String
    user(id: ID!): User
    features: [Feature!]!
  }

  type User {
    id: ID!
    name: String
    email: String
  }

  type Feature {
    name: String!
    enabled: Boolean!
    description: String
  }

  type Mutation {
    updateFeature(name: String!, enabled: Boolean!): Feature
  }
`);

// Mock data
const mockUsers = [
  { id: '1', name: 'John Doe', email: 'john@example.com' },
];

const mockFeatures = [
  { name: 'enableGraphQL', enabled: true, description: 'GraphQL API support' },
  { name: 'enableNewUI', enabled: false, description: 'New UI components' },
];

// Resolvers
const root = {
  hello: () => 'Hello from GraphQL API!',
  user: ({ id }: { id: string }) => mockUsers.find(user => user.id === id),
  features: () => mockFeatures,
  updateFeature: ({ name, enabled }: { name: string; enabled: boolean }) => {
    const feature = mockFeatures.find(f => f.name === name);
    if (feature) {
      feature.enabled = enabled;
      return feature;
    }
    return null;
  },
};

export async function POST(request: Request) {
  try {
    const { query, variables } = await request.json();

    const result = await graphql({
      schema,
      source: query,
      rootValue: root,
      variableValues: variables,
    });

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 400 });
  }
}

export async function GET() {
  return Response.json({
    message: 'GraphQL API is running. Use POST to send queries.',
    playground: '/api/graphql/playground', // Could add GraphQL playground
  });
}
