import { useAtom } from 'jotai';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState } from 'react';

import { Confetti } from '@/components/elements/confetti';
import { AuthLayout } from '@/components/layout/layout';
import { authModalOpenAtom } from '@/store/modals.atom';
import { handleErrors } from '@/utils';
import { api } from '@/utils/api';
import {
    Avatar, Box, Button, Center, Container, Loader, Paper, Stack, Text, Title
} from '@mantine/core';

import type { NextPage } from "next";
export const JoinRoomPage: NextPage = () => {
    const { push, query } = useRouter();
    const { status } = useSession();

    const token = query.token && query.token.toString()

    const [isExploding, setIsExploding] = useState(false);

    const [, setAuthModalOpen] = useAtom(authModalOpenAtom);

    const { data: inviteData, isLoading } = api.invite.get.useQuery({ token: token ?? '' }, {
        retry: 0,
        enabled: !!token,
        onError: (e) => handleErrors({ e, message: 'Failed to get invite', fn: () => push('/home') })
    });

    const { isLoading: acceptLoading, mutate } = api.invite.accept.useMutation({
        retry: 2,
        onSuccess: (data) => {
            setTimeout(() => {
                void push(`/room/${data.roomId}`)
            }, 1000);
        },
        onError: (e) => handleErrors({ e, message: 'Failed to accept invite, try again!' })
    });

    const handleAccept = () => {
        if (status !== 'unauthenticated') {
            setIsExploding(true);
            mutate({ token: token ?? '' });
        } else {
            setAuthModalOpen(true);
        }
    }

    if (isLoading || !inviteData) return <AuthLayout title="Join Room">
        <Center className='h-full'>
            <Loader />
        </Center>
    </AuthLayout>

    return <AuthLayout title="Join Room">
        <Container pt={10}>
            <Paper p={'md'} radius={'md'} shadow='md' sx={(theme) => ({ backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0] })}>
                <Stack spacing={'lg'}>
                    <Box>
                        <Text fw={'bolder'}>
                            You&apos;re invited to join
                        </Text>
                        <Title variant='gradient' gradient={{ from: 'teal.9', to: 'cyan.2' }}>
                            {inviteData.room.name}
                        </Title>
                    </Box>

                    <Stack spacing={'xs'}>
                        <Text size={'sm'}>Invited By:</Text>

                        <Box display={'flex'} className='items-center space-x-2'>
                            <Avatar size={'sm'}>
                                {!!inviteData.createdBy.image && <Image fill sizes='33vw' src={inviteData.createdBy.image} alt={`${inviteData.createdBy.name ?? 'User'}'s avatar`} />}
                            </Avatar>
                            <Text fw={'bold'}>{inviteData.createdBy.name}</Text>
                        </Box>
                    </Stack>

                    <Box>
                        <Button className={'relative overflow-visible'} variant='gradient' loading={isExploding || acceptLoading} onClick={handleAccept} gradient={{ from: 'teal.9', to: 'cyan.4' }}>
                            <Text>Accept Invite</Text>
                            {isExploding && <Confetti />}
                        </Button>
                    </Box>
                </Stack>
            </Paper>
        </Container>
    </AuthLayout>
}

export default JoinRoomPage;