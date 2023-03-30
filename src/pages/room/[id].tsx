import type { NextPage } from 'next';

import { useAtom } from 'jotai';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { BiDotsVertical, BiExit, BiTrash, BiUserPlus } from 'react-icons/bi';

import { AuthLayout } from '@/components/layout/layout';
import { DeleteRoomModal } from '@/components/modals/delete-room.modal';
import { deleteRoomModalAtom } from '@/store/modals.atom';
import { handleErrors } from '@/utils';
import { api } from '@/utils/api';
import { ActionIcon, Center, Menu, Paper, Skeleton, Stack, Text, Title } from '@mantine/core';

export const RoomPage: NextPage = () => {
    const { data, status } = useSession();
    const { push, query } = useRouter();

    const [, setDeleteRoomModalOpen] = useAtom(deleteRoomModalAtom);

    const id = query.id && query.id.toString()

    const { data: roomData, isLoading } = api.room.get.useQuery({ id: id ?? '' }, {
        retry: 0,
        enabled: !!id && status === 'authenticated',
        onError: (e) => handleErrors({ e, message: 'Failed to get room', fn: () => push('/home') })
    });

    const handleDeleteRoom = () => {
        setDeleteRoomModalOpen(true);
    };

    return (
        <AuthLayout title={roomData?.name ?? 'Room'}>
            <DeleteRoomModal id={id} name={roomData?.name} />
            <Center>
                <Stack w={1000}>
                    <Stack mt={10} spacing={'xs'}>
                        <Paper className='w-full rounded-t-2xl shadow-inner' py={'xl'} px="md" sx={(theme) => ({ backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0] })}>
                            <div className='flex w-full items-center justify-between h-14 md:space-x-10 p-0'>
                                <Skeleton className='h-full' visible={isLoading} animate>
                                    <Title>{roomData?.name}</Title>
                                </Skeleton>

                                <Menu shadow={'md'} width={200} position="bottom-end">
                                    <Menu.Target>
                                        <ActionIcon className='relative' size={'lg'}>
                                            <BiDotsVertical />
                                        </ActionIcon>
                                    </Menu.Target>

                                    <Menu.Dropdown>
                                        <Menu.Item disabled icon={<BiUserPlus />}>
                                            Invite Users
                                        </Menu.Item>
                                        {roomData?.ownerId === data?.user.id ?
                                            <Menu.Item onClick={handleDeleteRoom} icon={<BiTrash />} color={'red'}>
                                                Delete Room
                                            </Menu.Item>
                                            :
                                            <Menu.Item disabled icon={<BiExit />} color={'red'}>
                                                Leave Room
                                            </Menu.Item>
                                        }
                                    </Menu.Dropdown>
                                </Menu>
                            </div>

                            <div className='flex w-full items-center justify-between md:space-x-10 p-0'>
                                <Text>
                                    Created On:{' '}
                                    <Text component='span' fw={'bold'}>
                                        {new Intl.DateTimeFormat('en-us', {
                                            dateStyle: 'long'
                                        }).format(roomData?.createdAt)}
                                    </Text>
                                </Text>
                            </div>
                        </Paper>
                    </Stack>
                </Stack>
            </Center>
        </AuthLayout >
    )
}

export default RoomPage;