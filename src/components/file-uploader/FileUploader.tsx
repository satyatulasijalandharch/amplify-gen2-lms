import {
  DropZone,
  ThemeProvider,
  VisuallyHidden,
  createTheme,
} from "@aws-amplify/ui-react";
import { CheckCircleIcon, CloudUploadIcon, XCircle } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";

const theme = createTheme({
  name: "dropzone-theme",
  tokens: {
    components: {
      dropzone: {
        backgroundColor: "color-mix(in oklab, var(--input) 30%, transparent)",
        borderColor: "var(--input)",
      },
    },
  },
});

const acceptedFileTypes = ["image/png", "image/jpeg"];

export function FileUploader({
  onFileChange,
  value,
}: {
  onFileChange?: (files: File[]) => void;
  value?: string;
}) {
  const hiddenInput = React.useRef<HTMLInputElement | null>(null);

  const handleFiles = (selectedFiles: File[]) => {
    if (onFileChange) {
      onFileChange(selectedFiles);
    }
  };

  const onFilePickerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    if (!files || files.length === 0) {
      handleFiles([]);
      return;
    }
    handleFiles(Array.from(files));
  };

  return (
    <ThemeProvider theme={theme}>
      <DropZone
        acceptedFileTypes={acceptedFileTypes}
        onDropComplete={({ acceptedFiles }) => {
          handleFiles(acceptedFiles);
        }}
      >
        <div className="text-center">
          <div className="flex items-center justify-center mx-auto size-12 rounded-full bg-muted mb-4">
            <DropZone.Accepted>
              <CheckCircleIcon className="size-6 text-muted-foreground" />
            </DropZone.Accepted>
            <DropZone.Rejected>
              <XCircle className="size-6 text-muted-foreground" />
            </DropZone.Rejected>
            <DropZone.Default>
              <CloudUploadIcon className="size-6 text-muted-foreground" />
            </DropZone.Default>
          </div>
          <p className="text-base font-semibold text-foreground">
            Drop image here
          </p>
          <Button
            className="mt-4"
            type="button"
            onClick={() => hiddenInput.current && hiddenInput.current.click()}
          >
            Browse
          </Button>
          {value && (
            <div className="mt-2 text-xs text-muted-foreground">
              Selected: {value}
            </div>
          )}
        </div>
        <VisuallyHidden>
          <input
            type="file"
            tabIndex={-1}
            ref={hiddenInput}
            onChange={onFilePickerChange}
            multiple={false}
            accept={acceptedFileTypes.join(",")}
          />
        </VisuallyHidden>
      </DropZone>
    </ThemeProvider>
  );
}
