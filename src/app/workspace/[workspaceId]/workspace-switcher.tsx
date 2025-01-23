import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Loader, Plus } from "lucide-react";

import { useRouter } from "next/navigation";
import { useWorkspaceId } from "@/hooks/useWorkspaceId";
import { useGetWorkspace } from "@/features/workspaces/api/useGetWorkspace";
import { useGetWorkspaces } from "@/features/workspaces/api/useGetWorkspaces";
import { useCreateWorkspaceModal } from "@/features/workspaces/store/useCreateWorkspaceModal";
import { Separator } from "@/components/ui/separator";

export const WorkspaceSwitcher = () => {
    const router = useRouter();
    const workspaceId = useWorkspaceId();
    const [_open, setOpen] = useCreateWorkspaceModal();

    const { data: workspace, isLoading: workspaceLoading } = useGetWorkspace({
        id: workspaceId,
    });
    const { data: workspaces, isLoading: workspacesLoading } =
        useGetWorkspaces();

    const filteredWorkspaces = workspaces?.filter(
        (workspace) => workspace?._id !== workspaceId
    );

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {/* Workspace Button */}
                <Button className="size-12 relative overflow-hidden bg-[#ABABAB] hover:bg-[#ABABAB]/80 text-slate-800 font-semibold text-xl">
                    {workspaceLoading ? (
                        <Loader className="size-5 animate-spin shrink-0" />
                    ) : (
                        workspace?.name.charAt(0).toUpperCase()
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="start" className="w-64">
                {/* Active workspace */}
                <DropdownMenuItem
                    className="cursor-pointer flex-col flex justify-start items-start capitalize pb-2"
                    onClick={() => router.push(`/workspace/${workspaceId}`)}
                >
                    <span className="font-semibold -mb-1">
                        {workspace?.name}
                    </span>
                    <span
                        className="text-xs text-muted-foreground
                    "
                    >
                        Active workspace
                    </span>
                </DropdownMenuItem>

                <Separator />

                {/* Other workspaces */}
                {filteredWorkspaces?.map((workspace) => (
                    <>
                        <DropdownMenuItem
                            key={workspace._id}
                            className="cursor-pointer capitalize pt-2"
                            onClick={() => {
                                router.push(`/workspace/${workspace._id}`);
                            }}
                        >
                            <div className="size-7 relative overflow-hidden bg-[#616061] text-white font-semibold text-lg rounded-md flex items-center justify-center mr-2">
                                {workspace.name.charAt(0).toUpperCase()}
                            </div>
                            {workspace.name}
                        </DropdownMenuItem>
                    </>
                ))}

                {/* Create new workspace */}
                <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => setOpen(true)}
                >
                    <div className="size-7 relative overflow-hidden bg-[#F2F2F2] text-slate-8000 font-semibold text-lg rounded-md flex items-center justify-center mr-2">
                        <Plus />
                    </div>
                    Create a new workspace
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
