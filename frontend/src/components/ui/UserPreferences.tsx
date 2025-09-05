import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { 
  Bell, 
  Moon, 
  Sun, 
  Globe, 
  Volume2, 
  VolumeX,
  Smartphone,
  Mail,
  Shield,
  Eye,
  EyeOff,
  Save,
  RotateCcw
} from 'lucide-react';
import Button from './Button';
import Badge from './Badge';

export interface UserPreferencesData {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    workout_reminders: boolean;
    progress_updates: boolean;
    social_interactions: boolean;
  };
  privacy: {
    profile_visibility: 'public' | 'friends' | 'private';
    workout_sharing: boolean;
    analytics_tracking: boolean;
    data_export_enabled: boolean;
  };
  workout: {
    voice_guidance: boolean;
    auto_rest_timer: boolean;
    metric_system: boolean;
    default_workout_duration: number;
    difficulty_preference: 'adaptive' | 'consistent';
  };
  accessibility: {
    high_contrast: boolean;
    large_text: boolean;
    reduced_motion: boolean;
    screen_reader_optimized: boolean;
  };
}

export interface UserPreferencesProps {
  preferences: UserPreferencesData;
  onSave: (preferences: UserPreferencesData) => void;
  onReset?: () => void;
  className?: string;
  isLoading?: boolean;
}

const DEFAULT_PREFERENCES: UserPreferencesData = {
  theme: 'system',
  language: 'en',
  notifications: {
    email: true,
    push: true,
    workout_reminders: true,
    progress_updates: true,
    social_interactions: false,
  },
  privacy: {
    profile_visibility: 'friends',
    workout_sharing: true,
    analytics_tracking: true,
    data_export_enabled: true,
  },
  workout: {
    voice_guidance: true,
    auto_rest_timer: true,
    metric_system: false,
    default_workout_duration: 30,
    difficulty_preference: 'adaptive',
  },
  accessibility: {
    high_contrast: false,
    large_text: false,
    reduced_motion: false,
    screen_reader_optimized: false,
  },
};

/**
 * Comprehensive user preferences component with categorized settings
 */
