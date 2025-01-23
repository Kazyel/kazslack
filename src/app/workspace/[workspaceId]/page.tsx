"use client";

import { useGetWorkspace } from "@/features/workspaces/api/useGetWorkspace";
import { useWorkspaceId } from "@/hooks/useWorkspaceId";

const WorkspaceIdPage = () => {
    const workspaceId = useWorkspaceId();
    const { data, isLoading } = useGetWorkspace({ id: workspaceId });

    return (
        <div>
           
        </div>
    );
};

export default WorkspaceIdPage;
