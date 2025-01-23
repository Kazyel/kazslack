"use client";

import { UserButton } from "@/features/auth/components/UserButton";
import { useGetWorkspaces } from "@/features/workspaces/api/useGetWorkspaces";
import { useCreateWorkspaceModal } from "@/features/workspaces/store/useCreateWorkspaceModal";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

export default function Home() {
    const router = useRouter();
    const [open, setOpen] = useCreateWorkspaceModal();

    const { data, isLoading } = useGetWorkspaces();
    const workspaceId = useMemo(() => data?.[0]?._id, [data]);

    useEffect(() => {
        if (isLoading) return;

        if (workspaceId) {
            router.replace(`/workspace/${workspaceId}`);
            return;
        }

        if (!open) {
            setOpen(true);
        }

        return;
    }, [workspaceId, isLoading, setOpen, open, router]);

    return (
        <div className="p-4">
            <UserButton />
        </div>
    );
}
