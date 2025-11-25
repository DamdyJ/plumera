import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/dropzone";

interface PdfUploadProps {
  value?: File | null;
  onChange: (file: File | null) => void;
  onError: (error?: Error | null) => void;
}

export default function PdfUpload({
  value,
  onChange,
  onError,
}: PdfUploadProps) {
  const handleDrop = async (files: File[]) => {
    if (files.length > 0) {
      onChange(files[0]);
    } else {
      onChange(null);
    }
  };
  return (
    <Dropzone
      accept={{ "application/pdf": [] }}
      maxFiles={1}
      maxSize={1024 * 1024 * 10}
      onDrop={handleDrop}
      onError={onError}
      src={value ? [value] : undefined}
    >
      <DropzoneEmptyState />
      <DropzoneContent />
    </Dropzone>
  );
}
