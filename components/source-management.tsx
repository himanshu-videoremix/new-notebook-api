'use client';

import { useState, useEffect } from 'react';
import { FileText, Trash2, Edit2, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useApiFeatures } from '@/hooks/use-api-features';
import { autoContentApi } from '@/lib/api';

interface Source {
  id: string;
  title: string;
  type: string;
  description?: string;
  tags?: string[];
  status: string;
}

export function SourceManagement() {
  const [sources, setSources] = useState<Source[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingSource, setEditingSource] = useState<string | null>(null);
  const { toast } = useToast();
  const apiFeatures = useApiFeatures();

  useEffect(() => {
    loadSources();
  }, []);

  const loadSources = async () => {
    try {
      const response = await autoContentApi.getContentList();
      setSources(response.sources);
    } catch (error) {
      toast({
        title: "Failed to load sources",
        description: "Could not fetch source list",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (sourceId: string) => {
    try {
      await apiFeatures.deleteSource(sourceId);
      setSources(sources.filter(s => s.id !== sourceId));
      toast({
        title: "Source deleted",
        description: "The source has been removed"
      });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Failed to delete source",
        variant: "destructive"
      });
    }
  };

  const handleUpdate = async (sourceId: string, metadata: {
    title?: string;
    description?: string;
    tags?: string[];
  }) => {
    try {
      await apiFeatures.updateSource(sourceId, metadata);
      setSources(sources.map(s => 
        s.id === sourceId 
          ? { ...s, ...metadata }
          : s
      ));
      setEditingSource(null);
      toast({
        title: "Source updated",
        description: "Changes have been saved"
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update source",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse bg-secondary/50 h-24 rounded-lg" />
        <div className="animate-pulse bg-secondary/50 h-24 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sources.map(source => (
        <Card
          key={source.id}
          className="p-4 bg-secondary/50 border-border/50"
        >
          {editingSource === source.id ? (
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  defaultValue={source.title}
                  className="bg-secondary/50 border-border/50 mt-1"
                  onChange={(e) => {
                    const newTitle = e.target.value;
                    handleUpdate(source.id, { title: newTitle });
                  }}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  defaultValue={source.description}
                  className="bg-secondary/50 border-border/50 mt-1"
                  onChange={(e) => {
                    const newDescription = e.target.value;
                    handleUpdate(source.id, { description: newDescription });
                  }}
                />
              </div>
              <div>
                <Label>Tags (comma separated)</Label>
                <Input
                  defaultValue={source.tags?.join(', ')}
                  className="bg-secondary/50 border-border/50 mt-1"
                  onChange={(e) => {
                    const newTags = e.target.value.split(',').map(t => t.trim());
                    handleUpdate(source.id, { tags: newTags });
                  }}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingSource(null)}
                  className="bg-secondary/50 border-border/50"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => setEditingSource(null)}
                >
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">{source.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {source.type} • {source.status}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingSource(source.id)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(source.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {source.description && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {source.description}
                </p>
              )}
              {source.tags && source.tags.length > 0 && (
                <div className="mt-2 flex gap-2">
                  {source.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 rounded-full bg-secondary text-xs text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}