import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Zap, 
  Heart, 
  Star, 
  Trophy, 
  Target,
  Palette,
  Smartphone,
  Accessibility,
  Gauge
} from 'lucide-react';

// Import all enhanced components
import { Display, Heading, Body } from '../components/ui/Typography';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import EnhancedDesignDemo from '../components/ui/EnhancedDesignDemo';
import { SwipeableCard, PullToRefresh, TouchableOpacity, FloatingActionButton } from '../components/ui/EnhancedTouchInteractions';
import { PremiumSpinner, ProgressBar, LoadingOverlay, WorkoutCardSkeleton } from '../components/ui/PremiumLoadingStates';
import { ToastContainer, SuccessCelebration, useToast } from '../components/ui/EnhancedFeedbackSystem';
import EnhancedPageHeader from '../components/ui/EnhancedPageHeader';
import { Container, Section, Grid } from '../components/ui/enhanced/ComponentComposition';
import { OptimizedImage, MemoizedCard } from '../components/ui/PerformanceOptimizations';
import { SkipLinks, AccessibleAlert, AccessibleButton } from '../components/ui/AccessibilityEnhancements';

/**
 * Design System Demo Page
 * 
 * Showcases all the enhanced UI/UX components:
 * - Enhanced Visual Design System
 * - Advanced Micro-Interactions
 * - Mobile-First UX Patterns
 * - Premium Loading & Feedback States
 * - Enhanced Layout & Navigation
 * - Performance & Accessibility Optimizations
 */

