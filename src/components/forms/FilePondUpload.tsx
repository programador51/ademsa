"use client";

import { Box, Typography } from "@mui/material";
import { FilePond, registerPlugin } from "react-filepond";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond/dist/filepond.min.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";

registerPlugin(FilePondPluginImagePreview);

interface FilePondUploadProps {
  label?: string;
  files: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
}

export default function FilePondUpload({
  label = "Imágenes",
  files,
  onChange,
  maxFiles = 5,
}: FilePondUploadProps) {
  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {label}
      </Typography>
      <FilePond
        files={files}
        onupdatefiles={(items) => {
          onChange(
            items
              .map((item) => item.file)
              .filter((file): file is File => file instanceof File)
          );
        }}
        allowMultiple
        maxFiles={maxFiles}
        acceptedFileTypes={["image/*"]}
        labelIdle='Arrastra imágenes o <span class="filepond--label-action">Explorar</span>'
        credits={false}
      />
    </Box>
  );
}
