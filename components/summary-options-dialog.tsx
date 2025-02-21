import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SummaryOptionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (options: {
    length: 'short' | 'medium' | 'long';
    format: 'paragraph' | 'bullet';
    focus: 'overview' | 'key_points';
    includeKeyPoints: boolean;
  }) => void;
}

export function SummaryOptionsDialog({
  isOpen,
  onClose,
  onConfirm
}: SummaryOptionsDialogProps) {
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [format, setFormat] = useState<'paragraph' | 'bullet'>('paragraph');
  const [focus, setFocus] = useState<'overview' | 'key_points'>('overview');
  const [includeKeyPoints, setIncludeKeyPoints] = useState(true);

  const handleConfirm = () => {
    onConfirm({
      length,
      format,
      focus,
      includeKeyPoints
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-secondary/90 border-border/50">
        <DialogHeader>
          <DialogTitle>Summary Options</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="length">Length</Label>
            <Select value={length} onValueChange={(value: 'short' | 'medium' | 'long') => setLength(value)}>
              <SelectTrigger id="length">
                <SelectValue placeholder="Select length" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short">Short (1-2 paragraphs)</SelectItem>
                <SelectItem value="medium">Medium (2-3 paragraphs)</SelectItem>
                <SelectItem value="long">Long (3-4 paragraphs)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="format">Format</Label>
            <Select value={format} onValueChange={(value: 'paragraph' | 'bullet') => setFormat(value)}>
              <SelectTrigger id="format">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paragraph">Paragraphs</SelectItem>
                <SelectItem value="bullet">Bullet Points</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="focus">Focus</Label>
            <Select value={focus} onValueChange={(value: 'overview' | 'key_points') => setFocus(value)}>
              <SelectTrigger id="focus">
                <SelectValue placeholder="Select focus" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">General Overview</SelectItem>
                <SelectItem value="key_points">Key Points</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="includeKeyPoints"
              checked={includeKeyPoints}
              onChange={(e) => setIncludeKeyPoints(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="includeKeyPoints">Include key points</Label>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            Apply
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}