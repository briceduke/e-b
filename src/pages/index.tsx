import { useAtom } from 'jotai';

import { AuthLayout } from '@/components/layout/layout';
import { getServerAuthSession } from '@/server/auth';
import { authModalOpenAtom } from '@/store/modals.atom';
import { Button, Stack, Text, Title } from '@mantine/core';

import type { GetServerSideProps, NextPage } from 'next';

const Landing: NextPage = () => {
  const [, setAuthModalOpen] = useAtom(authModalOpenAtom);

  return (
    <AuthLayout title='Welcome'>
      <Stack align="flex-start" className='p-4'>
        <div>
          <Title order={4} color='dimmed'>
            Welcome to
          </Title>
          <Title>
            <Text
              component="span"
              inherit
              variant="gradient"
              gradient={{ from: 'teal.9', to: 'cyan.2' }} >Emma and Brice&apos;s</Text> Website
          </Title>
        </div>

        <Button onClick={() => setAuthModalOpen(true)}>Get Started</Button>
      </Stack>
    </AuthLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession({ req: ctx.req, res: ctx.res });

  if (session) {
    if (session.user && session.user.activeRoomId) {
      return {
        redirect: {
          destination: `/room/${session.user.activeRoomId}`,
          permanent: false
        },
        props: {}
      }
    } else {
      return {
        redirect: {
          destination: `/home`,
          permanent: false
        },
        props: {}
      }
    }
  } else {
    return {
      props: {}
    }
  }
}

export default Landing;