import dynamic from "next/dynamic";
import { Doc, Id } from "../../convex/_generated/dataModel";
import { format, isToday, isYesterday } from "date-fns";
import { cn } from "@/lib/utils";

import { Hint } from "./hint";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Thumbnail } from "./thumbnail";
import { Toolbar } from "./toolbar";
import { toast } from "sonner";

import { useUpdateMessage } from "@/features/messages/api/use-update-message";
import { useRemoveMessage } from "@/features/messages/api/use-remove-message";
import { useConfirmModal } from "@/hooks/use-confirm";
import { useToggleReaction } from "@/features/reactions/api/use-toggle-reaction";
import { Reactions } from "./reactions";
import { usePanel } from "@/hooks/use-panel";

const Editor = dynamic(() => import("@/components/editor"), { ssr: false });
const Renderer = dynamic(() => import("@/components/renderer"), { ssr: false });

interface MessageProps {
    id: Id<"messages">;
    memberId: Id<"members">;
    authorImage?: string;
    authorName?: string;
    isAuthor: boolean;
    reactions: Array<
        Omit<Doc<"reactions">, "memberId"> & {
            count: number;
            membersId: Id<"members">[];
        }
    >;
    body: Doc<"messages">["body"];
    image?: string | null | undefined;
    createdAt: Doc<"messages">["_creationTime"];
    updatedAt?: Doc<"messages">["updatedAt"];
    isEditing: boolean;
    isCompact?: boolean;
    hideThreadButton?: boolean;
    setEditingId: (id: Id<"messages"> | null) => void;
    threadCount?: number;
    threadImage?: string;
    threadTimestamp?: number;
}

