import React, { useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { httpBatchLink } from '@trpc/client';
import { QueryClient, QueryClientProvider } from 'react-query';

import { trpc } from './trpc';

import './index.scss';
import { IChatMessage } from 'api-server';

const queryClient = new QueryClient();

const AppContent = () => {
  const [inputVal, setInputVal] = useState('');
  const [user, setUser] = useState('');

  const messages = trpc.useQuery(['getMessages']);
  const addMessage = trpc.useMutation(['addMessage', 3]);

  // if (!hello.data) return <div>Loading...</div>;

  const onAddMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addMessage.mutate(
      {
        user,
        message: inputVal,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries(['getMessages']);
        },
      }
    );
    setInputVal('');
  };

  return (
    <div className="mt-10 text-3xl mx-auto max-w-6xl">
      <form onSubmit={(e) => onAddMessage(e)}>
        <input
          type="text"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          style={{ border: '1px solid pink', marginRight: '1rem', borderRadius: '0.5rem', width: '200px' }}
        />
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          style={{ border: '1px solid navy', marginRight: '1rem', borderRadius: '0.5rem' }}
        />
        <button type="submit" className="p-3 border-3 bg-green-300 text-color-100 rounded-lg">
          Add message
        </button>
      </form>
      {/* <div>Data: {JSON.stringify(hello.data)}</div> */}
      <h2>Messages:</h2>
      <div>
        {(messages.data ?? []).map((item: IChatMessage) => (
          <div key={item.message}>
            <p className="p-2 border-1 bg-gray-300 rounded-lg">
              {item.user}: <span className="p-2 border-1 bg-gray-100 rounded-lg">{item.message}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

const App = () => {
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: 'http://localhost:4002/trpc',
        }),
      ],
    })
  );
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </trpc.Provider>
  );
};

ReactDOM.render(<App />, document.getElementById('app'));
