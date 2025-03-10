import { Button } from "@/components/ui/button";
import { CommandIcon, Info, Search } from "lucide-react";

import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command";

import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useGetChannels } from "@/features/channels/api/use-get-channels";
import { useGetMembers } from "@/features/members/api/use-get-members";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DialogTitle } from "@radix-ui/react-dialog";

const Toolbar = () => {
    const router = useRouter();
    const workspaceId = useWorkspaceId();
    const { data, isLoading } = useGetWorkspace({ id: workspaceId });

    const { data: channels } = useGetChannels({ workspaceId });
    const { data: members } = useGetMembers({ workspaceId });

    const [open, setOpen] = useState(false);

    const onChannelClick = (channelId: string) => {
        setOpen(false);
        router.push(`/workspace/${workspaceId}/channel/${channelId}`);
    };

    const onMemberClick = (memberId: string) => {
        setOpen(false);
        router.push(`/workspace/${workspaceId}/member/${memberId}`);
    };

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    return (
        <nav className="bg-[#481349] flex items-center justify-between h-10 p-1.5">
            <div className="flex-1"></div>
            <div className="min-w-[280px] max-[642px] grow-[2] shrink">
                <Button
                    size="sm"
                    onClick={() => setOpen(true)}
                    className="bg-accent/25 hover:bg-accent-25 w-full justify-start h-7 px-2"
                >
                    <Search className="size-4 text-white mr-2" />
                    <div className="flex justify-between w-full">
                        <p className="text-white text-sm">
                            Search {data?.name}
                        </p>

                        <span className="text-xs flex items-center text-white/60">
                            <CommandIcon className="size-3.5 mr-0.5" /> + K
                        </span>
                    </div>
                </Button>

                <CommandDialog open={open} onOpenChange={setOpen}>
                    <DialogTitle />

                    <CommandInput placeholder="Type a channel or a member..." />
                    <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>

                        <CommandGroup heading="Channels">
                            {channels?.map((channel) => (
                                <CommandItem
                                    onSelect={() => onChannelClick(channel._id)}
                                    key={channel._id}
                                >
                                    <Link
                                        href={`/workspace/${workspaceId}/channel/${channel._id}`}
                                    >
                                        {channel.name}
                                    </Link>
                                </CommandItem>
                            ))}
                        </CommandGroup>

                        <CommandSeparator />

                        <CommandGroup heading="Members">
                            {members?.map((member) => (
                                <CommandItem
                                    key={member._id}
                                    onSelect={() => onMemberClick(member._id)}
                                >
                                    <Link
                                        href={`/workspace/${workspaceId}/member/${member._id}`}
                                    >
                                        {member.user.name}
                                    </Link>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </CommandDialog>
            </div>
            <div className="ml-auto flex-1 flex items-center justify-end">
                <Button variant="transparent" size="iconSm">
                    <Info className="size-5 text-white" />
                </Button>
            </div>
        </nav>
    );
};

export default Toolbar;
