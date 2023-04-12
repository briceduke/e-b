import { Carousel } from '@mantine/carousel';
import { createStyles, getStylesRef, Loader } from '@mantine/core';

import { HangoutList } from './hangout-list';

import type { RouterOutputs } from '@/utils/api';

const useStyles = createStyles(() => ({
    controls: {
        ref: getStylesRef('controls'),
        transition: 'opacity 150ms ease',
        opacity: 0,
    },
    root: {
        '&:hover': {
            [`& .${getStylesRef('controls')}`]: {
                opacity: 1,
            },
        },
    },
}));

interface Props {
    data?: RouterOutputs['hangout']['getRoomHangoutLists']
}

export const HangoutSection = ({ data: hangoutListData }: Props) => {
    const { classes } = useStyles();

    if (!hangoutListData) return <Loader />;

    if (hangoutListData.length > 1) return <Carousel slideSize="90%" align="start" slideGap="md" classNames={classes}>
        {hangoutListData.map(hangout => (
            <Carousel.Slide key={hangout.id}>
                <HangoutList data={hangout} />
            </Carousel.Slide>
        ))}
    </Carousel>

    return <>
        {hangoutListData.map(hangout => <HangoutList key={hangout.id} data={hangout} />)}
    </>
}