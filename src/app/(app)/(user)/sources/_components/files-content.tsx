"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDropzone } from "@uploadthing/react";
import { useCallback, useState } from "react";
import { Trash2Icon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { usePDFJS } from "./usePDFJS";

const PROFILE_MAX_SIZE = 4; // Max file size in MB
const ACCEPTED_FILE_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain"
];

const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            resolve(reader.result as ArrayBuffer);
        };

        reader.onerror = () => {
            reject(reader.error);
        };

        reader.readAsArrayBuffer(file);
    });
};

export function FileUploadForm() {
    const [files, setFiles] = useState<File[]>([]);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [convertedData, setConvertedData] = useState<Map<string, string>>(new Map());
    const pdfjs = usePDFJS();

    const processFile = useCallback(async (file: File) => {
        if (!pdfjs) {
            toast.error("PDF.js is not loaded yet");
            return;
        }

        toast.info("Processing " + file.name);

        try {
            const arrayBuffer = await readFileAsArrayBuffer(file);
            const pdfData = new Uint8Array(arrayBuffer);

            const pdf = await pdfjs.getDocument({ data: pdfData }).promise;
            let text = '';
            const numPages = pdf.numPages;

            for (let pageNum = 1; pageNum <= numPages; pageNum++) {
                try {
                    const page = await pdf.getPage(pageNum);
                    const content = await page.getTextContent();
                    text += content.items.map((item: any) => item.str).join(' ');

                    setUploadProgress(Math.round((pageNum / numPages) * 100));
                } catch (error) {
                    console.error(`Error processing page ${pageNum}:`, error);
                }
            }

            setConvertedData((prevData) => new Map(prevData).set(file.name, text));
            console.log(text);
            toast.success(`Document processed successfully (${text.length || 0} chars)`);
        } catch (error) {
            console.error("Error processing PDF document:", error);
            toast.error("Document could not be processed: " + (error as Error).message);
        } finally {
            setUploadProgress(0);
        }
    }, [pdfjs]);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
        for (const file of acceptedFiles) {
            await processFile(file);
        }
    }, [processFile]);

    const { getRootProps, getInputProps, isDragActive, isDragAccept } =
        useDropzone({
            onDrop,
            accept: ACCEPTED_FILE_TYPES,
            maxSize: PROFILE_MAX_SIZE * 1024 * 1024,
        });

    const handleRemoveFile = (fileName: string) => {
        setFiles((prevFiles) => prevFiles.filter(file => file.name !== fileName));
        setConvertedData((prevData) => {
            const newData = new Map(prevData);
            newData.delete(fileName);
            return newData;
        });
    };

    return (
        <>
            <Card>
                <CardContent className="flex items-center gap-4">
                    <div className="bg-white p-6 rounded-lg w-full max-w-lg">
                        <div className="mb-4">
                            <h2 className="text-xl font-semibold">Upload and Convert Documents</h2>
                            <p className="text-sm text-muted-foreground">
                                Drag and drop files here, or click to select files. Supported file types: .pdf, .doc, .docx, .txt
                            </p>
                        </div>

                        <div
                            {...getRootProps()}
                            className={cn(
                                "flex h-36 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-border transition-[border] hover:border-primary",
                                isDragActive && "border-primary",
                                isDragAccept && "border-green-500"
                            )}
                        >
                            <input {...getInputProps()} />

                            <p className="p-8 text-center text-sm text-muted-foreground">
                                {isDragActive
                                    ? isDragAccept
                                        ? "Drop the files here"
                                        : "These file types are not supported"
                                    : "Drag and drop files here, or click to select files not more than 4MB in size."}
                            </p>
                        </div>

                        <div className="mt-7">
                            <div className="relative flex items-center justify-center mb-4">
                                <div className="border-t border-gray-300 w-full"></div>
                                <span className="absolute bg-white px-2 text-sm text-muted-foreground">Attached Files: </span>
                            </div>
                            {convertedData && convertedData.size > 0 ? (
                                <ul className="list-disc pl-5">
                                    {Array.from(convertedData.entries()).map(([fileName, textData]) => (
                                        <li key={fileName} className="flex justify-between items-center py-2">
                                            <span className="text-sm">{fileName} {textData ? '(' + textData.length + ' chars)' : ''}</span>
                                            <Button
                                                onClick={() => handleRemoveFile(fileName)}
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="flex-shrink-0"
                                            >
                                                <Trash2Icon className="h-4 w-4" />
                                            </Button>

                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground">No files processed</p>
                            )}

                        </div>

                        {uploadProgress > 0 && (
                            <div className="mt-4">
                                <div className="relative pt-1">
                                    <div className="flex mb-2 items-center justify-between">
                                        <div className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded text-teal-600 bg-teal-200">
                                            Upload Progress
                                        </div>
                                        <div className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded text-teal-600 bg-teal-200">
                                            {uploadProgress}%
                                        </div>
                                    </div>
                                    <div className="relative flex mb-2 items-center justify-between">
                                        <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                                            <div
                                                className="bg-teal-600 h-2.5 rounded-full"
                                                style={{ width: `${uploadProgress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </>
    );
}