import { Box, createStyles, rem } from '@mantine/core';

import type { HangoutProps } from "./hangout-list";

const useStyles = createStyles(theme => ({
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
}));

export const emoji = (index: number) => {
    switch (index) {
        case 0:
            return '🥇 ';
        case 1:
            return '🥈 ';
        case 2:
            return '🥉 ';
        case 3:
            return '🚽 ';
        case 4:
            return '💩 ';
        default:
            return '';
    }
}

export const HangoutVoted = ({ data }: HangoutProps) => {
    const { classes } = useStyles();

    return <Box>
        {data.items.sort((a, b) => a.points - b.points).map((item, index) => <Box key={item.id} className={classes.item}>
            {emoji(index)}{item.content}
        </Box>)}
    </Box>
}