import '@/styles/globals.css';

import { Provider as StateProvider } from 'jotai';
import { SessionProvider } from 'next-auth/react';
import Head from 'next/head';
import { Toaster } from 'react-hot-toast';

import { api } from '@/utils/api';
import { MantineProvider } from '@mantine/core';

import type { Session } from 'next-auth';
import type { AppType } from 'next/app';

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <>
      <Head>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
      </Head>

      <StateProvider>
        <SessionProvider session={session}>
          <Toaster
            position="bottom-center"
          />
          <MantineProvider
            withGlobalStyles
            withNormalizeCSS
            theme={{
              colorScheme: 'dark',
              loader: 'bars'
            }}
          >
            <Component {...pageProps} />
          </MantineProvider>
        </SessionProvider>
      </StateProvider>
    </>
  );
};

export default api.withTRPC(MyApp);
