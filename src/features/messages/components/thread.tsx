import Quill from "quill";
import dynamic from "next/dynamic";
import { differenceInMinutes, format, isToday, isYesterday } from "date-fns";
import { Id } from "../../../../convex/_generated/dataModel";

import { Button } from "@/components/ui/button";
import { Message } from "@/components/message";
import { AlertTriangle, Loader, XIcon } from "lucide-react";
import { toast } from "sonner";

import { useRef, useState } from "react";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useChannelId } from "@/hooks/use-channel-id";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useGetMessage } from "../api/use-get-message";
import { useGetMessages } from "../api/use-get-messages";
import { useCreateMessage } from "../api/use-create-message";
import { useGenerateUploadURL } from "@/features/upload/api/use-generate-upload-url";

const Editor = dynamic(() => import("@/components/editor"), { ssr: false });

interface ThreadProps {
    messageId: Id<"messages">;
    onClose: () => void;
}

type CreateMessageValues = {
    channelId: Id<"channels">;
    workspaceId: Id<"workspaces">;
    parentMessageId: Id<"messages">;
    body: string;
    image?: Id<"_storage"> | undefined;
};

const TIME_THRESHOLD_IN_MINUTES = 1;

export const Thread = ({ messageId, onClose }: ThreadProps) => {
    const workspaceId = useWorkspaceId();
    const channelId = useChannelId();

    const [editingId, setEditingId] = useState<Id<"messages"> | null>(null);
    const [editorKey, setEditorKey] = useState(0);
    const [isPending, setIsPending] = useState(false);

    const editorRef = useRef<Quill | null>(null);

    const { mutate: generateUploadURL } = useGenerateUploadURL();
    const { mutate: createMessage } = useCreateMessage();

    const { data: currentMember } = useCurrentMember({ workspaceId });
    const { results, status, loadMore } = useGetMessages({
        channelId,
        parentMessageId: messageId,
    });

    const isLoadingMore = status === "LoadingMore";
    const canLoadMore = status === "CanLoadMore";

    const { data: message, isLoading: loadingMessage } = useGetMessage({
        id: messageId,
    });

    const groupedMessages = results?.reduce(
        (groups, message) => {
            const date = new Date(message._creationTime);
            const dateKey = format(date, "yyyy-MM-dd");

            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }

            groups[dateKey].unshift(message);
            return groups;
        },
        {} as Record<string, typeof results>
    );

    const formatDateLabel = (dateKey: string) => {
        const date = new Date(dateKey + " ");
        if (isToday(date)) return "Today";
        if (isYesterday(date)) return "Yesterday";

        return format(date, "EEEE, MMMM d");
    };

    const handleSubmit = async ({
        body,
        image,
    }: {
        body: string;
        image: File | null;
    }) => {
        try {
            setIsPending(true);
            editorRef?.current?.enable(false);

            const values: CreateMessageValues = {
                body,
                workspaceId,
                parentMessageId: messageId,
                channelId,
                image: undefined,
            };

            if (image) {
                const url = await generateUploadURL({}, { throwError: true });

                if (!url) {
                    throw new Error("URL not found");
                }

                const result = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": image.type,
                    },
                    body: image,
                });

                if (!result.ok) {
                    throw new Error("Failed to upload image");
                }

                const { storageId } = await result.json();
                values.image = storageId;
            }

            await createMessage(values, { throwError: true });

            setEditorKey((prev) => prev + 1);
        } catch (error) {
            toast.error("Failed to send message.");
        } finally {
            setIsPending(false);
            editorRef?.current?.enable(true);
        }
    };

    if (loadingMessage || status === "LoadingFirstPage") {
        return (
            <div className="h-full flex flex-col">
                <div className="flex justify-between items-center px-4 h-[49px] border-b">
                    <p className="text-lg font-bold">Thread</p>
                    <Button onClick={onClose} size="iconSm" variant="ghost">
                        <XIcon className="size-5 stroke-[1.5]" />
                    </Button>
                </div>
                <div className="flex h-full items-center justify-center">
                    <Loader className="size-6 animate-spin text-muted-foreground" />
                </div>
            </div>
        );
    }

    if (!message) {
        return (
            <div className="h-full flex flex-col">
                <div className="flex justify-between items-center px-4 h-[49px] border-b">
                    <p className="text-lg font-bold">Thread</p>
                    <Button onClick={onClose} size="iconSm" variant="ghost">
                        <XIcon className="size-5 stroke-[1.5]" />
                    </Button>
                </div>
                <div className="flex flex-col gap-y-2 h-full items-center justify-center">
                    <AlertTriangle className="size-6 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                        Message not found
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center px-4 h-[49px] border-b">
                <p className="text-lg font-bold">Thread</p>
                <Button onClick={onClose} size="iconSm" variant="ghost">
                    <XIcon className="size-5 stroke-[1.5]" />
                </Button>
            </div>
            <div className="flex-1 flex flex-col-reverse pb-4 overflow-y-auto messages-scrollbar">
                {Object.entries(groupedMessages || {}).map(
                    ([dateKey, messages]) => (
                        <div key={dateKey}>
                            <div className="text-center my-2 relative">
                                <hr className="absolute top-1/2 left-0 right-0 border-t border-gray-300" />
                                <span className="relative inline-block bg-white px-4 py-1 rounded-full text-xs border border-gray-300 shadow-sm">
                                    {formatDateLabel(dateKey)}
                                </span>
                            </div>

                            {messages.map((message, index) => {
                                const prevMessage = messages[index - 1];
                                const isCompact =
                                    prevMessage &&
                                    prevMessage.user?._id ===
                                        message.user?._id &&
                                    differenceInMinutes(
                                        new Date(message._creationTime),
                                        new Date(prevMessage._creationTime)
                                    ) < TIME_THRESHOLD_IN_MINUTES;

                                return (
                                    <Message
                                        key={message._id}
                                        id={message._id}
                                        memberId={message.memberId}
                                        authorImage={message.user.image}
                                        authorName={message.user.name}
                                        isAuthor={
                                            message.memberId ===
                                            currentMember?._id
                                        }
                                        reactions={message.reactions}
                                        body={message.body}
                                        image={message.image}
                                        updatedAt={message.updatedAt}
                                        createdAt={message._creationTime}
                                        isEditing={editingId === message._id}
                                        setEditingId={setEditingId}
                                        isCompact={isCompact}
                                        hideThreadButton
                                        threadCount={message.threadCount}
                                        threadImage={message.threadImage}
                                        threadName={message.threadName}
                                        threadTimestamp={
                                            message.threadTimestamp
                                        }
                                    />
                                );
                            })}
                        </div>
                    )
                )}

                <div
                    className="h-1"
                    ref={(el) => {
                        if (el) {
                            const observer = new IntersectionObserver(
                                ([entry]) => {
                                    if (entry.isIntersecting && canLoadMore) {
                                        loadMore();
                                    }
                                },
                                { threshold: 1.0 }
                            );
                            observer.observe(el);
                            return () => observer.disconnect();
                        }
                    }}
                />

                <Message
                    key={message._id}
                    id={message._id}
                    memberId={message.memberId}
                    authorImage={message.user.image}
                    authorName={message.user.name}
                    isAuthor={message.memberId === currentMember?._id}
                    reactions={message.reactions}
                    body={message.body}
                    image={message.image}
                    updatedAt={message.updatedAt}
                    createdAt={message._creationTime}
                    isEditing={editingId === message._id}
                    setEditingId={setEditingId}
                />
            </div>

            <div className="px-4">
                <Editor
                    key={editorKey}
                    onSubmit={handleSubmit}
                    disabled={isPending}
                    placeholder="Reply..."
                />
            </div>
        </div>
    );
};
