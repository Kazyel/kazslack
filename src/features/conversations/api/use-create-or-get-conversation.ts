import { useCallback, useMemo, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

type RequestType = {
    workspaceId: Id<"workspaces">;
    memberId: Id<"members">;
};

type ResponseType = Id<"conversations"> | null;

type Status = "success" | "error" | "settled" | "pending" | null;

type Options = {
    onSuccess?: (data: ResponseType) => void;
    onError?: (error: Error) => void;
    onSettled?: () => void;
    throwError?: boolean;
};

export const useCreateOrGetConversation = () => {
    const [data, setData] = useState<ResponseType>(null);
    const [error, setError] = useState<Error | null>(null);
    const [status, setStatus] = useState<Status>(null);

    const isPending = useMemo(() => status === "pending", [status]);
    const isError = useMemo(() => status === "error", [status]);
    const isSettled = useMemo(() => status === "settled", [status]);
    const isSuccess = useMemo(() => status === "success", [status]);

    const mutation = useMutation(api.conversations.createOrGet);

    const mutate = useCallback(
        async (values: RequestType, options?: Options) => {
            try {
                setData(null);
                setError(null);
                setStatus("pending");

                const response = await mutation(values);
                options?.onSuccess?.(response);
                setStatus("success");

                return response;
            } catch (error) {
                setError(error as Error);
                setStatus("error");

                options?.onError?.(error as Error);

                if (options?.throwError) {
                    throw error;
                }
            } finally {
                setStatus("settled");
                options?.onSettled?.();
            }
        },

        [mutation]
    );

    return { mutate, data, error, isPending, isError, isSettled, isSuccess };
};
