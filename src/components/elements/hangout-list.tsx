import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { BiTrash } from 'react-icons/bi';

import { handleErrors } from '@/utils';
import { api } from '@/utils/api';
import { ActionIcon, Avatar, Box, Button, Text } from '@mantine/core';
import { useListState } from '@mantine/hooks';

import { HangoutItem } from './hangout-item';
import { HangoutVoted } from './hangout-voted';

import type { RouterOutputs } from '@/utils/api'

export interface HangoutProps {
    data: RouterOutputs['hangout']['getRoomHangoutLists'][0]
}

export const HangoutList = ({ data }: HangoutProps) => {
    const { data: session } = useSession();
    const [state, handlers] = useListState(data.items);

    const ctx = api.useContext();

    const votingEnded = (session && data.voted.some(v => v.id === session.user.id)) || data.votingEnded;

    const items = !votingEnded && state.map((item, index) => <HangoutItem id={item.id} key={item.id} index={index} item={item.content} />);

    const { mutate, isLoading: voteLoading } = api.vote.vote.useMutation({
        onError: (e) => handleErrors({ e, message: "Could not vote" }),
        onSuccess: async () => {
            await ctx.hangout.getRoomHangoutLists.invalidate();
        }
    })

    const { mutate: deleteHangout, isLoading: deleteHangoutLoading } = api.hangout.delete.useMutation({
        onError: (e) => handleErrors({ e, message: "Could not delete vote" }),
        onSuccess: async () => {
            await ctx.hangout.getRoomHangoutLists.invalidate();
        }
    })

    const { mutate: endHangout, isLoading: endHangoutLoading } = api.hangout.end.useMutation({
        onError: (e) => handleErrors({ e, message: "Could not delete vote" }),
        onSuccess: async () => {
            await ctx.hangout.getRoomHangoutLists.invalidate();
        }
    })

    const handleVote = () => {
        void mutate({ hangoutId: data.id, items: state.map(i => i.id) });
    }

    const handleDelete = () => {
        void deleteHangout({ hangoutId: data.id });
    }

    const handleEnd = () => {
        void endHangout({ hangoutId: data.id });
    }

    if (typeof window === 'undefined') return <div />;

    return (
        <Box>
            {!votingEnded && <DragDropContext
                onDragEnd={({ destination, source }) =>
                    handlers.reorder({ from: source.index, to: destination?.index || 0 })
                }
            >
                <Droppable droppableId="dnd-list" direction="vertical">
                    {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef}>
                            {items}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>

            </DragDropContext>}
            {votingEnded && <HangoutVoted data={data} />}
            <Box className='flex justify-between items-center'>
                {!votingEnded && <Box className='space-x-4'>
                    <Button loading={voteLoading} onClick={handleVote}>Vote</Button>
                    {data.createdBy.id === session?.user.id && <Button variant='light' loading={endHangoutLoading} onClick={handleEnd}>End Voting</Button>}
                </Box>}
                {votingEnded && data.createdBy.id === session?.user.id && <ActionIcon onClick={handleDelete} loading={deleteHangoutLoading} color='red' variant='light' size={'lg'}>
                    <BiTrash />
                </ActionIcon>}

                <Box>
                    <Text size={'xs'} color="dimmed">Created By:</Text>
                    <Box className='flex space-x-2'>
                        <Avatar size={'sm'}>
                            {!!data.createdBy.image && <Image fill sizes='33vw' src={data.createdBy.image} alt={`${data.createdBy.name ?? 'User'}'s avatar`} />}
                        </Avatar>
                        <Text>{data.createdBy.name}</Text>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
