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

interface WorkspaceIdLayoutProps {
    children: React.ReactNode;
}

const WorkspaceLayout = ({ children }: WorkspaceIdLayoutProps) => {
    const { parentMessageId, onOpenMessage, onClose } = usePanel();

    const showPanel = !!parentMessageId;

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
                        defaultSize={16}
                        minSize={12}
                        maxSize={18}
                        className="bg-[#5E2C5f]"
                    >
                        <WorkspaceSidebar />
                    </ResizablePanel>
                    <ResizableHandle className="invisible" withHandle />
                    <ResizablePanel minSize={20}>{children}</ResizablePanel>

                    {showPanel && (
                        <>
                            <ResizableHandle className="invisible" withHandle />
                            <ResizablePanel
                                minSize={12}
                                defaultSize={16}
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
