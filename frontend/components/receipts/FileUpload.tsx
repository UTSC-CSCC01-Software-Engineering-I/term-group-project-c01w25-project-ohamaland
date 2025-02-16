import React, { useState } from "react";
import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";

registerPlugin(FilePondPluginFileValidateType);

interface FilePondUploadProps {
  setImageUrl: (url: string) => void;
}

export default function FilePondUpload({ setImageUrl }: FilePondUploadProps) {
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  // Simulate setting the image URL (e.g., hardcoded URL for now)
  const handleFileUpload = (file: File) => {
    const fileReader = new FileReader();
    fileReader.onloadend = () => {
      const imageUrl = fileReader.result as string; // Simulate the image URL
      setImageUrl(imageUrl);
      setFileUrl(imageUrl); // Simulate the file being uploaded and displayed
    };
    fileReader.readAsDataURL(file); // This reads the file as a data URL
  };

  return (
    <div>
      <FilePond
        allowMultiple={false}
        maxFiles={1}
        name="file"
        server={null} // No server endpoint as we're hardcoding
        labelIdle='Drag & Drop your receipt or <span class="filepond--label-action">Browse</span>'
        onupdatefiles={(fileItems) => {
          const file = fileItems[0]?.file as File; // Cast the file to a `File` type
          if (file) {
            handleFileUpload(file); // Call to simulate file upload
          }
        }}
      />

      {/* Display the uploaded image or a fallback text */}
      {fileUrl ? (
        <img src={fileUrl} alt="Uploaded receipt" width={200} />
      ) : (
        <p>No receipt uploaded yet.</p>
      )}
    </div>
  );
}