import { useAtom } from 'jotai';
import { signIn } from 'next-auth/react';
import { FcGoogle } from 'react-icons/fc';

import { authModalOpenAtom } from '@/store/modals.atom';
import { Button, Modal, Title } from '@mantine/core';

export const AuthModal = () => {
    const [authModalOpen, setAuthModalOpen] = useAtom(authModalOpenAtom);

    const handleSignIn = () => {
        void signIn('google');
    }

    return <Modal opened={authModalOpen} onClose={() => setAuthModalOpen(false)} centered radius={'md'}>
        <div className='flex flex-col items-center space-y-4 p-4'>
            <Title>Welcome Back!</Title>

            <Button leftIcon={<FcGoogle />} onClick={handleSignIn} variant="default" color="gray">Continue with Google</Button>
        </div>
    </Modal>
}