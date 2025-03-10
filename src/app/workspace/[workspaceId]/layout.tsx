"use client";

import { Sidebar } from "./sidebar";
import Toolbar from "./toolbar";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { WorkspaceSidebar } from "./workspace-sidebar";
import { usePanel } from "@/hooks/use-panel";
import { Loader } from "lucide-react";
import { Id } from "../../../../convex/_generated/dataModel";
import { Thread } from "@/features/messages/components/thread";
import { Profile } from "@/features/members/components/profile";

interface WorkspaceIdLayoutProps {
    children: React.ReactNode;
}

const WorkspaceLayout = ({ children }: WorkspaceIdLayoutProps) => {
    const { parentMessageId, profileMemberId, onClose } = usePanel();

    const showPanel = !!parentMessageId || !!profileMemberId;

    return (
        <div className="h-full">
            <Toolbar />
            <div className="flex h-[calc(100vh-40px)]">
                <Sidebar />
                <ResizablePanelGroup
                    direction="horizontal"
                    autoSaveId="ks-workspace-layout"
                >
                    <ResizablePanel
                        defaultSize={20}
                        minSize={16}
                        maxSize={20}
                        className="bg-[#5E2C5f]"
                    >
                        <WorkspaceSidebar />
                    </ResizablePanel>
                    <ResizableHandle className="invisible" withHandle />
                    <ResizablePanel defaultSize={80} minSize={20}>
                        {children}
                    </ResizablePanel>

                    {showPanel && (
                        <>
                            <ResizableHandle className="invisible" withHandle />
                            <ResizablePanel
                                minSize={20}
                                defaultSize={20}
                                maxSize={30}
                                className="border-l"
                            >
                                {parentMessageId ? (
                                    <Thread
                                        messageId={
                                            parentMessageId as Id<"messages">
                                        }
                                        onClose={onClose}
                                    />
                                ) : profileMemberId ? (
                                    <Profile
                                        memberId={
                                            profileMemberId as Id<"members">
                                        }
                                        onClose={onClose}
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center">
                                        <Loader className="size-6 animate-spin text-muted-foreground" />
                                    </div>
                                )}
                            </ResizablePanel>
                        </>
                    )}
                </ResizablePanelGroup>
            </div>
        </div>
    );
};

export default WorkspaceLayout;
