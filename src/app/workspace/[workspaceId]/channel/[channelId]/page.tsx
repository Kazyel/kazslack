"use client";

import { useGetChannel } from "@/features/channels/api/use-get-channel";
import { useChannelId } from "@/hooks/use-channel-id";
import { Loader, TriangleAlert } from "lucide-react";
import { ChannelHeader } from "./channel-header";
import { ChatInput } from "./chat-input";
import { useGetMessages } from "@/features/messages/api/use-get-messages";
import { MessageList } from "@/components/message-list";

const ChannelIdPage = () => {
    const channelId = useChannelId();

    const { data: channel, isLoading: channelLoading } = useGetChannel({
        id: channelId,
    });

    const { results, status, loadMore } = useGetMessages({ channelId });

    if (channelLoading || status === "LoadingFirstPage") {
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

    return (
        <div className="flex flex-col h-full">
            <ChannelHeader name={channel?.name}></ChannelHeader>
            <MessageList
                channelName={channel?.name}
                channelCreationTime={channel?._creationTime}
                data={results}
                loadMore={loadMore}
                isLoadingMore={status === "LoadingMore"}
                canLoadMore={status === "CanLoadMore"}
            />
            <ChatInput placeholder={`Message # ${channel.name}`} />
        </div>
    );
};

export default ChannelIdPage;
