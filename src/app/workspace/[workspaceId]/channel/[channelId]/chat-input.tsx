import dynamic from "next/dynamic";
import { Id } from "../../../../../../convex/_generated/dataModel";

import { useRef, useState } from "react";
import { useCreateMessage } from "@/features/messages/api/use-create-message";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useChannelId } from "@/hooks/use-channel-id";
import { useGenerateUploadURL } from "@/features/upload/api/use-generate-upload-url";

import Quill from "quill";
import { toast } from "sonner";

const Editor = dynamic(() => import("@/components/editor"), { ssr: false });

interface ChatInputProps {
    placeholder: string;
}

type CreateMessageValues = {
    channelId: Id<"channels">;
    workspaceId: Id<"workspaces">;
    body: string;
    image?: Id<"_storage"> | undefined;
};

export const ChatInput = ({ placeholder }: ChatInputProps) => {
    const [editorKey, setEditorKey] = useState(0);
    const [isPending, setIsPending] = useState(false);

    const workspaceId = useWorkspaceId();
    const channelId = useChannelId();

    const { mutate: generateUploadURL } = useGenerateUploadURL();
    const { mutate: createMessage } = useCreateMessage();

    const editorRef = useRef<Quill | null>(null);

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

    return (
        <div className="px-4 w-full">
            <Editor
                key={editorKey}
                placeholder={placeholder}
                onSubmit={handleSubmit}
                disabled={isPending}
                innerRef={editorRef}
            />
        </div>
    );
};
