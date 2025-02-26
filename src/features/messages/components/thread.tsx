import { Id } from "../../../../convex/_generated/dataModel";

interface ThreadProps {
    messageId: Id<"messages">;
    onClose: () => void;
}

export const Thread = ({ messageId, onClose }: ThreadProps) => {
    return (
        <>
            <div>Thread</div>
        </>
    );
};
