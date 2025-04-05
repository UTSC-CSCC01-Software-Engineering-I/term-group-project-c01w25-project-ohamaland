import { fetchWithAuth, receiptsUploadApi } from "@/utils/api";
import { Box, CircularProgress } from "@mui/material";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import "filepond/dist/filepond.min.css";
import { useState } from "react";
import { FilePond, registerPlugin } from "react-filepond";
import Image from "next/image";

registerPlugin(FilePondPluginFileValidateType);

interface FilePondUploadProps {
  setFile: (file: File) => void;
  onOcrDataExtracted: (ocrData: any) => void;
}

export default function FilePondUpload({
  setFile,
  onOcrDataExtracted
}: FilePondUploadProps) {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (file: File) => {
    setFile(file);
    setIsProcessing(true);

    const formData = new FormData();
    formData.append("receipt_image", file);

    try {
      const response = await fetchWithAuth(receiptsUploadApi, {
        method: "POST",
        body: formData,
        headers: {}
      });

      if (!response || !response.ok) {
        const errorData = await response?.json();
        console.error("Receipt OCR upload failed:", errorData);
        throw new Error("Failed to upload and process receipt");
      }

      const data = await response.json();

      setFileUrl(data.receipt_image_url);
      onOcrDataExtracted(data);
    } catch (err) {
      console.error("OCR upload error:", err);
      alert("Failed to upload and process receipt.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Box>
      <FilePond
        allowMultiple={false}
        maxFiles={1}
        name="file"
        credits={false}
        server={null}
        labelIdle='Drag & Drop Your Receipt or <span class="filepond--label-action">Browse</span>'
        onupdatefiles={(fileItems) => {
          const file = fileItems[0]?.file as File;
          if (file) {
            handleFileUpload(file);
          }
        }}
      />

      {isProcessing ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginTop: "8px"
          }}
        >
          <CircularProgress size={20} />
          <span>Processing receipt...</span>
        </div>
      ) : fileUrl ? (
        <Image src={fileUrl} alt="Uploaded receipt" width={200} height={200} />
      ) : (
        <p>No receipt uploaded yet.</p>
      )}
    </Box>
  );
}
