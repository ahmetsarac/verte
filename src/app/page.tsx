'use client';

import { useState, useEffect } from 'react';
import { initializeFFmpeg, convertVideo, cleanupFFmpeg } from '@/lib/ffmpeg';
import { Header } from '@/components/Header';
import { InfoBanner } from '@/components/InfoBanner';
import { FileUpload } from '@/components/FileUpload';
import { ConversionSettings } from '@/components/ConversionSettings';
import { VideoPreview } from '@/components/VideoPreview';

interface ConversionResult {
  url: string;
  format: string;
}

export default function VideoConverterPage() {
  const [file, setFile] = useState<File | null>(null);
  const [outputFormat, setOutputFormat] = useState<string>('mp4');
  const [useMultiThread, setUseMultiThread] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ value: number, text: string }>({value: 0, text:""});
  const [isConverting, setIsConverting] = useState(false);
  const [convertedResults, setConvertedResults] = useState<Record<string, ConversionResult>>({});
  const [threadCount, setThreadCount] = useState<number | null>(null);
  const [initError, setInitError] = useState<string | null>(null);

  const currentConvertedURL = convertedResults[outputFormat]?.url || null;

  useEffect(() => {
    const load = async () => {
      try {
        setInitError(null);
        const result = await initializeFFmpeg(useMultiThread);
        setThreadCount(result.threads);
        
        if (result.fallbackToSingle) {
          setUseMultiThread(false);
          setInitError("Multi-thread processing is not supported in this browser. Switched to single-thread mode.");
        }
      } catch (error) {
        setInitError("Failed to initialize video converter. Please try refreshing the page.");
      }
    }
    load()
  }, [useMultiThread]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setConvertedResults({});
    }
  };

  const handleFormatChange = (format: string) => {
    setOutputFormat(format);
  };

  const handleConvert = async () => {
    if (!file) return alert('Please select a file to convert.');

    try {
      setIsConverting(true);
      setProgress({ value: 0, text: '' });

      const result = await convertVideo(file, outputFormat, setProgress, useMultiThread);
      
      setConvertedResults(prev => ({
        ...prev,
        [outputFormat]: {
          url: result,
          format: outputFormat
        }
      }));
    } catch (error) {
      console.error('Conversion error:', error);
      alert('An error occurred during conversion.');
    } finally {
      setIsConverting(false);
    }
  };

  const handleCancel = async () => {
    try {
      setIsConverting(false);
      setProgress({ value: 0, text: '' });
      await cleanupFFmpeg();
    } catch (error) {
      console.error('Error canceling conversion:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-background to-muted/20">
      <div className="w-full flex justify-center">
        <Header />
      </div>
      <main className="flex-1 container py-4 px-4 md:py-6 md:px-6 flex flex-col items-center">
        <div className="w-full max-w-[1400px]">
          <InfoBanner />
          {initError && (
            <div className="mb-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-sm text-yellow-700 dark:text-yellow-400">
              <div className="flex gap-2 items-center">
                <svg 
                  className="h-5 w-5 flex-shrink-0" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p>{initError}</p>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6 h-[calc(100vh-12rem)] max-h-[900px]">
            <div className="lg:col-span-2 flex flex-col gap-4 md:gap-6 order-2 lg:order-1">
              <FileUpload
                file={file}
                isConverting={isConverting}
                onFileChange={handleFileChange}
              />
              
              <ConversionSettings
                outputFormat={outputFormat}
                useMultiCore={useMultiThread}
                isConverting={isConverting}
                progress={progress}
                threadCount={threadCount}
                onFormatChange={handleFormatChange}
                onMultiCoreChange={setUseMultiThread}
                onConvert={handleConvert}
                onCancel={handleCancel}
                file={file}
                disabled={isConverting}
              />
            </div>

            <div className="lg:col-span-3 bg-card rounded-xl border shadow-sm p-4 md:p-6 flex flex-col min-h-[300px] lg:min-h-0 order-1 lg:order-2">
              <VideoPreview
                file={file}
                convertedFileURL={currentConvertedURL}
                outputFormat={outputFormat}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
