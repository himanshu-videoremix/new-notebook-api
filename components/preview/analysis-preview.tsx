'use client';

import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BarChart, PieChart, LineChart } from 'lucide-react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface AnalysisPreviewProps {
  content: {
    title: string;
    type: 'sentiment' | 'topics' | 'entities';
    data: any;
  };
}

export function AnalysisPreview({ content }: AnalysisPreviewProps) {
  const renderSentimentAnalysis = (data: any) => (
    <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Overall Sentiment</span>
          <span className="font-medium">{data.sentiment}</span>
        </div>
        <Progress value={data.confidence * 100} className="h-2" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {data.emotions.map((emotion: any) => (
          <Card key={emotion.name} className="p-4">
            <div className="text-sm font-medium mb-2">{emotion.name}</div>
            <Progress value={emotion.score * 100} className="h-2" />
          </Card>
        ))}
      </div>
    </div>
  );

  const renderTopicAnalysis = (data: any) => (
    <div className="h-[400px] animate-in zoom-in duration-500">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data.topics}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="relevance" fill="hsl(var(--primary))" />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );

  const renderEntityAnalysis = (data: any) => (
    <div className="space-y-4 animate-in slide-in-from-right duration-500">
      {Object.entries(data.entities).map(([type, entities]: [string, any]) => (
        <Card key={type} className="p-4">
          <h3 className="font-medium mb-3">{type}</h3>
          <div className="grid grid-cols-2 gap-2">
            {entities.map((entity: any) => (
              <div key={entity.text} className="text-sm">
                <div className="flex justify-between">
                  <span>{entity.text}</span>
                  <span className="text-muted-foreground">{(entity.confidence * 100).toFixed(0)}%</span>
                </div>
                <Progress value={entity.confidence * 100} className="h-1 mt-1" />
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );

  const renderContent = () => {
    switch (content.type) {
      case 'sentiment':
        return renderSentimentAnalysis(content.data);
      case 'topics':
        return renderTopicAnalysis(content.data);
      case 'entities':
        return renderEntityAnalysis(content.data);
      default:
        return null;
    }
  };

  const getIcon = () => {
    switch (content.type) {
      case 'sentiment':
        return <PieChart className="h-6 w-6 text-primary" />;
      case 'topics':
        return <BarChart className="h-6 w-6 text-primary" />;
      case 'entities':
        return <LineChart className="h-6 w-6 text-primary" />;
      default:
        return null;
    }
  };

  return (
    <Card className="p-6 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          {getIcon()}
        </div>
        <h2 className="text-2xl font-semibold">{content.title}</h2>
      </div>
      {renderContent()}
    </Card>
  );
}