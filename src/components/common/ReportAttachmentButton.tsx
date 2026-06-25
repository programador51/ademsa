"use client";

import { Box, Button } from "@mui/material";
import ImageIcon from "@mui/icons-material/Image";
import { BaserowFile } from "@/lib/baserow/types";

export default function ReportAttachmentButton({
  image,
  index,
}: {
  image: BaserowFile;
  index: number;
}) {
  const label = image.name?.trim() || `Archivo ${index + 1}`;

  return (
    <Button
      size="small"
      variant="outlined"
      startIcon={<ImageIcon sx={{ flexShrink: 0 }} />}
      component="a"
      href={image.url}
      target="_blank"
      rel="noopener noreferrer"
      title={label}
      sx={{
        maxWidth: "100%",
        minWidth: 0,
        flex: "1 1 140px",
        justifyContent: "flex-start",
        overflow: "hidden",
      }}
    >
      <Box
        component="span"
        sx={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          minWidth: 0,
        }}
      >
        {label}
      </Box>
    </Button>
  );
}
