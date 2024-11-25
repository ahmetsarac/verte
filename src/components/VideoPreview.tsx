import { Button } from '@/components/ui/button';
import { useMemo } from 'react';
import { Download, Info, Video } from 'lucide-react';

interface VideoPreviewProps {
  file: File | null;
  convertedFileURL: string | null;
  outputFormat: string;
}

export function VideoPreview({ file, convertedFileURL, outputFormat }: VideoPreviewProps) {
  const isPreviewSupported = (format: string): boolean => {
    const supportedFormats = ['mp4', 'webm'];
    return supportedFormats.includes(format.toLowerCase());
  };

  const videoURL = useMemo(() => 
    file ? URL.createObjectURL(file) : null
  , [file]);

  const videoContainerStyle = "flex-1 flex items-center justify-center bg-muted/50 rounded-lg overflow-hidden min-h-0";
  const videoStyle = "max-h-full max-w-full w-auto h-auto object-contain rounded-md";

  if (convertedFileURL) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 className="text-lg font-semibold">Converted Video</h2>
          <Button asChild variant="default" size="default">
            <a
              href={convertedFileURL}
              download={`converted.${outputFormat}`}
              className="flex items-center gap-2 font-medium"
            >
              <Download className="h-5 w-5" />
              Download {outputFormat.toUpperCase()}
            </a>
          </Button>
        </div>
        {isPreviewSupported(outputFormat) ? (
          <div className={videoContainerStyle}>
            <video 
              src={convertedFileURL}
              controls 
              className={videoStyle}
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-4">
            <Info className="h-16 w-16 text-muted-foreground/50" />
            <p className="text-lg">Preview not available</p>
            <p className="text-sm text-muted-foreground/80">
              Preview is not supported for {outputFormat.toUpperCase()} format.
              Please download the file to view it.
            </p>
          </div>
        )}
      </div>
    );
  }

  if (file) {
    return (
      <div className="flex flex-col h-full">
        <h2 className="text-lg font-semibold mb-4 flex-shrink-0">Original Video</h2>
        <div className={videoContainerStyle}>
          <video 
            src={videoURL || undefined}
            controls 
            className={videoStyle}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-4">
      <Video className="h-16 w-16 text-muted-foreground/50" />
      <p className="text-lg">Select a video to get started</p>
      <p className="text-sm text-muted-foreground/80">
        Supported formats: MP4, WebM, AVI, MKV
      </p>
    </div>
  );
} 