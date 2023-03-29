import { useAtom } from 'jotai';
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { BiLogOut, BiPlus } from 'react-icons/bi';

import { authModalOpenAtom } from '@/store/modals.atom';
import { handleErrors } from '@/utils';
import { api } from '@/utils/api';
import { ActionIcon, Avatar, Button, Header, Menu, Text, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import { AuthModal } from '../modals/auth.modal';
import { CreateRoomModal } from '../modals/create-room.modal';

export const TopNav = () => {
    const [, setAuthModalOpen] = useAtom(authModalOpenAtom);
    const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] = useDisclosure(false);

    const { query } = useRouter();
    const { data, status } = useSession();

    const { data: roomData } = api.room.getUserRooms.useQuery(void {}, {
        enabled: status === 'authenticated',
        retry: 0,
        onError: (e) => handleErrors({ e, message: 'Failed to fetch rooms' })
    });

    const userHasImage = data && data.user && data.user.image;
    const activeRoomId = data && data.user && data.user.activeRoomId;
    const queryId = query.id?.toString();

    const handleSignOut = () => {
        void signOut({ callbackUrl: 'http://localhost:3000/' });
    }

    return (
        <Header height={70} p="md">
            <AuthModal />
            <CreateRoomModal closeCreateModal={closeCreateModal} createModalOpened={createModalOpened} />

            <div className='flex w-full h-full items-center justify-between gap-x-4'>

                <Link href={!!activeRoomId ? `/room/${activeRoomId}` : '/'}>
                    <Title order={1}>
                        EB
                    </Title>
                </Link>


                {status !== 'unauthenticated' && data && (
                    <Menu shadow="md" width={200} position='bottom-end'>
                        <Menu.Target>
                            <Avatar radius={'md'} className="cursor-pointer relative">
                                {!!userHasImage && <Image fill sizes='33vw' src={userHasImage} alt={`${data.user.name ?? 'User'}'s avatar`} />}
                            </Avatar>
                        </Menu.Target>
                        <Menu.Dropdown>
                            <Menu.Label className='flex gap-x-2 items-center'>
                                Rooms
                                <ActionIcon variant={'light'} size={'xs'} onClick={openCreateModal}>
                                    <BiPlus />
                                </ActionIcon>
                            </Menu.Label>
                            {roomData && roomData.length === 0 ?
                                <Menu.Item disabled>
                                    It&apos;s so empty here!
                                </Menu.Item>
                                :
                                roomData && roomData.map(room => (
                                    <Link className={room.id === queryId ? 'cursor-default' : 'cursor-pointer'} key={room.id} href={`/room/${room.id}`}>
                                        <Menu.Item disabled={room.id === queryId}>
                                            <Text>
                                                {room.name}
                                            </Text>
                                        </Menu.Item>
                                    </Link>
                                ))
                            }

                            <Menu.Label>
                                Account
                            </Menu.Label>
                            <Menu.Item icon={<BiLogOut size={14} />} onClick={handleSignOut}>Sign Out</Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                )}
                {status === 'unauthenticated' && <Button variant="light" onClick={() => setAuthModalOpen(true)}>Sign In</Button>}
            </div>
        </Header>
    )
}