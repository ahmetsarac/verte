import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;
let currentThreadCount: number | null = null;

export const initializeFFmpeg = async (useMultiThread: boolean = false): Promise<{ threads: number; fallbackToSingle?: boolean }> => {
  const targetThreads = useMultiThread ? navigator.hardwareConcurrency || 4 : 1;
  
  try {
    if (ffmpeg && currentThreadCount !== targetThreads) {
      await cleanupFFmpeg();
    }

    if (!ffmpeg) {
      const baseURL = useMultiThread 
        ? 'https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/umd'
        : 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      
      ffmpeg = new FFmpeg();
      
      try {
        const config: any = {
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        };

        if (useMultiThread) {
          config.workerURL = await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript');
        }

        await ffmpeg.load(config);
        currentThreadCount = targetThreads;
      } catch (error) {
        console.error('Failed to initialize FFmpeg:', error);
        
        if (useMultiThread) {
          await cleanupFFmpeg();
          ffmpeg = new FFmpeg();
          const singleThreadConfig = {
            coreURL: await toBlobURL('https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js', 'text/javascript'),
            wasmURL: await toBlobURL('https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm', 'application/wasm'),
          };
          await ffmpeg.load(singleThreadConfig);
          currentThreadCount = 1;
          return { threads: 1, fallbackToSingle: true };
        } else {
          throw error;
        }
      }
    }

    return { threads: currentThreadCount || targetThreads };
  } catch (error) {
    console.error('FFmpeg initialization error:', error);
    throw error;
  }
};

const getFormatSpecificSettings = (format: string, threadCount: number) => {
  const isChrome = navigator.userAgent.indexOf("Chrome") > -1;
  
  switch (format.toLowerCase()) {
    case 'mp4':
      return ['-c:v', 'libx264', '-c:a', 'aac'];
    case 'webm':
      return [
        '-c:v', 'libvpx',
        '-c:a', 'libvorbis',
        '-quality', 'realtime',
        '-cpu-used', '5',
        '-threads', threadCount.toString(),
        '-deadline', 'realtime',
        '-error-resilient', '1',
        '-auto-alt-ref', '0',
        '-lag-in-frames', '0',
        '-frame-parallel', '0',
        '-tile-columns', '0',
        '-row-mt', '0'
      ];
    case 'avi':
      if (isChrome) {
        return [
          '-c:v', 'mpeg4',
          '-c:a', 'mp3',
          '-q:v', '6',
          '-g', '300',
          '-bf', '0',
          '-threads', threadCount.toString(),
          '-flags', '+aic+mv4'
        ];
      }
      return ['-c:v', 'mpeg4', '-c:a', 'mp3'];
    case 'mkv':
      return ['-c:v', 'libx264', '-c:a', 'aac'];
    default:
      return ['-c:v', 'libx264', '-c:a', 'aac'];
  }
};

export const convertVideo = async (
  inputFile: File,
  outputFormat: string,
  onProgress?: (progress: {value: number, text: string}) => void,
  useMultiThread: boolean = false
): Promise<string> => {
  try {
    await cleanupFFmpeg();
    const initResult = await initializeFFmpeg(useMultiThread);
    const threadCount = useMultiThread ? navigator.hardwareConcurrency || 4 : 1;
    
    if (initResult.fallbackToSingle) {
      throw new Error('Multi-thread mode failed, please try single-thread mode');
    }

    if (!ffmpeg) {
      throw new Error('FFmpeg failed to initialize');
    }

    ffmpeg.on('progress', ({ progress, time }) => {
      onProgress && onProgress({
        value: progress * 100, 
        text: `${(progress * 100).toFixed(0)}% (transcoded time: ${(time / 1000000).toFixed(1)} s)`
      });
    });

    ffmpeg.on('log', ({ message }) => {
      console.log('FFmpeg Log:', message);
    });

    const inputFileName = `input.${inputFile.name.split('.').pop()}`;
    const outputFileName = `output.${outputFormat}`;

    console.log('Writing input file...');
    await ffmpeg.writeFile(inputFileName, await fetchFile(inputFile));

    const formatSettings = getFormatSpecificSettings(outputFormat, threadCount);
    const ffmpegArgs = [
      '-i', inputFileName,
    ];

    if (outputFormat === 'webm') {
      console.log(`Using ${threadCount} threads for WebM conversion`);
    } else {
      const isChrome = navigator.userAgent.indexOf("Chrome") > -1;
      const threadParam = isChrome ? threadCount.toString() : (useMultiThread ? '0' : '1');
      console.log(`Using ${threadParam === '0' ? 'auto' : threadParam} threads for ${outputFormat} conversion`);
      ffmpegArgs.push('-threads', threadParam);
    }

    ffmpegArgs.push(...formatSettings, outputFileName);

    console.log('Starting conversion with args:', ffmpegArgs);
    await ffmpeg.exec(ffmpegArgs);
    console.log('Conversion completed');

    const output = await ffmpeg.readFile(outputFileName);
    const url = URL.createObjectURL(new Blob([output], { type: `video/${outputFormat}` }));
    console.log('Created URL for converted file');
    return url;
  } catch (error) {
    console.error('Detailed conversion error:', error);
    await cleanupFFmpeg();
    
    if (error instanceof Error) {
      if (error.message.includes('multithread')) {
        throw new Error('Multi-thread conversion failed. Please try single-thread mode.');
      } else {
        throw new Error(`Conversion failed: ${error.message}`);
      }
    }
    throw error;
  }
};

export const cleanupFFmpeg = async (): Promise<void> => {
  if (ffmpeg) {
    try {
      await ffmpeg.terminate();
    } catch (error) {
      console.error('Error during FFmpeg cleanup:', error);
    } finally {
      ffmpeg = null;
      currentThreadCount = null;
    }
  }
};
