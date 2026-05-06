import React from 'react';
import { Play } from 'lucide-react';
import { Group } from './SettingsUI';
import { PlaybackSettingsContent } from './PlaybackSettingsContent';

interface PlaybackControlProps {
  isExpanded?: boolean;
  onToggle?: () => void;
}

export const PlaybackControl = ({ isExpanded = false, onToggle = () => {} }: PlaybackControlProps) => {
  return (
    <Group 
      title="Playback Control" 
      icon={Play} 
      color="bg-system-orange/10 text-system-orange"
      isExpanded={isExpanded}
      onToggle={onToggle}
    >
      <PlaybackSettingsContent />
    </Group>
  );
};
