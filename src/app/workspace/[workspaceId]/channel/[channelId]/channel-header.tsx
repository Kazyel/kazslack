import { FaChevronDown } from "react-icons/fa";
import { TrashIcon } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { DialogClose } from "@radix-ui/react-dialog";
import { useUpdateChannel } from "@/features/channels/api/use-update-channel";
import { useRemoveChannel } from "@/features/channels/api/use-remove-channel";
import { useChannelId } from "@/hooks/use-channel-id";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useConfirmModal } from "@/hooks/use-confirm";
import { useCurrentMember } from "@/features/members/api/use-current-member";

interface ChannelHeaderProps {
    name: string;
}

export const ChannelHeader = ({ name }: ChannelHeaderProps) => {
    const [ConfirmDialog, confirm] = useConfirmModal(
        "Are you sure?",
        "This action will remove the channel and all of its messages."
    );
    const [editOpen, setEditOpen] = useState(false);
    const [value, setValue] = useState(name);

    const workspaceId = useWorkspaceId();
    const channelId = useChannelId();
    const router = useRouter();

    const { data: member } = useCurrentMember({ workspaceId });

    const { mutate: updateChannel, isPending: isUpdatePending } =
        useUpdateChannel();

    const { mutate: removeChannel, isPending: isRemovePending } =
        useRemoveChannel();

    const handleRemove = async () => {
        const ok = await confirm();
        if (!ok) return;

        removeChannel(
            { id: channelId },
            {
                onSuccess: () => {
                    toast.success("Channel removed successfully.");
                    router.push(`/workspace/${workspaceId}`);
                },
                onError: () => {
                    toast.error("Failed to remove channel.");
                },
            }
        );
    };

    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        updateChannel(
            { name: value, id: channelId },
            {
                onSuccess: () => {
                    toast.success("Channel updated successfully.");
                    setEditOpen(false);
                },
                onError: () => {
                    toast.error("Failed to update channel.");
                },
            }
        );
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\s+/g, "-").toLowerCase();
        setValue(value);
    };

    const handleOpen = (value: boolean) => {
        if (member?.role === "admin") setEditOpen(value);
        return;
    };

    return (
        <>
            <ConfirmDialog />
            <div className="bg-white border-b h-[49px] flex items-center px-4 overflow-hidden">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button
                            variant={"ghost"}
                            className="text-lg font-semibold px-2 overflow-hidden w-auto"
                            size="sm"
                        >
                            <span className="truncate"># {name}</span>
                            <FaChevronDown className="size-2.5 ml-2" />
                        </Button>
                    </DialogTrigger>

                    <DialogContent className="p-0 bg-gray-50 overflow-hidden">
                        <DialogHeader className="p-4 border-b bg-white">
                            <DialogTitle># {name}</DialogTitle>
                        </DialogHeader>

                        <div className="px-4 pb-4 flex flex-col gap-y-2">
                            <Dialog open={editOpen} onOpenChange={handleOpen}>
                                <DialogTrigger asChild>
                                    <div className="px-5 py-4 bg-white rounded-lg border cursor-pointer hover:bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-semibold">
                                                Channel name
                                            </p>

                                            {member?.role === "admin" && (
                                                <p className="text-sm text-[#1264a3] hover:underline font-semibold">
                                                    Edit
                                                </p>
                                            )}
                                        </div>
                                        <p className="text-sm"># {name}</p>
                                    </div>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>
                                            Rename this channel
                                        </DialogTitle>
                                    </DialogHeader>
                                    <form
                                        onSubmit={(e) => handleUpdate(e)}
                                        className="space-y-4"
                                    >
                                        <Input
                                            value={value}
                                            disabled={isUpdatePending}
                                            onChange={handleChange}
                                            required
                                            autoFocus
                                            minLength={3}
                                            maxLength={80}
                                            placeholder="e.g. plan-budget"
                                        />
                                        <DialogFooter>
                                            <DialogClose asChild>
                                                <Button
                                                    variant={"outline"}
                                                    disabled={isUpdatePending}
                                                >
                                                    Cancel
                                                </Button>
                                            </DialogClose>
                                            <Button disabled={isUpdatePending}>
                                                Save
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>

                            {member?.role === "admin" && (
                                <button
                                    onClick={handleRemove}
                                    disabled={isRemovePending}
                                    className="flex items-center gap-x-2 px-5 py-4 bg-white rounded-lg cursor-pointer border hover:bg-gray-50 text-rose-600"
                                >
                                    <TrashIcon className="size-4" />
                                    <p className="text-sm font-semibold">
                                        Delete channel
                                    </p>
                                </button>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
};
