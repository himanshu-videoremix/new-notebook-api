Here's the complete file content after applying the diff:

'use client';

import { useState } from 'react';
import { MessageSquare, Settings, Sparkles, Brain, GitBranch, BarChart2, FileText, Share2, Download, History, Zap, Book, Car as Cards, HelpCircle, Baseline as Timeline, List, GitCompare, Search, Network, Quote, FileType2, Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { autoContentApi as api } from '@/lib/api';
import { useOpenAI } from '@/hooks/use-openai';
import { StudioSidebarProps, ContentType, SectionType } from '@/lib/types/studio';

export function StudioSidebar({