import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/dropzone";
import { useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";

export default function FileUpload() {
  const { getToken } = useAuth();
  const [files, setFiles] = useState<File[] | undefined>();

  const handleDrop = async (files: File[]) => {
    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append("file", files[0]);
      const res = await axios.post(
        "http://localhost:3000/api/chat",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      console.log(res.data);
      setFiles(files);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <Dropzone
      accept={{ "application/pdf": [] }}
      maxFiles={1}
      maxSize={1024 * 1024 * 10}
      onDrop={handleDrop}
      onError={console.error}
      src={files}
    >
      <DropzoneEmptyState />
      <DropzoneContent />
    </Dropzone>
  );
}
