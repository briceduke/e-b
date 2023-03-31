import { useAtom } from 'jotai';
import { BiCheck, BiCopy, BiLink, BiUserPlus } from 'react-icons/bi';

import { inviteUserModalAtom } from '@/store/modals.atom';
import { handleErrors } from '@/utils';
import { api } from '@/utils/api';
import {
    ActionIcon, Box, Button, CopyButton, Loader, Modal, Stack, Text, TextInput, ThemeIcon, Title,
    Tooltip
} from '@mantine/core';

const ModalTitle = () => {
    return <Box display={'flex'} className='items-center space-x-4'>
        <ThemeIcon variant='light'>
            <BiLink />
        </ThemeIcon>
        <Title order={3}>Invite Users</Title>
    </Box>
}

export const InviteUserModal = ({ id, name }: { id?: string; name?: string; }) => {
    const [inviteUserModalOpen, setInviteUserModalOpen] = useAtom(inviteUserModalAtom);

    const { mutate: inviteUser, isLoading: inviteCreateLoading, data: inviteCreateData, reset } = api.invite.create.useMutation({
        retry: 2,
        onError: (e) => handleErrors({ e, message: 'Failed to create invite' }),
    });

    if (!name || !id) return <Modal size={'lg'} title={<ModalTitle />} opened={inviteUserModalOpen} onClose={() => setInviteUserModalOpen(false)} centered>
        <Box className='flex items-center justify-center' h={120}>
            <Loader />
        </Box>
    </Modal>

    return <Modal title={<ModalTitle />}
        size={'lg'}
        opened={inviteUserModalOpen}
        onClose={() => {
            setInviteUserModalOpen(false);
            setTimeout(() => {
                reset();
            }, 300)
        }}
        centered

    >
        <Box className='space-y-4'>
            <Text>Generate an invite link below and send it to your friend!</Text>
            {
                inviteCreateData ?
                    <Stack>
                        <TextInput maw={450} sx={(theme) => ({ backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0] })}
                            rightSection={
                                <CopyButton value={`${process.env.NEXTAUTH_URL ?? 'https://emma.briceduke.dev'}/join/${inviteCreateData.id}`} timeout={2000}>
                                    {({ copied, copy }) => (
                                        <Tooltip label={copied ? 'Copied' : 'Copy'} withArrow position='right'>
                                            <ActionIcon color={copied ? 'teal' : 'gray'} onClick={copy}>
                                                {copied ? <BiCheck /> : <BiCopy />}
                                            </ActionIcon>
                                        </Tooltip>
                                    )}
                                </CopyButton>
                            }
                            value={`${process.env.NEXTAUTH_URL ?? 'https://emma.briceduke.dev'}/join/${inviteCreateData.id}`}
                            readOnly
                        />

                        <Text size={'xs'}>This link will expire on <Text component='span' fw={'bold'}>{Intl.DateTimeFormat('en-us', { dateStyle: 'medium' }).format(inviteCreateData.expires)}</Text></Text>
                    </Stack>
                    : <Button onClick={() => inviteUser({ roomId: id })} loading={inviteCreateLoading} leftIcon={<BiUserPlus />}>Generate Invite Link</Button>
            }
        </Box>
    </Modal>
}