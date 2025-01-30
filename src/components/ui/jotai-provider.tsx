"use client";

import { Provider as JotaiProvider } from "jotai";

interface JotaiProviderProps {
    children: React.ReactNode;
}

export const JotaiProviderWrapper = ({ children }: JotaiProviderProps) => {
    return <JotaiProvider>{children}</JotaiProvider>;
};
