/* eslint-disable @next/next/no-img-element */

import Image from "next/image";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import { XIcon } from "lucide-react";

interface ThumbnailProps {
    url: string;
}

export const Thumbnail = ({ url }: ThumbnailProps) => {
    if (!url) return null;

    return (
        <>
            <Dialog>
                <DialogTrigger asChild>
                    <div className="relative overflow-hidden max-w-[360px] max-h-[300px] border rounded-lg my-2 cursor-zoom-in">
                        <img
                            src={url}
                            alt="Message image"
                            className="rounded-md object-cover size-full"
                        ></img>
                    </div>
                </DialogTrigger>
                <DialogTitle />
                <DialogHeader />
                <DialogContent className="max-w-[500px] border-none bg-transparent p-0 shadow-none">
                    <img
                        src={url}
                        alt="Message image"
                        className="rounded-md object-cover size-full"
                    ></img>
                </DialogContent>
            </Dialog>
        </>
    );
};
