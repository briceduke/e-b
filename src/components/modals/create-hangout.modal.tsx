import { useAtom } from 'jotai';
import { useForm } from 'react-hook-form';
import { BiParty } from 'react-icons/bi';

import { createHangoutModalAtom } from '@/store/modals.atom';
import { handleErrors } from '@/utils';
import { api } from '@/utils/api';
import { Box, Button, LoadingOverlay, Modal, TextInput, ThemeIcon, Title } from '@mantine/core';

import type { generateHangoutInput } from '@/common/schemas'

const ModalTitle = () => {
    return <Box display={'flex'} className='items-center space-x-4'>
        <ThemeIcon variant='light' color='green'>
            <BiParty />
        </ThemeIcon>
        <Title order={3}>Generate Hangout Ideas</Title>
    </Box>
}

export const CreateHangoutModal = ({ roomId }: { roomId: string }) => {
    const [createHangoutModalOpen, setCreateHangoutModalOpen] = useAtom(createHangoutModalAtom);

    const ctx = api.useContext();

    const { mutate: createHangout, isLoading: createLoading } = api.hangout.generate.useMutation({
        onSuccess: () => {
            reset();

            void ctx.hangout.getRoomHangoutLists.invalidate();

            setCreateHangoutModalOpen(false);
        },
        onError: (e) => handleErrors({ e, message: 'Failed to generate hangouts' })
    });

    const { register, handleSubmit, reset, formState: { errors, isLoading, isSubmitting } } = useForm<generateHangoutInput>({
        // resolver: zodResolver(generateHangoutSchema),
    });

    const loading = isLoading || isSubmitting || createLoading;

    const handleCreateHangout = (data: generateHangoutInput) => {
        if (data.prompt && data.prompt.length > 0) {
            createHangout({
                roomId,
                adventureLevel: data.adventureLevel,
                prompt: data.prompt
            });
        } else {
            createHangout({
                roomId,
                adventureLevel: data.adventureLevel,
            });
        }

        return;
    };

    return <div>
        <Modal
            opened={createHangoutModalOpen}
            onClose={() => setCreateHangoutModalOpen(false)}
            centered
            radius={'md'}
            title={<ModalTitle />}
        >
            <LoadingOverlay visible={loading} overlayBlur={2} zIndex={1000} />
            {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
            <form onSubmit={handleSubmit(handleCreateHangout)}>
                <Box maw={300} pos='relative' className='space-y-4'>

                    <TextInput error={errors.prompt?.message ?? ''} {...register('prompt')} label="Prompt (optional)" placeholder="Lobster themed, outdoorsy, low budget" className='w-full' />

                    {errors.adventureLevel?.message}

                    <Button type='submit' disabled={loading}>
                        Generate Ideas
                    </Button>
                </Box>
            </form>
        </Modal>
    </div>
}