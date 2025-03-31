import { fetchWithAuth, receiptsUploadApi } from "@/utils/api";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import "filepond/dist/filepond.min.css";
import { useState } from "react";
import { FilePond, registerPlugin } from "react-filepond";

registerPlugin(FilePondPluginFileValidateType);

interface FilePondUploadProps {
  setImageUrl: (url: string) => void;
  setFile: (file: File) => void;
  onOcrDataExtracted: (ocrData: any) => void;
}

export default function FilePondUpload({
  setImageUrl,
  setFile,
  onOcrDataExtracted
}: FilePondUploadProps) {
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    setFile(file);

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

      setImageUrl(data.receipt_image_url);
      setFileUrl(data.receipt_image_url);
      onOcrDataExtracted(data);
    } catch (err) {
      console.error("OCR upload error:", err);
      alert("Failed to upload and process receipt.");
    }
  };

  return (
    <div>
      <FilePond
        allowMultiple={false}
        maxFiles={1}
        name="file"
        server={null}
        labelIdle='Drag & Drop your receipt or <span class="filepond--label-action">Browse</span>'
        onupdatefiles={(fileItems) => {
          const file = fileItems[0]?.file as File;
          if (file) {
            handleFileUpload(file);
          }
        }}
      />

      {fileUrl ? (
        <img src={fileUrl} alt="Uploaded receipt" width={200} />
      ) : (
        <p>No receipt uploaded yet.</p>
      )}
    </div>
  );
}
