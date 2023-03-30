import type { PropsWithChildren } from 'react';

import Head from 'next/head';

import { AppShell } from '@mantine/core';

import { TopNav } from '../nav/top-nav';

interface AuthLayoutProps extends PropsWithChildren {
    title: string;
    description?: string;
}

export const AuthLayout = ({ children, title }: AuthLayoutProps) => {

    const pageTitle = `EB | ${title}`;

    return (
        <AppShell header={<TopNav />} padding={0}>
            <Head>
                <title>{pageTitle}</title>
            </Head>
            {children}
        </AppShell>
    )
}