const DesignSystemDemo: React.FC = () => {
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const [showSuccessCelebration, setShowSuccessCelebration] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toasts, addToast, removeToast } = useToast();

  const handleShowToast = (type: 'success' | 'error' | 'warning' | 'info' | 'workout' | 'achievement') => {
    const messages = {
      success: { title: 'Success!', message: 'Your workout has been generated successfully.' },
      error: { title: 'Error', message: 'Failed to generate workout. Please try again.' },
      warning: { title: 'Warning', message: 'Please complete your profile setup first.' },
      info: { title: 'Info', message: 'New features are available in the latest update.' },
      workout: { title: 'Workout Ready!', message: 'Your personalized workout is ready to start.' },
      achievement: { title: 'Achievement Unlocked!', message: 'You completed 10 workouts this month!' },
    };

    addToast({
      type,
      ...messages[type],
      action: type === 'error' ? { label: 'Retry', onClick: () => console.log('Retry clicked') } : undefined,
    });
  };

  const handleShowLoading = () => {
    setShowLoadingOverlay(true);
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setShowLoadingOverlay(false);
          setShowSuccessCelebration(true);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const demoCards = [
    { id: '1', title: 'Enhanced Typography', description: 'Beautiful gradient text with sophisticated scaling' },
    { id: '2', title: 'Micro-Interactions', description: 'Smooth animations and hover effects' },
    { id: '3', title: 'Mobile Optimized', description: 'Native-like touch interactions and gestures' },
    { id: '4', title: 'Performance First', description: 'Optimized components with lazy loading' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30">
      <SkipLinks />
      
      {/* Page Header */}
      <Container size="xl" padding="lg">
        <EnhancedPageHeader
          title="Design System Demo"
          subtitle="AI Workout App - Enhanced UI/UX"
          description="Experience the refined design system with premium components, sophisticated animations, and accessibility-first approach."
          backgroundPattern
          actions={[
            {
              label: 'View Components',
              onClick: () => console.log('View components'),
              variant: 'primary',
              icon: <Palette className="w-4 h-4" />,
            },
            {
              label: 'Performance',
              onClick: () => console.log('Performance'),
              variant: 'outline',
              icon: <Gauge className="w-4 h-4" />,
            },
          ]}
        />
      </Container>

      {/* Main Content */}
      <Container size="xl" padding="lg">
        <Section spacing="4xl">
          {/* Enhanced Design System */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-12">
              <Display level={2} gradient="fresh" className="mb-4">
                Enhanced Components
              </Display>
              <Body size={1} color="secondary" className="max-w-3xl mx-auto">
                Explore the sophisticated design system with premium glass morphism,
                advanced micro-interactions, and mobile-optimized patterns.
              </Body>
            </div>

            {/* Component Showcase Grid */}
            <Grid cols={4} gap="lg" className="mb-16">
              {/* Typography Showcase */}
              <Card variant="glass-ultra" padding="lg" enhancedAnimation hover>
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 mx-auto rounded-full gradient-primary flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <Heading level={3} gradient="luxury">Typography</Heading>
                  <Body size={2} color="secondary">
                    Enhanced text hierarchy with gradient effects
                  </Body>
                  <div className="flex gap-2 justify-center">
                    <Badge variant="primary">Premium</Badge>
                    <Badge variant="secondary">Gradients</Badge>
                  </div>
                </div>
              </Card>

              {/* Interactions Showcase */}
              <Card variant="glass-light" padding="lg" enhancedAnimation hover>
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 mx-auto rounded-full gradient-electric flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <Heading level={3} color="primary">Interactions</Heading>
                  <Body size={2} color="secondary">
                    Sophisticated hover states and animations
                  </Body>
                  <Button variant="primary" size="sm" enhancedAnimation ripple>
                    Try Me
                  </Button>
                </div>
              </Card>

              {/* Mobile UX Showcase */}
              <Card variant="glass-blue" padding="lg" enhancedAnimation hover>
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 mx-auto rounded-full gradient-premium flex items-center justify-center">
                    <Smartphone className="w-6 h-6 text-white" />
                  </div>
                  <Heading level={3} color="primary">Mobile UX</Heading>
                  <Body size={2} color="secondary">
                    Native-like touch interactions and gestures
                  </Body>
                  <TouchableOpacity onPress={() => handleShowToast('workout')}>
                    <div className="px-4 py-2 bg-primary-100 rounded-lg">
                      Touch Me
                    </div>
                  </TouchableOpacity>
                </div>
              </Card>

              {/* Accessibility Showcase */}
              <Card variant="glass-cyan" padding="lg" enhancedAnimation hover>
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center">
                    <Accessibility className="w-6 h-6 text-white" />
                  </div>
                  <Heading level={3} color="primary">Accessibility</Heading>
                  <Body size={2} color="secondary">
                    WCAG 2.1 AA compliant with screen reader support
                  </Body>
                  <AccessibleButton variant="secondary" size="sm">
                    Accessible
                  </AccessibleButton>
                </div>
              </Card>
            </Grid>

            {/* Interactive Demo Section */}
            <div className="space-y-12">
              {/* Loading States Demo */}
              <div className="text-center space-y-6">
                <Heading level={2} gradient="modern">Loading & Feedback States</Heading>
                
                <div className="flex flex-wrap justify-center gap-4">
                  <Button 
                    variant="primary" 
                    onClick={handleShowLoading}
                    enhancedAnimation
                    leftIcon={<Zap className="w-4 h-4" />}
                  >
                    Show Loading
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => handleShowToast('success')}
                    enhancedAnimation
                    leftIcon={<Trophy className="w-4 h-4" />}
                  >
                    Success Toast
                  </Button>
                  
                  <Button 
                    variant="secondary" 
                    onClick={() => handleShowToast('achievement')}
                    enhancedAnimation
                    leftIcon={<Star className="w-4 h-4" />}
                  >
                    Achievement
                  </Button>
                </div>

                {/* Progress Bar Demo */}
                <div className="max-w-md mx-auto">
                  <ProgressBar 
                    progress={progress} 
                    variant="gradient" 
                    showPercentage 
                    label="Workout Generation Progress"
                  />
                </div>

                {/* Spinner Variants */}
                <div className="flex justify-center space-x-8">
                  <PremiumSpinner variant="workout" text="Generating..." />
                  <PremiumSpinner variant="dots" size="lg" />
                  <PremiumSpinner variant="pulse" size="md" />
                </div>
              </div>

              {/* Swipeable Cards Demo */}
              <div className="space-y-6">
                <Heading level={2} gradient="fresh" className="text-center">
                  Mobile Interactions
                </Heading>
                
                <div className="max-w-md mx-auto space-y-4">
                  {demoCards.map((card) => (
                    <SwipeableCard
                      key={card.id}
                      onSwipeLeft={() => handleShowToast('error')}
                      onSwipeRight={() => handleShowToast('success')}
                      onLongPress={() => handleShowToast('info')}
                    >
                      <MemoizedCard {...card} />
                    </SwipeableCard>
                  ))}
                </div>
                
                <div className="text-center">
                  <Body size={2} color="secondary">
                    Swipe left/right or long press to interact
                  </Body>
                </div>
              </div>

              {/* Accessibility Demo */}
              <div className="space-y-6">
                <Heading level={2} gradient="luxury" className="text-center">
                  Accessibility Features
                </Heading>
                
                <div className="max-w-2xl mx-auto space-y-4">
                  <AccessibleAlert
                    type="success"
                    title="Accessibility Compliant"
                    message="All components follow WCAG 2.1 AA guidelines with proper ARIA labels and keyboard navigation."
                  />
                  
                  <AccessibleAlert
                    type="info"
                    title="Screen Reader Optimized"
                    message="Components are optimized for screen readers with semantic HTML and proper announcements."
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </Section>
      </Container>

      {/* Floating Action Button */}
      <FloatingActionButton
        icon={<Heart className="w-6 h-6" />}
        onPress={() => handleShowToast('workout')}
        position="bottom-right"
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Loading Overlay */}
      <LoadingOverlay
        isVisible={showLoadingOverlay}
        variant="workout"
        message="Generating Your Perfect Workout"
        progress={progress}
      />

      {/* Success Celebration */}
      <SuccessCelebration
        isVisible={showSuccessCelebration}
        title="Workout Generated!"
        message="Your personalized AI workout is ready. Let's get started!"
        onClose={() => setShowSuccessCelebration(false)}
      />
    </div>
  );
};

export default DesignSystemDemo;
