import { Info } from 'lucide-react';

export function InfoBanner() {
  return (
    <div className="mb-4 md:mb-6 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 md:p-4 text-sm">
      <div className="flex gap-2 items-start md:items-center text-blue-700 dark:text-blue-400">
        <Info className="h-5 w-5 flex-shrink-0 mt-0.5 md:mt-0" />
        <p className="flex-1">
          This app processes videos directly in your browser. Your files are never uploaded to any server, ensuring complete privacy.
        </p>
      </div>
    </div>
  );
} 