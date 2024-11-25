import { Upload } from "lucide-react";

interface FileUploadProps {
  file: File | null;
  isConverting: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function FileUpload({ file, isConverting, onFileChange }: FileUploadProps) {
  return (
    <div className="bg-card rounded-xl border shadow-sm p-4 md:p-6">
      <h2 className="text-lg font-semibold mb-4">Upload Video</h2>
      <div className="border-2 border-dashed border-muted rounded-xl p-4 md:p-8 text-center transition-colors hover:border-primary/50">
        <input
          type="file"
          accept="video/*"
          onChange={onFileChange}
          className="hidden"
          id="video-input"
          disabled={isConverting}
        />
        <label
          htmlFor="video-input"
          className="cursor-pointer flex flex-col items-center"
        >
          <Upload
            className="h-10 md:h-12 w-10 md:w-12 text-muted-foreground mb-4"
          />
          <span className="text-muted-foreground font-medium text-sm md:text-base">
            {file 
              ? file.name 
              : isConverting 
                ? 'Converting...' 
                : 'Click to select or drag a video file'}
          </span>
          {file && (
            <span className="text-xs md:text-sm text-muted-foreground/80 mt-2">
              {(file.size / (1024 * 1024)).toFixed(2)} MB
            </span>
          )}
        </label>
      </div>
    </div>
  );
} 