"use client";

import { useGetChannel } from "@/features/channels/api/use-get-channel";
import { useChannelId } from "@/hooks/use-workspace-id copy";
import { Loader, TriangleAlert } from "lucide-react";

const ChannelIdPage = () => {
    const channelId = useChannelId();
    const { data: channel, isLoading: channelLoading } = useGetChannel({
        id: channelId,
    });

    if (channelLoading) {
        return (
            <div className="h-full flex-1 flex items-center justify-center">
                <Loader className="size-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!channel) {
        return (
            <div className="h-full flex-1 flex-col gap-y-2 flex items-center justify-center">
                <TriangleAlert className="size-6 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                    Channel not found.
                </span>
            </div>
        );
    }

    return <div>{channel?.name}</div>;
};

export default ChannelIdPage;
