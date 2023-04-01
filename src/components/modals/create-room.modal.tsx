import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { BiRocket } from 'react-icons/bi';

import { createRoomSchema } from '@/common/schemas';
import { handleErrors } from '@/utils';
import { api } from '@/utils/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, LoadingOverlay, Modal, TextInput, ThemeIcon, Title } from '@mantine/core';

import type { createRoomInput } from '@/common/schemas'
interface CreateRoomModalProps {
    createModalOpened: boolean;
    closeCreateModal: () => void;
}

const ModalTitle = () => {
    return <Box display={'flex'} className='items-center space-x-4'>
        <ThemeIcon variant='light' color='green'>
            <BiRocket />
        </ThemeIcon>
        <Title order={3}>Create a Room</Title>
    </Box>
}

export const CreateRoomModal = ({ createModalOpened, closeCreateModal }: CreateRoomModalProps) => {
    const { push } = useRouter();
    const ctx = api.useContext();

    const { mutate: createRoom, isLoading: createLoading } = api.room.create.useMutation({
        onSuccess: (data) => {
            reset();

            void ctx.room.getUserRooms.invalidate();

            closeCreateModal();

            void push(`/room/${data.id}`)
        },
        onError: (e) => handleErrors({ e, message: 'Failed to create room' })
    });

    const { register, handleSubmit, reset, formState: { errors, isLoading, isSubmitting } } = useForm<createRoomInput>({
        resolver: zodResolver(createRoomSchema),
    });

    const loading = isLoading || isSubmitting || createLoading;

    const handleCreateRoom = (data: createRoomInput) => {
        if (data.name && data.name.length > 0) {
            createRoom({ name: data.name });
        } else {
            createRoom({});
        }

        return;
    };

    return <div>
        <Modal
            opened={createModalOpened}
            onClose={closeCreateModal}
            centered
            radius={'md'}
            title={<ModalTitle />}
        >
            <LoadingOverlay visible={loading} overlayBlur={2} zIndex={1000} />
            {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
            <form onSubmit={handleSubmit(handleCreateRoom)}>
                <Box maw={300} pos='relative' className='space-y-4'>

                    <TextInput error={errors.name?.message ?? ''} {...register('name')} label="Room Name (optional)" placeholder="My cool room" className='w-full' />

                    <Button type='submit' disabled={loading}>
                        Create Room
                    </Button>
                </Box>
            </form>
        </Modal>
    </div>
}