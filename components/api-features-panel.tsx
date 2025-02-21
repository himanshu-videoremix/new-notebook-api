import { useState } from 'react';
import { useApiFeatures } from '@/hooks/use-api-features';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Settings, RefreshCw, Globe } from 'lucide-react';

interface ApiFeaturesProps {
  selectedSources: string[];
}

export function ApiFeaturesPanel({ selectedSources }: ApiFeaturesProps) {
  const [webhookUrl, setWebhookUrl] = useState('');
  const api = useApiFeatures();

  const handleSetWebhook = async () => {
    if (!webhookUrl) return;
    await api.setWebhook(webhookUrl);
  };

  return (
    <div className="space-y-4">
      {/* API Configuration */}
      <Card className="p-4 bg-secondary/50 border-border/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded bg-[#2B2D31] flex items-center justify-center">
            <Settings className="w-5 h-5 text-[#5865F2]" />
          </div>
          <div>
            <h4 className="text-[14px] font-medium text-[#F2F3F5]">API Settings</h4>
            <p className="text-[12px] text-[#B5BAC1]">Configure API endpoints</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Webhook URL</Label>
            <div className="flex gap-2">
              <Input
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://your-webhook.com"
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={handleSetWebhook}
                className="shrink-0"
              >
                <Globe className="w-4 h-4 mr-2" />
                Set Webhook
              </Button>
            </div>
          </div>

          <div>
            <Label>API Status</Label>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                api.error ? 'bg-destructive' : 'bg-green-500'
              }`} />
              <span className="text-sm text-muted-foreground">
                {api.error ? 'Error' : 'Connected'}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* API Usage */}
      <Card className="p-4 bg-secondary/50 border-border/50">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-[14px] font-medium text-[#F2F3F5]">API Usage</h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={api.getUsage}
            disabled={api.isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${
              api.isLoading ? 'animate-spin' : ''
            }`} />
          </Button>
        </div>

        {api.data?.usage && (
          <div className="space-y-2">
            <Progress
              value={(api.data.usage.used / api.data.usage.limit) * 100}
              className="h-2"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{api.data.usage.used} requests used</span>
              <span>{api.data.usage.limit} limit</span>
            </div>
          </div>
        )}
      </Card>

      {/* Recent Content */}
      <Card className="p-4 bg-secondary/50 border-border/50">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-[14px] font-medium text-[#F2F3F5]">Recent Content</h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={api.getContentList}
            disabled={api.isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${
              api.isLoading ? 'animate-spin' : ''
            }`} />
          </Button>
        </div>

        {api.data?.contents && (
          <div className="space-y-2">
            {api.data.contents.map((content: any) => (
              <div
                key={content.id}
                className="flex justify-between items-center p-2 rounded bg-secondary/30"
              >
                <span className="text-sm">{content.type}</span>
                <span className="text-sm text-muted-foreground">
                  {api.status[content.id] || content.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}