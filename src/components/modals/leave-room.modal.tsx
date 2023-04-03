import { useAtom } from 'jotai';
import { useRouter } from 'next/router';
import { BiExit } from 'react-icons/bi';

import { leaveRoomModalAtom } from '@/store/modals.atom';
import { handleErrors } from '@/utils';
import { api } from '@/utils/api';
import { Box, Button, Group, Loader, Modal, Text, ThemeIcon, Title } from '@mantine/core';

const ModalTitle = () => {
    return <Box display={'flex'} className='items-center space-x-4'>
        <ThemeIcon variant='light' color='red'>
            <BiExit />
        </ThemeIcon>
        <Title order={3}>Leave Room</Title>
    </Box>
}

export const LeaveRoomModal = ({ id, name }: { id?: string; name?: string; }) => {
    const ctx = api.useContext();
    const { push } = useRouter();

    const [leaveRoomModalOpen, setLeaveRoomModalOpen] = useAtom(leaveRoomModalAtom);

    const { mutate: leaveRoom, isLoading: leaveLoading } = api.room.leave.useMutation({
        retry: 2,
        onSuccess: () => {
            void ctx.room.getUserRooms.invalidate();

            void setLeaveRoomModalOpen(false);

            void push('/home');
        },
        onError: (e) => handleErrors({ e, message: 'Failed to leave room' })
    });

    if (!name || !id) return <Modal opened={leaveRoomModalOpen} onClose={() => setLeaveRoomModalOpen(false)}>
        <div className='flex items-center justify-center'>
            <Loader />
        </div>
    </Modal>

    return <Modal
        title={<ModalTitle />}
        opened={leaveRoomModalOpen}
        onClose={() => setLeaveRoomModalOpen(false)}
        centered>
        <div className='space-y-4'>
            <div>
                <Text>You can always join again, just get someone in the room to re-invite you!</Text>
            </div>
            <Group>
                <Button onClick={() => setLeaveRoomModalOpen(false)} variant={'outline'}>Cancel</Button>
                <Button onClick={() => leaveRoom({ id })} loading={leaveLoading} color={'red'} leftIcon={<BiExit />}>Confirm</Button>
            </Group>
        </div>
    </Modal>
}