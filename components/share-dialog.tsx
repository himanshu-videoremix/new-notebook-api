'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';
import { Link, Copy, Check } from 'lucide-react';

interface ShareDialogProps {
  contentId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareDialog({ contentId, isOpen, onClose }: ShareDialogProps) {
  const [accessType, setAccessType] = useState<'view' | 'edit'>('view');
  const [expiresIn, setExpiresIn] = useState('never');
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [password, setPassword] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const handleShare = async () => {
    try {
      const response = await api.shareContent(contentId, {
        accessType,
        expiresIn: expiresIn === 'never' ? undefined : parseInt(expiresIn),
        password: isPasswordProtected ? password : undefined
      });

      setShareLink(response.shareUrl);
      toast({
        title: "Share link created",
        description: "The share link has been generated successfully"
      });
    } catch (error) {
      toast({
        title: "Share failed",
        description: "Failed to create share link",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      toast({
        title: "Copied",
        description: "Share link copied to clipboard"
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy link to clipboard",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-indigo-900/95 to-indigo-800/95 backdrop-blur-lg border-indigo-700/50 shadow-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
            <Link className="w-5 h-5" />
            Share Content
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Access Type</Label>
            <Select value={accessType} onValueChange={(value: 'view' | 'edit') => setAccessType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select access type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="view">View only</SelectItem>
                <SelectItem value="edit">Can edit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Link Expiration</Label>
            <Select value={expiresIn} onValueChange={setExpiresIn}>
              <SelectTrigger>
                <SelectValue placeholder="Select expiration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="never">Never expires</SelectItem>
                <SelectItem value="3600">1 hour</SelectItem>
                <SelectItem value="86400">24 hours</SelectItem>
                <SelectItem value="604800">7 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label>Password Protection</Label>
            <Switch
              checked={isPasswordProtected}
              onCheckedChange={setIsPasswordProtected}
            />
          </div>

          {isPasswordProtected && (
            <div className="grid gap-2">
              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-secondary/50 border-border/50"
              />
            </div>
          )}

          {shareLink && (
            <div className="grid gap-2">
              <Label>Share Link</Label>
              <div className="flex gap-2">
                <Input
                  value={shareLink}
                  readOnly
                  className="bg-secondary/50 border-border/50"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyToClipboard}
                  className="bg-secondary/50 border-border/50"
                >
                  {isCopied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-secondary/50 border-border/50"
          >
            Cancel
          </Button>
          <Button onClick={handleShare}>
            Generate Link
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}