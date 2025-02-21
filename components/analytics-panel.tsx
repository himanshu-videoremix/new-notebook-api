'use client';

import { useState, useEffect } from 'react';
import { BarChart, Activity, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useApiFeatures } from '@/hooks/use-api-features';
import { api } from '@/lib/api';

export function AnalyticsPanel() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const apiFeatures = useApiFeatures();

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const usage = await apiFeatures.getUsage();
        const contents = await apiFeatures.getContentList();
        
        setAnalytics({
          usage,
          contents,
          types: {
            study_guide: contents.filter(c => c.type === 'study_guide').length,
            deep_dive: contents.filter(c => c.type === 'deep_dive').length,
            faq: contents.filter(c => c.type === 'faq').length
          }
        });
      } catch (error) {
        toast({
          title: "Failed to load analytics",
          description: "Could not fetch analytics data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse bg-secondary/50 h-32 rounded-lg" />
        <div className="animate-pulse bg-secondary/50 h-32 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-secondary/50 border-border/50">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-medium">Usage Overview</h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-semibold text-foreground">
              {analytics?.usage?.total || 0}
            </div>
            <div className="text-xs text-muted-foreground">Total Requests</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-foreground">
              {analytics?.usage?.average_time || '0ms'}
            </div>
            <div className="text-xs text-muted-foreground">Avg. Response Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-foreground">
              {analytics?.usage?.success_rate || '0%'}
            </div>
            <div className="text-xs text-muted-foreground">Success Rate</div>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-secondary/50 border-border/50">
        <div className="flex items-center gap-2 mb-4">
          <BarChart className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-medium">Generation Stats</h3>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Study Guides</span>
            <span className="text-sm font-medium">{analytics?.types?.study_guide || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Deep Dives</span>
            <span className="text-sm font-medium">{analytics?.types?.deep_dive || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">FAQs</span>
            <span className="text-sm font-medium">{analytics?.types?.faq || 0}</span>
          </div>
        </div>
      </Card>

      <Button
        variant="outline"
        className="w-full bg-secondary/50 border-border/50 text-muted-foreground hover:text-foreground"
      >
        <Calendar className="w-4 h-4 mr-2" />
        View Detailed Report
      </Button>
    </div>
  );
}