import { PiTextAa } from "react-icons/pi";
import { MdSend } from "react-icons/md";
import { ImageIcon, Smile } from "lucide-react";

import React, {
    RefObject,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from "react";

import { Delta, Op } from "quill/core";
import Quill, { QuillOptions } from "quill";
import { Hint } from "./hint";
import { Button } from "./ui/button";

import "quill/dist/quill.snow.css";
import { cn } from "@/lib/utils";
import { EmojiPopover } from "./emoji-popover";

type EditorValue = {
    image: File | null;
    body: string;
};

interface EditorProps {
    onSubmit: ({ image, body }: EditorValue) => void;
    onCancel?: () => void;
    placeholder?: string;
    defaultValue?: Delta | Op[];
    disabled?: boolean;
    innerRef?: RefObject<Quill | null>;
    variant?: "create" | "update";
}

const Editor = ({
    onSubmit,
    onCancel,
    placeholder = "Write something...",
    defaultValue = [],
    disabled = false,
    innerRef,
    variant = "create",
}: EditorProps) => {
    const [text, setText] = useState("");
    const [isToolbarVisible, setIsToolbarVisible] = useState(false);
    const [image, setImage] = useState<File | null>(null);

    const submitRef = useRef(onSubmit);
    const placeholderRef = useRef(placeholder);
    const defaultValueRef = useRef(defaultValue);
    const containerRef = useRef<HTMLDivElement>(null);
    const disabledRef = useRef(disabled);
    const quillRef = useRef<Quill | null>(null);
    const imageElementRef = useRef<HTMLInputElement>(null);

    useLayoutEffect(() => {
        submitRef.current = onSubmit;
        placeholderRef.current = placeholder;
        defaultValueRef.current = defaultValue;
        disabledRef.current = disabled;
    });

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const editorContainer = container.appendChild(
            container.ownerDocument.createElement("div")
        );

        const options: QuillOptions = {
            theme: "snow",
            placeholder: placeholderRef.current,
            modules: {
                toolbar: [
                    ["bold", "italic", "strike"],
                    ["link"],
                    [{ list: "ordered" }, { list: "bullet" }],
                ],
                keyboard: {
                    bindings: {
                        enter: {
                            key: "Enter",
                            handler: () => onSubmit,
                        },
                        shift_enter: {
                            key: "Enter",
                            shiftKey: true,
                            handler: () => {
                                quill.insertText(
                                    quill.getSelection()?.index || 0,
                                    "\n"
                                );
                            },
                        },
                    },
                },
            },
        };

        const quill = new Quill(editorContainer, options);
        quillRef.current = quill;
        quillRef.current.focus();

        if (innerRef) {
            innerRef.current = quill;
        }

        quill.setContents(defaultValueRef.current);
        setText(quill.getText());

        quill.on(Quill.events.TEXT_CHANGE, () => {
            setText(quill.getText());
        });

        return () => {
            quill.off(Quill.events.TEXT_CHANGE);
            if (container) container.innerHTML = "";
            if (quillRef.current) quillRef.current = null;
            if (innerRef) innerRef.current = null;
        };
    }, []);

    const onEmojiSelect = (emoji: any) => {
        const quill = quillRef.current;
        quill?.insertText(quill?.getSelection()?.index || 0, emoji.native);
    };

    const isEmpty = text.replace(/<(.|\n)*?>/g, "").trim().length === 0;

    const toggleToolbar = () => {
        setIsToolbarVisible((prev) => !prev);
        const toolbarElement =
            containerRef.current?.querySelector(".ql-toolbar");

        if (toolbarElement) {
            toolbarElement.classList.toggle("hidden");
        }
    };

    return (
        <div className="flex flex-col">
            <div className="flex flex-col border border-slate-200 rounded-md overflow-hidden focus-within:border-slate-300 focus-within:shadow-sm transition bg-white">
                <div ref={containerRef} className="h-full ql-custom"></div>
                <div className="flex px-2 pb-2 z-[5]">
                    <Hint
                        label={
                            isToolbarVisible
                                ? "Show formatting"
                                : "Hide formatting"
                        }
                    >
                        <Button
                            disabled={disabled}
                            size="iconSm"
                            variant="ghost"
                            onClick={toggleToolbar}
                        >
                            <PiTextAa className="size-4" />
                        </Button>
                    </Hint>

                    <EmojiPopover onEmojiSelect={onEmojiSelect}>
                        <Button
                            disabled={disabled}
                            size="iconSm"
                            variant="ghost"
                        >
                            <Smile className="size-4" />
                        </Button>
                    </EmojiPopover>
                    {variant === "update" && (
                        <div className="ml-auto flex items-center gap-x-2">
                            <Button
                                disabled={disabled}
                                size="sm"
                                variant="outline"
                                onClick={() => {}}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="bg-[#007a5a] hover:bg-[#007a5a]/80 text-white"
                                disabled={disabled || isEmpty}
                                onClick={() => {}}
                                size="sm"
                            >
                                Save
                            </Button>
                        </div>
                    )}
                    {variant === "create" && (
                        <Hint label="Image">
                            <Button
                                disabled={false}
                                size="iconSm"
                                variant="ghost"
                                onClick={() => {}}
                            >
                                <ImageIcon className="size-4" />
                            </Button>
                        </Hint>
                    )}

                    {variant === "create" && (
                        <Hint label="Send message">
                            <Button
                                className={cn(
                                    "ml-auto",
                                    isEmpty
                                        ? "bg-white hover:white text-muted-foreground transition-all duration-300"
                                        : "bg-[#007a5a] hover:bg-[#007a5a]/80 text-white transition-all duration-300"
                                )}
                                size="iconSm"
                                disabled={disabled || isEmpty}
                                onClick={() => {}}
                            >
                                <MdSend className="size-4" />
                            </Button>
                        </Hint>
                    )}
                </div>
            </div>
            {variant === "create" && (
                <div
                    className={cn(
                        "p-2 text-[10px] text-muted-foreground flex justify-end opacity-0 transition",
                        !isEmpty && "opacity-100"
                    )}
                >
                    <p>
                        <strong>Shift + Return</strong> to add a new line
                    </p>
                </div>
            )}
        </div>
    );
};

export default Editor;
