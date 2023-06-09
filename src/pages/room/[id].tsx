import type { NextPage } from 'next';

import { useAtom } from 'jotai';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { BiDotsVertical, BiExit, BiPlus, BiTrash, BiUserPlus } from 'react-icons/bi';

import { HangoutSection } from '@/components/elements';
import { AuthLayout } from '@/components/layout/layout';
import { CreateHangoutModal } from '@/components/modals/create-hangout.modal';
import { DeleteRoomModal } from '@/components/modals/delete-room.modal';
import { InviteUserModal } from '@/components/modals/invite-user.modal';
import { LeaveRoomModal } from '@/components/modals/leave-room.modal';
import {
    createHangoutModalAtom, deleteRoomModalAtom, inviteUserModalAtom, leaveRoomModalAtom
} from '@/store/modals.atom';
import { handleErrors } from '@/utils';
import { api } from '@/utils/api';
import {
    ActionIcon, Avatar, Box, Center, Container, Menu, Paper, Skeleton, Stack, Text, Title, Tooltip
} from '@mantine/core';

export const RoomPage: NextPage = () => {
    const { data, status } = useSession();
    const { push, query } = useRouter();

    const [, setDeleteRoomModalOpen] = useAtom(deleteRoomModalAtom);
    const [, setInviteUserModalOpen] = useAtom(inviteUserModalAtom);
    const [, setLeaveRoomModalOpen] = useAtom(leaveRoomModalAtom);
    const [, setCreateHangoutModalOpen] = useAtom(createHangoutModalAtom);

    const id = query.id && query.id.toString()

    const { data: roomData, isLoading } = api.room.get.useQuery({ id: id ?? '' }, {
        retry: 0,
        enabled: !!id && status === 'authenticated',
        onError: (e) => handleErrors({ e, message: 'Failed to get room', fn: () => push('/home') })
    });

    const { data: hangoutListData } = api.hangout.getRoomHangoutLists.useQuery({ id: id ?? '' }, {
        retry: 0,
        enabled: !!id && status === 'authenticated',
        onError: (e) => handleErrors({ e, message: 'Failed to load hangout idea lists' }),
    })

    const handleDeleteRoom = () => {
        setDeleteRoomModalOpen(true);
    };

    const handleLeaveRoom = () => {
        setLeaveRoomModalOpen(true);
    }

    const userHasVoted = hangoutListData && hangoutListData[0] && !!hangoutListData[0].voted.find(u => u.id === data?.user.id);
    const votingHasEnded = hangoutListData && hangoutListData[0] && roomData && hangoutListData[0].votesCount === roomData.users.length;

    return (
        <AuthLayout title={roomData?.name ?? 'Room'}>
            <DeleteRoomModal id={id} name={roomData?.name} />
            <InviteUserModal id={id} name={roomData?.name} />
            <LeaveRoomModal id={id} name={roomData?.name} />
            <CreateHangoutModal roomId={id ?? ''} />
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
                                            <Menu.Item onClick={handleLeaveRoom} icon={<BiExit />} color={'red'}>
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
                        <Paper py={'xl'} radius={'md'} px="md" sx={(theme) => ({ backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0] })}>
                            <Stack align='flex-start' w={'100%'}>
                                <Box w={'100%'} className='flex justify-between'>
                                    <Stack spacing={'xs'}>
                                        <Title order={2}>Hangout Ideas</Title>
                                        {votingHasEnded && <Text>The people have spoken! Here are the results.</Text>}
                                        {userHasVoted && <Text>Your vote is in! Here is the current lineup.</Text>}
                                        {!userHasVoted && !votingHasEnded && <Text>Rank the ideas! Top is your fav, bottom is your least fav.</Text>}
                                    </Stack>

                                    <ActionIcon size={'lg'} onClick={() => setCreateHangoutModalOpen(true)}>
                                        <BiPlus />
                                    </ActionIcon>
                                </Box>
                                <Box w={'100%'}>
                                    <HangoutSection data={hangoutListData} />
                                </Box>
                            </Stack>
                        </Paper>
                    </Stack>
                </Container>
            </Center>
        </AuthLayout>
    )
}

export default RoomPage;