import dynamic from "next/dynamic";
import { Doc, Id } from "../../convex/_generated/dataModel";
import { format, isToday, isYesterday } from "date-fns";
import { Hint } from "./hint";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

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
    const formatFullTime = (date: Date) => {
        return `${isToday(date) ? "Today" : isYesterday(date) ? "Yesterday" : format(date, " MMM d, yyyy")} at ${format(date, "k:mm:ss")}`;
    };

    const avatarFallback = authorName.charAt(0).toUpperCase();

    if (isCompact) {
        return (
            <div className="flex flex-col gap-2.5 p-1 px-[26px] hover:bg-gray-100/60 group relative">
                <div className="flex items-start gap-2">
                    <Hint label={formatFullTime(new Date(createdAt))}>
                        <button className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 w-[40px] leading-[22px] text-center hover:underline">
                            {format(new Date(createdAt), "kk:mm")}
                        </button>
                    </Hint>

                    <div className="flex flex-col w-full overflow-hidden">
                        <Renderer value={body} />

                        {updatedAt ? (
                            <span className="text-xs text-muted-foreground">
                                (edited)
                            </span>
                        ) : null}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2.5 pt-2.5 pb-1 px-5 hover:bg-gray-100/60 group relative">
            <div className="flex items-start gap-2">
                <button>
                    <Avatar className="size-10 rounded-md mr-1">
                        <AvatarImage className="rounded-md" src={authorImage} />
                        <AvatarFallback className="rounded-md bg-sky-500">
                            {avatarFallback}
                        </AvatarFallback>
                    </Avatar>
                </button>
                <div className="flex flex-col w-full overflow-hidden">
                    <div className="text-sm">
                        <button
                            className="font-bold text-primary hover:underline"
                            onClick={() => {}}
                        >
                            {authorName}
                        </button>
                        <span>&nbsp;&nbsp;</span>

                        <Hint label={formatFullTime(new Date(createdAt))}>
                            <button className="text-xs text-muted-foreground hover:underline">
                                {format(new Date(createdAt), "kk:mm")}
                            </button>
                        </Hint>
                    </div>

                    <Renderer value={body} />

                    {updatedAt ? (
                        <span className="text-xs text-muted-foreground">
                            (edited)
                        </span>
                    ) : null}
                </div>
            </div>
        </div>
    );
};
