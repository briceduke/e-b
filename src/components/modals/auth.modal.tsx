import { useAtom } from 'jotai';
import { signIn } from 'next-auth/react';
import { BiLogIn } from 'react-icons/bi';
import { FcGoogle } from 'react-icons/fc';

import { authModalOpenAtom } from '@/store/modals.atom';
import { Box, Button, Modal, Text, ThemeIcon, Title } from '@mantine/core';

const ModalTitle = () => {
    return <Box display={'flex'} className='items-center space-x-4'>
        <ThemeIcon variant='light'>
            <BiLogIn />
        </ThemeIcon>
        <Title order={3}>Sign In</Title>
    </Box>
}

export const AuthModal = () => {
    const [authModalOpen, setAuthModalOpen] = useAtom(authModalOpenAtom);

    const handleSignIn = () => {
        void signIn('google');
    }

    return <Modal
        opened={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        centered
        radius={'md'}
        title={<ModalTitle />}
    >
        <div className='space-y-4'>
            <Text>Sign in with:</Text>

            <Button leftIcon={<FcGoogle />} onClick={handleSignIn} variant='light'>Google</Button>
        </div>
    </Modal>
}
