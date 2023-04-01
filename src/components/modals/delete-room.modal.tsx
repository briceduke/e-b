import { useAtom } from 'jotai';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import { BiTrash } from 'react-icons/bi';

import { deleteRoomModalAtom } from '@/store/modals.atom';
import { handleErrors } from '@/utils';
import { api } from '@/utils/api';
import { Box, Button, Group, Loader, Modal, Text, ThemeIcon, Title } from '@mantine/core';

const ModalTitle = () => {
    return <Box display={'flex'} className='items-center space-x-4'>
        <ThemeIcon variant='light' color='red'>
            <BiTrash />
        </ThemeIcon>
        <Title order={3}>Delete Room</Title>
    </Box>
}

export const DeleteRoomModal = ({ id, name }: { id?: string; name?: string; }) => {
    const ctx = api.useContext();
    const { push } = useRouter();

    const [deleteRoomModalOpen, setDeleteRoomModalOpen] = useAtom(deleteRoomModalAtom);

    const { mutate: deleteRoom, isLoading: deleteLoading } = api.room.delete.useMutation({
        retry: 2,
        onSuccess: () => {
            void ctx.room.getUserRooms.invalidate();

            void setDeleteRoomModalOpen(false);

            toast.success('Room deleted successfully');

            void push('/home');
        },
        onError: (e) => handleErrors({ e, message: 'Failed to delete room' })
    });

    if (!name || !id) return <Modal opened={deleteRoomModalOpen} onClose={() => setDeleteRoomModalOpen(false)}>
        <div className='flex items-center justify-center'>
            <Loader />
        </div>
    </Modal>

    return <Modal
        title={<ModalTitle />}
        opened={deleteRoomModalOpen}
        onClose={() => setDeleteRoomModalOpen(false)}
        centered>
        <div className='space-y-4'>
            <div>
                <Text>Upon confirmation, <Text component="span" color='red' fw={'bold'} >{name}</Text> will be permanently deleted.</Text>
            </div>
            <Group>
                <Button onClick={() => setDeleteRoomModalOpen(false)} variant={'outline'}>Cancel</Button>
                <Button onClick={() => deleteRoom({ id })} loading={deleteLoading} color={'red'} leftIcon={<BiTrash />}>Confirm</Button>
            </Group>
        </div>
    </Modal>
}