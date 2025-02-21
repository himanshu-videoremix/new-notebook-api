'use client';

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { ContentType, ContentOptions, CONTENT_TYPE_CONFIGS } from '@/lib/types/content';

interface ContentOptionsConfigProps {
  contentType: ContentType;
  options: Partial<ContentOptions>;
  onChange: (options: Partial<ContentOptions>) => void;
  section?: 'basic' | 'content' | 'advanced';
  voices?: Array<{ id: string; name: string; gender?: string }>;
}

export function ContentOptionsConfig({
  contentType,
  options,
  onChange,
  section = 'basic',
  voices = []
}: ContentOptionsConfigProps) {
  const config = CONTENT_TYPE_CONFIGS[contentType];
  const [localOptions, setLocalOptions] = useState(options);

  useEffect(() => {
    setLocalOptions({
      ...config.defaultOptions,
      elements: {
        examples: false,
        questions: false,
        summary: false,
        citations: false,
        keyPoints: false,
        definitions: false,
        references: false,
        ...options.elements
      },
      advanced: {
        maxLength: undefined,
        minConfidence: undefined,
        requireSources: false,
        preserveFormatting: false,
        highlightKeyTerms: false,
        generateMetadata: false,
        ...options.advanced
      },
      ...options
    });
  }, [contentType, options]);

  const handleChange = (key: keyof ContentOptions, value: any) => {
    const newOptions = { ...localOptions, [key]: value };
    setLocalOptions(newOptions);
    onChange(newOptions);
  };

  const renderOption = (key: keyof ContentOptions) => {
    if (!config.availableOptions.includes(key)) return null;

    // Filter options based on section
    const basicOptions = ['format', 'tone', 'length', 'style', 'perspective', 'depth', 'audience', 'complexity'];
    const contentOptions = ['elements', 'speakers', 'voice1', 'voice2'];
    const advancedOptions = ['advanced'];

    let sectionOptions;
    switch (section) {
      case 'basic':
        sectionOptions = basicOptions;
        break;
      case 'content':
        sectionOptions = contentOptions;
        break;
      case 'advanced':
        sectionOptions = advancedOptions;
        break;
      default:
        sectionOptions = [];
    }

    if (!sectionOptions.includes(key)) return null;

    switch (key) {
      case 'format':
        return (
          <div className="grid gap-2">
            <Label>Format</Label>
            <Select value={localOptions.format} onValueChange={(v) => handleChange('format', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="structured">Structured</SelectItem>
                <SelectItem value="conversational">Conversational</SelectItem>
                <SelectItem value="bullet">Bullet Points</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case 'tone':
        return (
          <div className="grid gap-2">
            <Label>Tone</Label>
            <Select value={localOptions.tone} onValueChange={(v) => handleChange('tone', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case 'length':
        return (
          <div className="grid gap-2">
            <Label>Length</Label>
            <Select value={localOptions.length} onValueChange={(v) => handleChange('length', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select length" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short">Short</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="long">Long</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case 'style':
        return (
          <div className="grid gap-2">
            <Label>Style</Label>
            <Select value={localOptions.style} onValueChange={(v) => handleChange('style', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="educational">Educational</SelectItem>
                <SelectItem value="debate">Debate</SelectItem>
                <SelectItem value="interview">Interview</SelectItem>
                <SelectItem value="storytelling">Storytelling</SelectItem>
                <SelectItem value="analytical">Analytical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case 'perspective':
        return (
          <div className="grid gap-2">
            <Label>Perspective</Label>
            <Select value={localOptions.perspective} onValueChange={(v) => handleChange('perspective', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select perspective" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="neutral">Neutral/Balanced</SelectItem>
                <SelectItem value="critical">Critical Analysis</SelectItem>
                <SelectItem value="supportive">Supportive</SelectItem>
                <SelectItem value="contrasting">Contrasting Views</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case 'depth':
        return (
          <div className="grid gap-2">
            <Label>Depth</Label>
            <Select value={localOptions.depth} onValueChange={(v) => handleChange('depth', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select depth" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">High-level Overview</SelectItem>
                <SelectItem value="balanced">Balanced Coverage</SelectItem>
                <SelectItem value="detailed">Detailed Analysis</SelectItem>
                <SelectItem value="expert">Expert Deep Dive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case 'audience':
        return (
          <div className="grid gap-2">
            <Label>Target Audience</Label>
            <Select value={localOptions.audience} onValueChange={(v) => handleChange('audience', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select audience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case 'complexity':
        return (
          <div className="grid gap-2">
            <Label>Complexity</Label>
            <Select value={localOptions.complexity} onValueChange={(v) => handleChange('complexity', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select complexity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case 'voice1':
      case 'voice2':
        if (!voices.length) return null;
        return (
          <div className="grid gap-2">
            <Label>{key === 'voice1' ? 'First Speaker Voice' : 'Second Speaker Voice'}</Label>
            <Select 
              value={localOptions[key]} 
              onValueChange={(v) => handleChange(key, v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select voice" />
              </SelectTrigger>
              <SelectContent>
                {voices.map(voice => (
                  <SelectItem 
                    key={voice.id} 
                    value={voice.id}
                    disabled={
                      (key === 'voice1' && voice.id === localOptions.voice2) ||
                      (key === 'voice2' && voice.id === localOptions.voice1)
                    }
                  >
                    {voice.name} {voice.gender ? `(${voice.gender === 'f' ? 'Female' : 'Male'})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'speakers':
        return (
          <div className="grid gap-2">
            <Label>Speaker Names</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Host 1</Label>
                <Input
                  value={localOptions.speakers?.host1 || ''}
                  onChange={(e) => handleChange('speakers', {
                    ...localOptions.speakers,
                    host1: e.target.value
                  })}
                  placeholder="Host 1 name"
                />
              </div>
              <div>
                <Label className="text-xs">Host 2</Label>
                <Input
                  value={localOptions.speakers?.host2 || ''}
                  onChange={(e) => handleChange('speakers', {
                    ...localOptions.speakers,
                    host2: e.target.value
                  })}
                  placeholder="Host 2 name"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <Label className="text-xs">Host 1 Role</Label>
                <Input
                  value={localOptions.speakers?.roles?.host1Role || ''}
                  onChange={(e) => handleChange('speakers', {
                    ...localOptions.speakers,
                    roles: {
                      ...localOptions.speakers?.roles,
                      host1Role: e.target.value
                    }
                  })}
                  placeholder="e.g., Host"
                />
              </div>
              <div>
                <Label className="text-xs">Host 2 Role</Label>
                <Input
                  value={localOptions.speakers?.roles?.host2Role || ''}
                  onChange={(e) => handleChange('speakers', {
                    ...localOptions.speakers,
                    roles: {
                      ...localOptions.speakers?.roles,
                      host2Role: e.target.value
                    }
                  })}
                  placeholder="e.g., Expert"
                />
              </div>
            </div>
            <Select
              value={localOptions.speakers?.style || 'formal'}
              onValueChange={(v) => handleChange('speakers', {
                ...localOptions.speakers,
                style: v
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Conversation style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="dynamic">Dynamic</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case 'elements':
        return (
          <div className="space-y-2">
            <Label>Content Elements</Label>
            <div className="space-y-2 rounded-lg border p-4">
              {Object.entries(localOptions.elements || {}).map(([element, enabled]) => (
                <div key={element} className="flex items-center justify-between">
                  <Label className="capitalize">{element}</Label>
                  <Switch
                    checked={enabled}
                    onCheckedChange={(checked) => handleChange('elements', {
                      ...localOptions.elements,
                      [element]: checked
                    })}
                  />
                </div>
              ))}
            </div>
          </div>
        );

      case 'advanced':
        return (
          <Collapsible>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-secondary/20 rounded-lg">
              <Label>Advanced Options</Label>
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 p-4">
              <div className="grid gap-4">
                <div>
                  <Label>Maximum Length (words)</Label>
                  <Input
                    type="number"
                    value={localOptions.advanced?.maxLength || ''}
                    onChange={(e) => handleChange('advanced', {
                      ...localOptions.advanced,
                      maxLength: parseInt(e.target.value) || undefined
                    })}
                    placeholder="No limit"
                  />
                </div>
                <div>
                  <Label>Minimum Confidence (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={localOptions.advanced?.minConfidence || ''}
                    onChange={(e) => handleChange('advanced', {
                      ...localOptions.advanced,
                      minConfidence: parseInt(e.target.value) / 100 || undefined
                    })}
                    placeholder="Default"
                  />
                </div>
                {Object.entries({
                  requireSources: 'Require source citations',
                  preserveFormatting: 'Preserve original formatting',
                  highlightKeyTerms: 'Highlight key terms',
                  generateMetadata: 'Generate metadata'
                }).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label>{label}</Label>
                    <Switch
                      checked={localOptions.advanced?.[key] || false}
                      onCheckedChange={(checked) => handleChange('advanced', {
                        ...localOptions.advanced,
                        [key]: checked
                      })}
                    />
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {Object.keys(config.defaultOptions).map((key) => 
        <div key={key}>
          {renderOption(key as keyof ContentOptions)}
        </div>
      )}
    </div>
  );
}