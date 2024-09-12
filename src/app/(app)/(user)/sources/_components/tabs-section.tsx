"use client";

import { useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import {
    FileIcon,
    BookTextIcon,
    Building2Icon,
    ClipboardListIcon,
    MailIcon,
} from "lucide-react";
import WebsiteContent from "./website-content";
import { TextContent } from "./text-content";
import { QnAContent } from "./qa-content";
import { FileUploadForm } from "./files-content";
import { MailContent } from "./mail-content";

export function TabsSection() {
    const [activeTab, setActiveTab] = useState<string>("files");

    return (
        <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="flex flex-col">
            <Tabs.List className="flex border-b border-gray-300 bg-white">
                <Tabs.Trigger
                    value="files"
                    className="flex items-center px-4 py-2 text-sm font-medium transition-colors duration-300 ease-in-out hover:bg-gray-200 focus:outline-none relative"
                    style={{ backgroundColor: 'var(--tab-bg-default)' }}
                >
                    <FileIcon className="text-lg" />
                    <span className="ml-2">Files</span>
                    <div
                        className={`absolute bottom-0 left-0 w-full h-1 bg-primary transition-transform transform ${activeTab === "files" ? "scale-x-100" : "scale-x-0"} origin-left`}
                    />
                </Tabs.Trigger>
                <Tabs.Trigger
                    value="text"
                    className="flex items-center px-4 py-2 text-sm font-medium bg-primary transition-colors duration-300 ease-in-out hover:bg-gray-200 focus:outline-none relative"
                    style={{ backgroundColor: 'var(--tab-bg-default)' }}
                >
                    <BookTextIcon className="text-lg" />
                    <span className="ml-2">Text</span>
                    <div
                        className={`absolute bottom-0 left-0 w-full h-1 bg-primary transition-transform transform ${activeTab === "text" ? "scale-x-100" : "scale-x-0"} origin-left`}
                    />
                </Tabs.Trigger>
                <Tabs.Trigger
                    value="website"
                    className="flex items-center px-4 py-2 text-sm font-medium transition-colors duration-300 ease-in-out hover:bg-gray-200 focus:outline-none relative"
                    style={{ backgroundColor: 'var(--tab-bg-default)' }}
                >
                    <Building2Icon className="text-lg" />
                    <span className="ml-2">Website</span>
                    <div
                        className={`absolute bottom-0 left-0 w-full h-1 bg-primary transition-transform transform ${activeTab === "website" ? "scale-x-100" : "scale-x-0"} origin-left`}
                    />
                </Tabs.Trigger>
                <Tabs.Trigger
                    value="qna"
                    className="flex items-center px-4 py-2 text-sm font-medium transition-colors duration-300 ease-in-out hover:bg-gray-200 focus:outline-none relative"
                    style={{ backgroundColor: 'var(--tab-bg-default)' }}
                >
                    <ClipboardListIcon className="text-lg" />
                    <span className="ml-2">Q&A</span>
                    <div
                        className={`absolute bottom-0 left-0 w-full h-1 bg-primary transition-transform transform ${activeTab === "qna" ? "scale-x-100" : "scale-x-0"} origin-left`}
                    />
                </Tabs.Trigger>
                {/* <Tabs.Trigger
                    value="mail"
                    className="flex items-center px-4 py-2 text-sm font-medium transition-colors duration-300 ease-in-out hover:bg-gray-200 focus:outline-none relative"
                    style={{ backgroundColor: 'var(--tab-bg-default)' }}
                >
                    <MailIcon className="text-lg" />
                    <span className="ml-2">Mail</span>
                    <div
                        className={`absolute bottom-0 left-0 w-full h-1 bg-primary transition-transform transform ${activeTab === "mail" ? "scale-x-100" : "scale-x-0"} origin-left`}
                    />
                </Tabs.Trigger> */}
            </Tabs.List>

            <Tabs.Content value="files" className="p-4">
                <FileUploadForm />
            </Tabs.Content>
            <Tabs.Content value="text" className="p-4">
                <TextContent />
            </Tabs.Content>
            <Tabs.Content value="website" className="p-4">
                <WebsiteContent />
            </Tabs.Content>
            <Tabs.Content value="qna" className="p-4">
                <QnAContent />
            </Tabs.Content>
            <Tabs.Content value="mail" className="p-4">
                <MailContent />
            </Tabs.Content>
        </Tabs.Root>
    );
}
