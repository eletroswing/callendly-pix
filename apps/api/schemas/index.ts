import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from "graphql";
import {
  fromGlobalId,
  globalIdField,
  nodeDefinitions,
  mutationWithClientMutationId,
} from "graphql-relay";

import resolvers from "../resolvers";
import User from "../models/user";

const { nodeInterface, nodeField } = nodeDefinitions<any>(
  (globalId) => {
    const { type, id } = fromGlobalId(globalId);
    if (type === "User") {
      return resolvers.user.getUserById(id);
    }

    console.log(type)
    return null;
  },
  (obj) => {
    return new Promise((resolve, reject) => {
      if (obj instanceof User) {
        return resolve("UserType");
      }

      return resolve(undefined);
    });
  }
);

const UserType = new GraphQLObjectType({
  name: "User",
  fields: {
    id: globalIdField('User'),
    name: { type: GraphQLString },
    email: { type: GraphQLString },
  },
  interfaces: [nodeInterface],
});

const QueryType = new GraphQLObjectType({
  name: "Query",
  fields: {
    node: nodeField,
    me: {
      type: UserType,
      resolve: (root, args, context) => {
        if (!context.user) {
          throw new Error('Usuário não encontrado');
        }
        return context.user;
      },
    }
  },
});

const SignupMutation = mutationWithClientMutationId({
  name: "Signup",
  inputFields: {
    email: { type: GraphQLString },
    name: { type: GraphQLString },
    password: { type: GraphQLString },
  },
  outputFields: {
    user: {
      type: UserType,
      resolve: ({ user }: any) => user,
    },
    token: {
      type: GraphQLString,
      resolve: ({ token }) => token,
    },
    refreshToken: {
      type: GraphQLString,
      resolve: ({ refreshToken }) => refreshToken,
    },
  },
  mutateAndGetPayload: async ({ email, name, password}) => {
    const { user, token, refreshToken } = await resolvers.user.createUser(email, name, password);
    return { user, token, refreshToken };
  },
});

const LoginMutation = mutationWithClientMutationId({
  name: "Login",
  inputFields: {
    email: { type: GraphQLString },
    password: { type: GraphQLString },
  },
  outputFields: {
    user: {
      type: UserType,
      resolve: ({ user }: any) => user,
    },
    token: {
      type: GraphQLString,
      resolve: ({ token }) => token,
    },
    refreshToken: {
      type: GraphQLString,
      resolve: ({ refreshToken }) => refreshToken,
    },
  },
  mutateAndGetPayload: async ({ email, password }) => {
    const { user, token, refreshToken } = await resolvers.user.loginUser(email, password);
    return { user, token, refreshToken };
  },
});

const RefreshTokenMutation = mutationWithClientMutationId({
  name: "RefreshToken",
  inputFields: {
    token: { type: GraphQLString },
  },
  outputFields: {
    token: { type: GraphQLString },
    refreshToken: { type: GraphQLString },
  },
  mutateAndGetPayload: async ({ token }) => {
    const newToken = await resolvers.token.refreshToken(token);
    return newToken
  },
});

const MutationType = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    signup: SignupMutation,
    login: LoginMutation,
    refreshToken: RefreshTokenMutation,
  },
});
  
const schema = new GraphQLSchema({
  query: QueryType,
  mutation: MutationType,
});

export default schema;
