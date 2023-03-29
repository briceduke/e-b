import type { GetServerSideProps, NextPage } from 'next';

import { useSession } from 'next-auth/react';

import { AuthLayout } from '@/components/layout/layout';
import { getServerAuthSession } from '@/server/auth';
import { Loader } from '@mantine/core';

export const HomePage: NextPage = () => {
    const { data, status } = useSession();

    const loading = !data || status !== 'authenticated';

    if (loading) return <AuthLayout title='Home'>
        <div className='flex h-full items-center justify-center'>
            <Loader />
        </div>
    </AuthLayout>

    return <AuthLayout title={data.user.name ?? 'Home'}>
        <p>Welcome Back, {data.user.name}</p>
    </AuthLayout>
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
                props: {}
            }
        }
    } else {
        return {
            redirect: {
                destination: `/`,
                permanent: false
            },
            props: {}
        }
    }
}

export default HomePage;