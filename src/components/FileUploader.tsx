"use client";

import * as React from "react";
import { FileUploader, FileUploaderProps } from "@aws-amplify/ui-react-storage";
import "@aws-amplify/ui-react/styles.css";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X, UploadCloud, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomUploaderProps extends Partial<FileUploaderProps> {
  onUploadSuccess?: (data: { key?: string }) => void;
  className?: string;
}

export default function CustomFileUploader(props: CustomUploaderProps) {
  // Extract onUploadSuccess and className so we can pass them appropriately
  const { onUploadSuccess, className, ...amplifyProps } = props;
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);

  return (
    <div className={cn("w-full", className)}>
      <FileUploader
        acceptedFileTypes={["image/*"]}
        path="thumbnail-image/"
        maxFileCount={1}
        maxFileSize={5 * 1024 * 1024} // 5MB
        onUploadSuccess={onUploadSuccess}
        {...amplifyProps}
        components={{
          FileListHeader() {
            return null;
          },
          Container({ children }) {
            return <div className="w-full">{children}</div>;
          },
          DropZone({
            children,
            inDropZone,
            onDragEnter,
            onDragLeave,
            onDragOver,
            onDrop,
          }) {
            if (selectedFile) return null;
            return (
              <div
                className={cn(
                  "relative flex flex-col items-center justify-center rounded-md border border-dashed border-input bg-transparent dark:bg-input/30 p-8 text-center transition-colors hover:bg-muted/50 shadow-xs",
                  inDropZone && "border-primary bg-primary/5"
                )}
                onDragEnter={onDragEnter}
                onDragLeave={onDragLeave}
                onDragOver={onDragOver}
                onDrop={onDrop}
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-transparent dark:bg-input/30 border border-input">
                  <UploadCloud className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    Drop your files here or{" "}
                    <span
                      className="text-primary underline-offset-4 hover:underline cursor-pointer"
                      id="amplify-fileuploader-click-to-upload"
                    >
                      click to upload
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
                {children}
              </div>
            );
          },
          FilePicker({ onClick }) {
            React.useEffect(() => {
              const el = document.getElementById(
                "amplify-fileuploader-click-to-upload"
              );
              if (el && typeof onClick === "function") {
                const handler = (e: Event) => {
                  if (typeof onClick === "function") {
                    onClick(
                      e as unknown as React.MouseEvent<
                        HTMLButtonElement,
                        MouseEvent
                      >
                    );
                  }
                };
                el.addEventListener("click", handler);
                return () => {
                  el.removeEventListener("click", handler);
                };
              }
              return undefined;
            }, [onClick]);

            if (selectedFile) return null;

            return (
              <Button
                onClick={onClick}
                variant="outline"
                className="mt-4"
                type="button"
              >
                Select File
              </Button>
            );
          },
          FileList({ files, onCancelUpload, onDeleteUpload }) {
            React.useEffect(() => {
              const fileObj = files.find((f) => f.file)?.file || null;
              setSelectedFile(fileObj);
            }, [files]);

            const fileData = files.find((f) => f.file);
            if (fileData && fileData.file) {
              const { file, key, progress, id, status, uploadTask } = fileData;

              return (
                <div className="space-y-4">
                  <div className="relative aspect-video w-full overflow-hidden rounded-md border border-input bg-transparent dark:bg-input/30 shadow-xs">
                    <Image
                      src={URL.createObjectURL(file)}
                      alt={key || "uploaded file"}
                      fill
                      className="object-scale-down"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />

                    {/* Loading overlay */}
                    {progress !== undefined && progress < 100 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                        <div className="w-full max-w-sm px-6 space-y-3">
                          <div className="text-center">
                            <p className="text-sm font-medium text-white mb-2">
                              Uploading...
                            </p>
                            <p className="text-xs text-white/80">
                              {Math.round(progress)}% complete
                            </p>
                          </div>
                          <Progress
                            value={progress}
                            className="w-full h-2 bg-white/20"
                          />
                        </div>
                      </div>
                    )}

                    {/* Success overlay */}
                    {progress === 100 && (
                      <div className="absolute inset-0 bg-green-500/10 flex items-center justify-center">
                        <div className="bg-green-500 rounded-full p-2">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    )}

                    {/* Remove button */}
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8"
                      type="button"
                      onClick={() => {
                        if (uploadTask && status === "uploading") {
                          onCancelUpload({ id, uploadTask });
                        } else {
                          onDeleteUpload({ id });
                        }
                        setSelectedFile(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* File info */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">{file.name}</p>
                      <p className="text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    {progress === 100 && status !== "uploading" && (
                      <div className="flex items-center text-green-600">
                        <Check className="h-4 w-4 mr-1" />
                        <span className="text-xs">Uploaded</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            }
            return null;
          },
        }}
      />
    </div>
  );
}
