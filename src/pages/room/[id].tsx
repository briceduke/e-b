import type { NextPage } from 'next';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';

import { AuthLayout } from '@/components/layout/layout';
import { handleErrors } from '@/utils';
import { api } from '@/utils/api';
import { Button, Skeleton, Title } from '@mantine/core';

export const RoomPage: NextPage = () => {
    const { data, status } = useSession();
    const { push, query } = useRouter();
    const ctx = api.useContext();

    const id = query.id && query.id.toString()

    const { data: roomData, isLoading } = api.room.get.useQuery({ id: id ?? '' }, {
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
        if (!!id) void deleteRoom({ id });
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

export default RoomPage;