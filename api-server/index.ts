import express from 'express';
import cors from 'cors';
import { z } from 'zod';
import { initTRPC } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';

export const t = initTRPC.create();

export interface IChatMessage {
  user: string;
  message: string;
}

const messages: IChatMessage[] = [
  { user: 'Fred', message: 'Hello' },
  { user: 'Peter', message: 'Hi bro' },
  { user: 'Liza', message: 'Good evening' },
];

export const appRouter = t.router({
  getUser: t.procedure
    .input(z.string())
    // .name(z.string())
    .query((req) => {
      // req.input; // string
      return { id: req.input, name: 'user' };
    }),
  hello: t.procedure.input(z.string()).query((req) => {
    return { name: req.input, message: 'Hello again ' + req.input };
  }),
  getMessages: t.procedure.input(z.number().default(100)).query((req) => {
    return req.input === 100 ? messages : messages.slice(-req.input);
  }),
  addMessage: t.procedure
    .input(
      z.object({
        user: z.string(),
        message: z.string(),
      })
    )
    .mutation((req) => {
      messages.push(req.input);
      return messages[messages.length - 1];
    }),
});

// export type definition of API

export type AppRouter = typeof appRouter;

const createContext = ({ req, res }: trpcExpress.CreateExpressContextOptions) => {
  const getUser = () => {
    if (req.headers.authorization !== 'secret') {
      return null;
    }
    return {
      name: 'alex',
    };
  };

  return {
    req,
    res,
    user: getUser(),
  };
};

const app = express();
app.use(cors());
app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);
app.get('/', (_req, res) => res.send('Server is running!'));
app.listen(4002);

// import { createExpressMiddleware } from '@trpc/server/adapters/express';
// import express from 'express';
// import { appRouter } from './router';

// const PORT = 4001;

// async function main() {
//   // express implementation
//   const app = express();

//   // For testing purposes, wait-on requests '/'
//   app.get('/', (_req, res) => res.send('Server is running!'));

//   app.use(
//     '/trpc',
//     createExpressMiddleware({
//       router: appRouter,
//       createContext: () => ({}),
//     })
//   );
//   app.listen(PORT);
// }

// main();

// import { TRPCError, inferAsyncReturnType, initTRPC } from '@trpc/server';
// import * as trpcExpress from '@trpc/server/adapters/express';
// import { EventEmitter } from 'events';
// import express from 'express';
// import { z } from 'zod';

// const createContext = ({
//   req,
//   res,
// }: trpcExpress.CreateExpressContextOptions) => {
//   const getUser = () => {
//     if (req.headers.authorization !== 'secret') {
//       return null;
//     }
//     return {
//       name: 'alex',
//     };
//   };

//   return {
//     req,
//     res,
//     user: getUser(),
//   };
// };
// type Context = inferAsyncReturnType<typeof createContext>;

// const t = initTRPC.context<Context>().create();

// const router = t.router;
// const publicProcedure = t.procedure;

// // --------- create procedures etc

// let id = 0;

// const ee = new EventEmitter();
// const db = {
//   posts: [
//     {
//       id: ++id,
//       title: 'hello',
//     },
//   ],
//   messages: [createMessage('initial message')],
// };
// function createMessage(text: string) {
//   const msg = {
//     id: ++id,
//     text,
//     createdAt: Date.now(),
//     updatedAt: Date.now(),
//   };
//   ee.emit('newMessage', msg);
//   return msg;
// }

// const postRouter = router({
//   createPost: t.procedure
//     .input(z.object({ title: z.string() }))
//     .mutation(({ input }) => {
//       const post = {
//         id: ++id,
//         ...input,
//       };
//       db.posts.push(post);
//       return post;
//     }),
//   listPosts: publicProcedure.query(() => db.posts),
// });

// const messageRouter = router({
//   addMessage: publicProcedure.input(z.string()).mutation(({ input }) => {
//     const msg = createMessage(input);
//     db.messages.push(msg);

//     return msg;
//   }),
//   listMessages: publicProcedure.query(() => db.messages),
// });

// // root router to call
// const appRouter = router({
//   // merge predefined routers
//   post: postRouter,
//   message: messageRouter,
//   // or individual procedures
//   hello: publicProcedure.input(z.string().nullish()).query(({ input, ctx }) => {
//     return `hello ${input ?? ctx.user?.name ?? 'world'}`;
//   }),
//   // or inline a router
//   admin: router({
//     secret: publicProcedure.query(({ ctx }) => {
//       if (!ctx.user) {
//         throw new TRPCError({ code: 'UNAUTHORIZED' });
//       }
//       if (ctx.user?.name !== 'alex') {
//         throw new TRPCError({ code: 'FORBIDDEN' });
//       }
//       return {
//         secret: 'sauce',
//       };
//     }),
//   }),
// });

// export type AppRouter = typeof appRouter;

// async function main() {
//   // express implementation
//   const app = express();

//   app.use((req, _res, next) => {
//     // request logger
//     console.log('⬅️ ', req.method, req.path, req.body ?? req.query);

//     next();
//   });

//   app.use(
//     '/trpc',
//     trpcExpress.createExpressMiddleware({
//       router: appRouter,
//       createContext,
//     }),
//   );
//   app.get('/', (_req, res) => res.send('hello'));
//   app.listen(4001, () => {
//     console.log('listening on port 4001');
//   });
// }

// main();
