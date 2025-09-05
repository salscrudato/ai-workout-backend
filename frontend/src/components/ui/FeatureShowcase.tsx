import React from 'react';
import { clsx } from 'clsx';
import { Sparkles, Zap, Smartphone, Palette, Moon } from 'lucide-react';
import Card from './Card';
import Button from './Button';
import { Display, Heading, Body } from './Typography';
import { useToast } from '../../contexts/ToastContext';
import ThemeToggle from './ThemeToggle';

export interface FeatureShowcaseProps {
  className?: string;
}

/**
 * Feature Showcase Component
 * 
 * Demonstrates the new UI/UX enhancements including:
 * - Blue gradient themes
 * - Glass morphism effects
 * - Micro-interactions
 * - Toast notifications
 * - Theme switching
 */
const FeatureShowcase: React.FC<FeatureShowcaseProps> = ({ className }) => {
  const { showSuccess, showInfo, showWarning, showError } = useToast();

  const features = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: 'Modern Navigation',
      description: 'Unified navigation with bottom nav for mobile and sidebar for desktop',
      variant: 'glass-blue' as const,
    },
    {
      icon: <Palette className="w-6 h-6" />,
      title: 'Blue Gradient Theme',
      description: 'Sophisticated color palette with glass morphism effects',
      variant: 'glass-cyan' as const,
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: 'Mobile-First Design',
      description: 'Touch-optimized with swipe gestures and responsive layouts',
      variant: 'glass-light' as const,
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Micro-Interactions',
      description: 'Smooth animations and hover effects throughout',
      variant: 'gradient' as const,
    },
  ];

  const handleToastDemo = (type: 'success' | 'info' | 'warning' | 'error') => {
    switch (type) {
      case 'success':
        showSuccess('Success!', 'Your workout has been generated successfully.');
        break;
      case 'info':
        showInfo('Info', 'New features have been added to your dashboard.');
        break;
      case 'warning':
        showWarning('Warning', 'Please complete your profile for better recommendations.');
        break;
      case 'error':
        showError('Error', 'Failed to connect to the server. Please try again.');
        break;
    }
  };

  return (
    <div className={clsx('space-y-8', className)}>
      {/* Header */}
      <div className="text-center">
        <Display level={2} gradient color="blue" className="mb-4">
          ✨ Enhanced UI/UX Features
        </Display>
        <Body size={1} color="secondary" className="max-w-2xl mx-auto">
          Experience the new modern design with blue gradients, glass morphism, 
          and smooth micro-interactions optimized for mobile-first usage.
        </Body>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <Card
            key={feature.title}
            variant={feature.variant}
            hover
            className={clsx(
              'p-6 text-center animate-fade-in-up hover:scale-105',
              'transition-all duration-300'
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="gradient-blue p-3 rounded-xl w-fit mx-auto mb-4 shadow-glow-blue">
              {React.cloneElement(feature.icon, { className: 'w-6 h-6 text-white' })}
            </div>
            <Heading level={4} className="mb-2">
              {feature.title}
            </Heading>
            <Body size={2} color="secondary">
              {feature.description}
            </Body>
          </Card>
        ))}
      </div>

      {/* Interactive Demo Section */}
      <Card variant="glass" className="p-8">
        <div className="text-center mb-6">
          <Heading level={3} gradient color="deep" className="mb-2">
            Interactive Demo
          </Heading>
          <Body size={1} color="secondary">
            Try out the new interactive features and animations
          </Body>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Toast Notifications */}
          <div className="space-y-2">
            <Body size={2} weight="medium" className="text-center mb-3">
              Toast Notifications
            </Body>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleToastDemo('success')}
                className="text-xs"
              >
                Success
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleToastDemo('info')}
                className="text-xs"
              >
                Info
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleToastDemo('warning')}
                className="text-xs"
              >
                Warning
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleToastDemo('error')}
                className="text-xs"
              >
                Error
              </Button>
            </div>
          </div>

          {/* Button Animations */}
          <div className="space-y-2">
            <Body size={2} weight="medium" className="text-center mb-3">
              Button Animations
            </Body>
            <div className="space-y-2">
              <Button
                variant="gradient"
                size="sm"
                animate="bounce"
                className="w-full"
              >
                Bounce Effect
              </Button>
              <Button
                variant="primary"
                size="sm"
                animate="pulse"
                className="w-full"
              >
                Pulse Effect
              </Button>
            </div>
          </div>

          {/* Theme Toggle */}
          <div className="space-y-2">
            <Body size={2} weight="medium" className="text-center mb-3">
              Theme Switching
            </Body>
            <div className="flex flex-col items-center space-y-2">
              <ThemeToggle variant="button" size="sm" />
              <ThemeToggle variant="icon-only" size="sm" />
            </div>
          </div>
        </div>
      </Card>

      {/* Footer */}
      <div className="text-center">
        <Body size={2} color="secondary">
          🚀 All features are mobile-optimized with accessibility support
        </Body>
      </div>
    </div>
  );
};

export default FeatureShowcase;
