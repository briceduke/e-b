import { Draggable } from 'react-beautiful-dnd';
import { BiGridVertical } from 'react-icons/bi';

import { createStyles, rem, Text } from '@mantine/core';

const useStyles = createStyles((theme) => ({
    item: {
        display: 'flex',
        alignItems: 'center',
        borderRadius: theme.radius.md,
        border: `${rem(1)} solid ${theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2]
            }`,
        padding: `${theme.spacing.sm} ${theme.spacing.xl}`,
        paddingLeft: `calc(${theme.spacing.xl} - ${theme.spacing.md})`, // to offset drag handle
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.white,
        marginBottom: theme.spacing.sm,
    },

    itemDragging: {
        boxShadow: theme.shadows.sm,
    },

    symbol: {
        fontSize: rem(30),
        fontWeight: 700,
        width: rem(60),
    },

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    dragHandle: {
        ...theme.fn.focusStyles(),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: theme.colorScheme === 'dark' ? theme.colors.dark[1] : theme.colors.gray[6],
        paddingLeft: theme.spacing.md,
        paddingRight: theme.spacing.md,
    },
}));

export const HangoutItem = ({ item, index, id }: { item: string, index: number, id: string }) => {
    const { classes, cx } = useStyles();

    return <Draggable key={id} index={index} draggableId={id}>
        {(provided, snapshot) => (
            <div
                className={cx(classes.item, { [classes.itemDragging]: snapshot.isDragging })}
                ref={provided.innerRef}
                {...provided.draggableProps}
            >
                <div className={classes.dragHandle} {...provided.dragHandleProps}>
                    <BiGridVertical />
                </div>
                <Text color="dimmed" size="sm">
                    {item}
                </Text>
            </div>
        )}
    </Draggable>
}