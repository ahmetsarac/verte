import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { AlertTriangle, Loader2 } from 'lucide-react';

interface ConversionSettingsProps {
  outputFormat: string;
  useMultiCore: boolean;
  isConverting: boolean;
  progress: { value: number; text: string };
  threadCount: number | null;
  onFormatChange: (value: string) => void;
  onMultiCoreChange: (value: boolean) => void;
  onConvert: () => void;
  onCancel: () => void;
  file: File | null;
  disabled?: boolean;
}

export function ConversionSettings({
  outputFormat,
  useMultiCore,
  isConverting,
  progress,
  threadCount,
  onFormatChange,
  onMultiCoreChange,
  onConvert,
  onCancel,
  file,
  disabled = false
}: ConversionSettingsProps) {
  return (
    <div className="bg-card rounded-xl border shadow-sm p-4 md:p-6 space-y-4 md:space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Convert Settings</h2>
        <div className="mb-4 md:mb-6">
          <label className="text-sm text-muted-foreground mb-2 block">Output Format</label>
          <Select 
            onValueChange={onFormatChange} 
            defaultValue={outputFormat}
            disabled={disabled}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose Format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mp4">MP4</SelectItem>
              <SelectItem value="webm">WebM</SelectItem>
              <SelectItem value="avi">AVI</SelectItem>
              <SelectItem value="mkv">MKV</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <label className="text-sm text-muted-foreground">Processing Mode</label>
          <RadioGroup 
            defaultValue={useMultiCore ? "multi" : "single"}
            onValueChange={(value) => onMultiCoreChange(value === "multi")}
            disabled={disabled}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="single" id="single" />
              <Label htmlFor="single" className="cursor-pointer">Single-thread (Recommended)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="multi" id="multi" />
              <Label htmlFor="multi" className="cursor-pointer">Multi-thread (Beta)</Label>
            </div>
          </RadioGroup>

          {threadCount !== null && useMultiCore && (
            <div className="text-sm text-muted-foreground">
              Using {threadCount} threads
            </div>
          )}
          
          {useMultiCore && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-md p-3 text-sm text-yellow-700 dark:text-yellow-400">
              <div className="flex gap-2">
                <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <p className="flex-1">
                  Multi-thread processing may cause issues with some video formats and browsers. If you experience problems, please switch back to single-thread mode.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {isConverting && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm text-muted-foreground">Converting...</label>
            <span className="text-sm font-medium">{progress.value}%</span>
          </div>
          <Progress value={progress.value} className="h-2" />
          <p className="text-sm text-muted-foreground">{progress.text}</p>
          {progress.value === 0 && (
            <Button 
              onClick={onCancel}
              variant="destructive"
              className="w-full mt-2"
              size="sm"
            >
              Cancel Conversion
            </Button>
          )}
        </div>
      )}

      <Button 
        onClick={onConvert} 
        disabled={!file || isConverting} 
        className="w-full"
        size="lg"
      >
        {isConverting ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Converting...
          </span>
        ) : 'Convert Video'}
      </Button>
    </div>
  );
} 