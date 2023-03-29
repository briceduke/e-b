import type { GetStaticProps, NextPage } from 'next';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';

import { AuthLayout } from '@/components/layout/layout';
import { generateSSGHelper } from '@/server/utils/ssg.util';
import { handleErrors } from '@/utils';
import { api } from '@/utils/api';
import { Button, Skeleton, Title } from '@mantine/core';

export const RoomPage: NextPage<{ id: string }> = ({ id }) => {
    const { data, status } = useSession();
    const { push } = useRouter();
    const ctx = api.useContext();

    const { data: roomData, isLoading } = api.room.get.useQuery({ id }, {
        retry: 0,
        enabled: !!id && status === 'authenticated',
        onError: (e) => handleErrors({ e, message: 'Failed to get room', fn: () => push('/home') })
    });

    const { mutate: deleteRoom, isLoading: deleteLoading } = api.room.delete.useMutation({
        retry: 2,
        onSuccess: () => {
            void ctx.room.getUserRooms.invalidate();

            toast.success('Room deleted successfully');

            void push('/home');
        },
        onError: (e) => handleErrors({ e, message: 'Failed to delete room' })
    });

    const handleDeleteRoom = () => {
        void deleteRoom({ id });
    };

    return (
        <AuthLayout title={roomData?.name ?? 'Room'}>
            <div className='flex w-full justify-center'>
                <Skeleton visible={isLoading} className='flex justify-center'>
                    <Title>{roomData?.name}</Title>
                </Skeleton>

                {roomData && roomData.ownerId === data?.user.id &&
                    <Button loading={deleteLoading} color="red" onClick={handleDeleteRoom}>Delete Room</Button>
                }
            </div>
        </AuthLayout>
    )
}
export const getStaticProps: GetStaticProps = async (context) => {
    const ssg = generateSSGHelper();

    const id = context.params?.id;

    if (typeof id !== "string") {
        return { notFound: true };
    }

    await ssg.room.get.prefetch({ id }, {});

    return {
        props: {
            trpcState: ssg.dehydrate(),
            id,
        },
    };
};

export const getStaticPaths = () => {
    return { paths: [], fallback: "blocking" };
};

export default RoomPage;