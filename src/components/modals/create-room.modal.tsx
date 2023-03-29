import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';

import { createRoomSchema } from '@/common/schemas';
import { handleErrors } from '@/utils';
import { api } from '@/utils/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, LoadingOverlay, Modal, TextInput, Title } from '@mantine/core';

import type { createRoomInput } from '@/common/schemas'

interface CreateRoomModalProps {
    createModalOpened: boolean;
    closeCreateModal: () => void;
}

export const CreateRoomModal = ({ createModalOpened, closeCreateModal }: CreateRoomModalProps) => {
    const { push } = useRouter();
    const ctx = api.useContext();

    const { mutate: createRoom, isLoading: createLoading } = api.room.create.useMutation({
        onSuccess: (data) => {
            void ctx.room.getUserRooms.invalidate();

            closeCreateModal();

            void push(`/room/${data.id}`)
        },
        onError: (e) => handleErrors({ e, message: 'Failed to create room' })
    });

    const { register, handleSubmit, formState: { errors, isLoading, isSubmitting } } = useForm<createRoomInput>({
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
        <Modal opened={createModalOpened} onClose={closeCreateModal} centered radius={'md'} >
            <LoadingOverlay visible={loading} overlayBlur={2} zIndex={1000} />
            <div className='flex justify-center'>
                {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
                <form onSubmit={handleSubmit(handleCreateRoom)}>
                    <Box maw={300} pos='relative' className='flex flex-col space-y-4 items-center p-4'>

                        <Title>Create a Room</Title>

                        <TextInput error={errors.name?.message ?? ''} {...register('name')} label="Room Name (optional)" placeholder="My cool room" className='w-full' />

                        <Button type='submit' disabled={loading}>
                            Create Room
                        </Button>
                    </Box>
                </form>
            </div>
        </Modal>
    </div>
}