const UserPreferences: React.FC<UserPreferencesProps> = ({
  preferences,
  onSave,
  onReset,
  className,
  isLoading = false,
}) => {
  const [localPreferences, setLocalPreferences] = useState<UserPreferencesData>(preferences);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('general');

  useEffect(() => {
    setLocalPreferences(preferences);
    setHasChanges(false);
  }, [preferences]);

  useEffect(() => {
    const changed = JSON.stringify(localPreferences) !== JSON.stringify(preferences);
    setHasChanges(changed);
  }, [localPreferences, preferences]);

  const updatePreference = (section: keyof UserPreferencesData, key: string, value: any) => {
    setLocalPreferences(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any || {}),
        [key]: value,
      },
    }));
  };

  const handleSave = () => {
    onSave(localPreferences);
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
    } else {
      setLocalPreferences(DEFAULT_PREFERENCES);
    }
  };

  const sections = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'workout', label: 'Workout', icon: Volume2 },
    { id: 'accessibility', label: 'Accessibility', icon: Eye },
  ];

  const renderToggle = (
    label: string,
    description: string,
    value: boolean,
    onChange: (value: boolean) => void,
    disabled = false
  ) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <h4 className="text-sm font-medium text-secondary-900">{label}</h4>
        <p className="text-xs text-secondary-600">{description}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        disabled={disabled}
        className={clsx(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
          value ? 'bg-primary-600' : 'bg-secondary-300',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <span
          className={clsx(
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
            value ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </button>
    </div>
  );

  const renderSelect = (
    label: string,
    description: string,
    value: string,
    options: { value: string; label: string }[],
    onChange: (value: string) => void
  ) => (
    <div className="py-3">
      <label className="block text-sm font-medium text-secondary-900 mb-1">
        {label}
      </label>
      <p className="text-xs text-secondary-600 mb-2">{description}</p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'general':
        return (
          <div className="space-y-4">
            {renderSelect(
              'Theme',
              'Choose your preferred color scheme',
              localPreferences.theme,
              [
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
                { value: 'system', label: 'System' },
              ],
              (value) => updatePreference('theme', 'theme', value)
            )}
            
            {renderSelect(
              'Language',
              'Select your preferred language',
              localPreferences.language,
              [
                { value: 'en', label: 'English' },
                { value: 'es', label: 'Español' },
                { value: 'fr', label: 'Français' },
                { value: 'de', label: 'Deutsch' },
              ],
              (value) => updatePreference('language', 'language', value)
            )}
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-2">
            {renderToggle(
              'Email Notifications',
              'Receive updates via email',
              localPreferences.notifications.email,
              (value) => updatePreference('notifications', 'email', value)
            )}
            
            {renderToggle(
              'Push Notifications',
              'Receive push notifications on your device',
              localPreferences.notifications.push,
              (value) => updatePreference('notifications', 'push', value)
            )}
            
            {renderToggle(
              'Workout Reminders',
              'Get reminded about your scheduled workouts',
              localPreferences.notifications.workout_reminders,
              (value) => updatePreference('notifications', 'workout_reminders', value)
            )}
            
            {renderToggle(
              'Progress Updates',
              'Receive updates about your fitness progress',
              localPreferences.notifications.progress_updates,
              (value) => updatePreference('notifications', 'progress_updates', value)
            )}
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-4">
            {renderSelect(
              'Profile Visibility',
              'Who can see your profile information',
              localPreferences.privacy.profile_visibility,
              [
                { value: 'public', label: 'Public' },
                { value: 'friends', label: 'Friends Only' },
                { value: 'private', label: 'Private' },
              ],
              (value) => updatePreference('privacy', 'profile_visibility', value)
            )}
            
            <div className="space-y-2">
              {renderToggle(
                'Workout Sharing',
                'Allow sharing your workouts with others',
                localPreferences.privacy.workout_sharing,
                (value) => updatePreference('privacy', 'workout_sharing', value)
              )}
              
              {renderToggle(
                'Analytics Tracking',
                'Help improve the app with anonymous usage data',
                localPreferences.privacy.analytics_tracking,
                (value) => updatePreference('privacy', 'analytics_tracking', value)
              )}
            </div>
          </div>
        );

      case 'workout':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              {renderToggle(
                'Voice Guidance',
                'Enable voice instructions during workouts',
                localPreferences.workout.voice_guidance,
                (value) => updatePreference('workout', 'voice_guidance', value)
              )}
              
              {renderToggle(
                'Auto Rest Timer',
                'Automatically start rest timers between exercises',
                localPreferences.workout.auto_rest_timer,
                (value) => updatePreference('workout', 'auto_rest_timer', value)
              )}
              
              {renderToggle(
                'Metric System',
                'Use metric units (kg, cm) instead of imperial (lbs, ft)',
                localPreferences.workout.metric_system,
                (value) => updatePreference('workout', 'metric_system', value)
              )}
            </div>
            
            {renderSelect(
              'Difficulty Preference',
              'How should workout difficulty adapt over time',
              localPreferences.workout.difficulty_preference,
              [
                { value: 'adaptive', label: 'Adaptive (Progressive)' },
                { value: 'consistent', label: 'Consistent Level' },
              ],
              (value) => updatePreference('workout', 'difficulty_preference', value)
            )}
          </div>
        );

      case 'accessibility':
        return (
          <div className="space-y-2">
            {renderToggle(
              'High Contrast',
              'Increase contrast for better visibility',
              localPreferences.accessibility.high_contrast,
              (value) => updatePreference('accessibility', 'high_contrast', value)
            )}
            
            {renderToggle(
              'Large Text',
              'Increase text size throughout the app',
              localPreferences.accessibility.large_text,
              (value) => updatePreference('accessibility', 'large_text', value)
            )}
            
            {renderToggle(
              'Reduced Motion',
              'Minimize animations and transitions',
              localPreferences.accessibility.reduced_motion,
              (value) => updatePreference('accessibility', 'reduced_motion', value)
            )}
            
            {renderToggle(
              'Screen Reader Optimized',
              'Optimize interface for screen readers',
              localPreferences.accessibility.screen_reader_optimized,
              (value) => updatePreference('accessibility', 'screen_reader_optimized', value)
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={clsx('bg-white rounded-2xl border border-secondary-200', className)}>
      {/* Header */}
      <div className="p-6 border-b border-secondary-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-secondary-900">Preferences</h2>
            <p className="text-sm text-secondary-600">
              Customize your app experience
            </p>
          </div>
          {hasChanges && (
            <Badge variant="warning" size="sm">
              Unsaved Changes
            </Badge>
          )}
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-48 border-r border-secondary-200 p-4">
          <nav className="space-y-1">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={clsx(
                    'w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors text-left',
                    activeSection === section.id
                      ? 'bg-primary-100 text-primary-900'
                      : 'text-secondary-700 hover:bg-secondary-100'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {section.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          {renderSection()}
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-secondary-200 flex items-center justify-between">
        <Button
          variant="outline"
          leftIcon={<RotateCcw className="w-4 h-4" />}
          onClick={handleReset}
          disabled={isLoading}
        >
          Reset to Defaults
        </Button>
        
        <Button
          variant="primary"
          leftIcon={<Save className="w-4 h-4" />}
          onClick={handleSave}
          disabled={!hasChanges || isLoading}
          loading={isLoading}
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default UserPreferences;
