import type { NextPage } from 'next';

import { useAtom } from 'jotai';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { BiDotsVertical, BiExit, BiTrash, BiUserPlus } from 'react-icons/bi';

import { AuthLayout } from '@/components/layout/layout';
import { DeleteRoomModal } from '@/components/modals/delete-room.modal';
import { InviteUserModal } from '@/components/modals/invite-user.modal';
import { deleteRoomModalAtom, inviteUserModalAtom } from '@/store/modals.atom';
import { handleErrors } from '@/utils';
import { api } from '@/utils/api';
import {
    ActionIcon, Avatar, Center, Container, Menu, Paper, Skeleton, Stack, Text, Title, Tooltip
} from '@mantine/core';

export const RoomPage: NextPage = () => {
    const { data, status } = useSession();
    const { push, query } = useRouter();

    const [, setDeleteRoomModalOpen] = useAtom(deleteRoomModalAtom);
    const [, setInviteUserModalOpen] = useAtom(inviteUserModalAtom);

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
            <InviteUserModal id={id} name={roomData?.name} />
            <Center>
                <Container w={1000}>
                    <Stack mt={10}>
                        <Paper radius={'md'} py={'xl'} px="md" sx={(theme) => ({ backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0] })}>
                            <div className='flex w-full items-center justify-between h-14 md:space-x-10 p-0'>
                                <Tooltip.Group openDelay={300} closeDelay={100}>
                                    <Skeleton visible={isLoading} w={108}>
                                        <Avatar.Group>
                                            {roomData && roomData.users && roomData.users.slice(0, 3).map(u => (
                                                <Tooltip key={u.id} label={u.name ?? 'User'} withArrow>
                                                    <Avatar>
                                                        {!!u.image && <Image fill sizes='33vw' src={u.image} alt={`${u.name ?? 'User'}'s avatar`} />}
                                                    </Avatar>
                                                </Tooltip>
                                            ))}

                                            {roomData && roomData.users && roomData.users.length > 3 &&
                                                <Tooltip
                                                    withArrow
                                                    label={
                                                        <>
                                                            {roomData.users.slice(3).map(u => <div key={u.id}>{u.name}</div>)}
                                                        </>
                                                    }
                                                >
                                                    <Avatar radius={'md'}>+{roomData.users.length - 3}</Avatar>
                                                </Tooltip>
                                            }

                                            {!roomData && <Avatar />}
                                        </Avatar.Group>
                                    </Skeleton>
                                </Tooltip.Group>

                                <Menu shadow={'md'} width={200} position="bottom-end">
                                    <Menu.Target>
                                        <ActionIcon className='relative' size={'lg'}>
                                            <BiDotsVertical />
                                        </ActionIcon>
                                    </Menu.Target>

                                    <Menu.Dropdown>
                                        <Menu.Item icon={<BiUserPlus />} onClick={() => setInviteUserModalOpen(true)}>
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

                            <Skeleton visible={isLoading} animate>
                                <Title truncate>{roomData?.name ?? '-'}</Title>
                            </Skeleton>

                            <div className='flex w-full items-center justify-between md:space-x-10 p-0 mt-[9px]'>
                                <Skeleton visible={isLoading} animate w={220}>
                                    <Text>
                                        Created On:{' '}
                                        <Text component='span' fw={'bold'}>
                                            {new Intl.DateTimeFormat('en-us', {
                                                dateStyle: 'long'
                                            }).format(roomData?.createdAt)}
                                        </Text>
                                    </Text>
                                </Skeleton>
                            </div>
                        </Paper>
                        {/* <ScrollArea>
                            <Paper py={'xl'} px="md" sx={(theme) => ({ backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0] })}>
                            </Paper>
                        </ScrollArea> */}
                    </Stack>
                </Container>
            </Center>
        </AuthLayout >
    )
}

export default RoomPage;