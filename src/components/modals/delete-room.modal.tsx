import { useAtom } from 'jotai';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import { BiTrash } from 'react-icons/bi';

import { deleteRoomModalAtom } from '@/store/modals.atom';
import { handleErrors } from '@/utils';
import { api } from '@/utils/api';
import { Button, Group, Loader, Modal, Text, Title } from '@mantine/core';

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

    return <Modal opened={deleteRoomModalOpen} onClose={() => setDeleteRoomModalOpen(false)} centered>
        <div className='space-y-4'>
            <div>
                <Title color={'red'} order={3}>Delete Confirmation</Title>
                <Text>Upon confirmation, <Text component="span" fw={'bold'} >{name}</Text> will be permanently deleted.</Text>
            </div>
            <Group>
                <Button onClick={() => setDeleteRoomModalOpen(false)} variant={'outline'}>Cancel</Button>
                <Button onClick={() => deleteRoom({ id })} loading={deleteLoading} color={'red'} leftIcon={<BiTrash />}>Confirm</Button>
            </Group>
        </div>
    </Modal>
}