export const Message = ({
    id,
    memberId,
    authorImage,
    authorName = "Member",
    isAuthor,
    reactions,
    body,
    image,
    createdAt,
    updatedAt,
    isEditing,
    isCompact,
    hideThreadButton,
    setEditingId,
    threadCount,
    threadImage,
    threadTimestamp,
}: MessageProps) => {
    const [ConfirmDialog, confirm] = useConfirmModal(
        "Delete message",
        "Are you sure you want to delete this message? This action cannot be undone."
    );

    const { parentMessageId, onOpenMessage, onClose } = usePanel();

    const formatFullTime = (date: Date) => {
        return `${isToday(date) ? "Today" : isYesterday(date) ? "Yesterday" : format(date, " MMM d, yyyy")} at ${format(date, "k:mm:ss")}`;
    };

    const avatarFallback = authorName.charAt(0).toUpperCase();

    const { mutate: updateMessage, isPending: isUpdatingMessage } =
        useUpdateMessage();

    const handleUpdateMessage = ({ body }: { body: string }) => {
        updateMessage(
            { id, body },
            {
                onSuccess: () => {
                    toast.success("Message updated.");
                    setEditingId(null);
                },
                onError: () => {
                    toast.error("Failed to update message.");
                },
            }
        );
    };

    const { mutate: removeMessage, isPending: isRemovingMessage } =
        useRemoveMessage();

    const handleRemoveMessage = async () => {
        const ok = await confirm();

        if (!ok) return;

        removeMessage(
            { id },
            {
                onSuccess: () => {
                    toast.success("Message deleted successfulyl.");

                    if (parentMessageId === id) {
                        onClose();
                    }
                },
                onError: () => {
                    toast.error("Failed to delete message.");
                },
            }
        );
    };

    const { mutate: toggleReaction, isPending: isTogglingReaction } =
        useToggleReaction();

    const handleReaction = (value: string) => {
        toggleReaction(
            { messageId: id, value },
            {
                onError: () => {
                    toast.error("Failed to react.");
                },
            }
        );
    };

    const isPending = isRemovingMessage || isUpdatingMessage;

    if (isCompact) {
        return (
            <>
                <ConfirmDialog />
                <div
                    className={cn(
                        "flex flex-col gap-2.5 p-1.5 px-[26px] hover:bg-gray-100/60 group relative",
                        isEditing && "bg-[#f2c74433] hover:bg-[#f2c74433]",
                        isRemovingMessage &&
                            "bg-rose-500/50 transform transition-all scale-y-0 origin-bottom duration-200"
                    )}
                >
                    {isEditing ? (
                        <div className="w-full h-full pl-10">
                            <Editor
                                onSubmit={handleUpdateMessage}
                                disabled={isPending}
                                defaultValue={JSON.parse(body)}
                                onCancel={() => setEditingId(null)}
                                variant="update"
                            />
                        </div>
                    ) : (
                        <div className="flex items-start gap-2">
                            <Hint label={formatFullTime(new Date(createdAt))}>
                                <button className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 w-[40px] leading-[22px] text-center hover:underline">
                                    {format(new Date(createdAt), "kk:mm")}
                                </button>
                            </Hint>

                            <div className="flex flex-col w-full overflow-hidden">
                                <Renderer value={body} />

                                {image && <Thumbnail url={image} />}

                                {updatedAt ? (
                                    <span className="text-xs text-muted-foreground">
                                        (edited)
                                    </span>
                                ) : null}

                                <Reactions
                                    data={reactions}
                                    onChange={handleReaction}
                                />
                            </div>
                        </div>
                    )}

                    {!isEditing && (
                        <Toolbar
                            isAuthor={isAuthor}
                            isPending={isPending}
                            handleEdit={() => setEditingId(id)}
                            handleThread={() => onOpenMessage(id)}
                            handleDelete={handleRemoveMessage}
                            handleReaction={handleReaction}
                            hideThreadButton={hideThreadButton}
                        />
                    )}
                </div>
            </>
        );
    }

    return (
        <>
            <ConfirmDialog />
            <div
                className={cn(
                    "flex flex-col gap-2.5 pt-2 pb-1 px-5 hover:bg-gray-100/60 group relative",
                    isEditing && "bg-[#f2c74433] hover:bg-[#f2c74433]",
                    isRemovingMessage &&
                        "bg-rose-500/50 transform transition-all scale-y-0 origin-bottom duration-200"
                )}
            >
                <div className="flex items-start gap-2">
                    <button>
                        <Avatar className="size-10 rounded-md mr-1">
                            <AvatarImage src={authorImage} />
                            <AvatarFallback>{avatarFallback}</AvatarFallback>
                        </Avatar>
                    </button>

                    {isEditing ? (
                        <div className="w-full h-full">
                            <Editor
                                onSubmit={handleUpdateMessage}
                                disabled={isPending}
                                defaultValue={JSON.parse(body)}
                                onCancel={() => setEditingId(null)}
                                variant="update"
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col w-full overflow-hidden">
                            <div className="text-sm">
                                <button
                                    className="font-bold text-primary hover:underline"
                                    onClick={() => {}}
                                >
                                    {authorName}
                                </button>
                                <span>&nbsp;&nbsp;</span>

                                <Hint
                                    label={formatFullTime(new Date(createdAt))}
                                >
                                    <button className="text-xs text-muted-foreground hover:underline">
                                        {format(new Date(createdAt), "kk:mm")}
                                    </button>
                                </Hint>
                            </div>

                            <Renderer value={body} />

                            {image && <Thumbnail url={image} />}

                            {updatedAt ? (
                                <span className="text-xs text-muted-foreground">
                                    (edited)
                                </span>
                            ) : null}

                            <Reactions
                                data={reactions}
                                onChange={handleReaction}
                            />
                        </div>
                    )}
                </div>

                {!isEditing && (
                    <Toolbar
                        isAuthor={isAuthor}
                        isPending={isPending}
                        handleEdit={() => setEditingId(id)}
                        handleThread={() => onOpenMessage(id)}
                        handleDelete={handleRemoveMessage}
                        handleReaction={handleReaction}
                        hideThreadButton={hideThreadButton}
                    />
                )}
            </div>
        </>
    );
};
