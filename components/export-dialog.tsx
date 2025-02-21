'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { autoContentApi } from '@/lib/api';
import { FileDown, FileText, FileCode } from 'lucide-react';

interface ExportDialogProps {
  contentId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ExportDialog({ contentId, isOpen, onClose }: ExportDialogProps) {
  const [format, setFormat] = useState<'pdf' | 'docx' | 'md'>('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await autoContentApi.exportStudioContent(contentId, format);
      
      // Create download link
      const blob = new Blob([response], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Export complete",
        description: `Content exported as ${format.toUpperCase()}`
      });
      onClose();
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export content",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-blue-900/95 to-blue-800/95 backdrop-blur-lg border-blue-700/50 shadow-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            <FileDown className="w-5 h-5" />
            Export Content
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Select value={format} onValueChange={(value: 'pdf' | 'docx' | 'md') => setFormat(value)}>
              <SelectTrigger className="bg-secondary/50 border-border/50">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  PDF Document
                </SelectItem>
                <SelectItem value="docx" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Word Document
                </SelectItem>
                <SelectItem value="md" className="flex items-center gap-2">
                  <FileCode className="w-4 h-4" />
                  Markdown
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="bg-secondary/50 border-border/50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              disabled={isExporting}
            >
              {isExporting ? 'Exporting...' : 'Export'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}