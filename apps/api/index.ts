import "dotenv/config";
import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import {graphqlHTTP} from 'koa-graphql';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import schema from "./schemas";
import connectDB from "./infra/database";
import auth from "./middlewares/auth";
import koaWebsocket from 'koa-websocket';

const app = koaWebsocket(new Koa());
const router = new Router();

connectDB();

app.use(bodyParser());
app.use(auth.authenticate);

// Rotas HTTP
router.all('/graphql', graphqlHTTP((req: any, res: any, ctx: any) => ({
  schema: schema,
  graphiql: {
    subscriptionEndpoint: `ws://localhost:4000/subscriptions`,
  },
  context: { user: ctx.user }
})));

app.use(router.routes()).use(router.allowedMethods());

// Rotas WebSocket
app.ws.use((ctx) => {
  const wsServer = new WebSocketServer({
    server: ctx.req.socket.server,
    path: '/subscriptions',
  });

  useServer({ schema }, wsServer);
});

const port = 4000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
