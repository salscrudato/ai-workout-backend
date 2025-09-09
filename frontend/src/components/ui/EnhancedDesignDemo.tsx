import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Zap, 
  Heart, 
  Star, 
  Trophy, 
  Target,
  Play,
  Pause,
  RotateCcw,
  Palette,
  Type,
  Layers
} from 'lucide-react';
import { Display, Heading, Body } from './Typography';
import Button from './Button';
import Card, { CardHeader, CardBody } from './Card';
import Badge from './Badge';

/**
 * Enhanced Design Demo Component
 * 
 * Showcases the refined design system with:
 * - Enhanced color palette with improved contrast
 * - Premium glass morphism effects
 * - Sophisticated micro-interactions
 * - Advanced gradient systems
 * - Mobile-optimized touch interactions
 */

interface DemoSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const DemoSection: React.FC<DemoSectionProps> = ({ title, description, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="space-y-6"
  >
    <div className="text-center space-y-2">
      <Heading level={2} gradient="fresh" className="text-2xl">
        {title}
      </Heading>
      <Body size={2} color="secondary" className="max-w-2xl mx-auto">
        {description}
      </Body>
    </div>
    <div className="space-y-4">
      {children}
    </div>
  </motion.div>
);

const EnhancedDesignDemo: React.FC = () => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);

  const toggleAnimation = () => {
    setIsAnimating(!isAnimating);
  };

  const cardVariants = {
    initial: { scale: 1, rotateY: 0 },
    hover: {
      scale: 1.02,
      rotateY: 5
    },
    tap: { scale: 0.98 }
  };

  const gradientCards = [
    { title: "Primary Gradient", class: "gradient-primary", icon: Zap },
    { title: "Premium Gradient", class: "gradient-premium", icon: Star },
    { title: "Electric Gradient", class: "gradient-electric", icon: Sparkles },
  ];

  const glassCards = [
    { title: "Glass Ultra", variant: "glass-ultra" as const, description: "Premium glass with enhanced depth" },
    { title: "Glass Light", variant: "glass-light" as const, description: "Subtle glass with soft blur" },
    { title: "Glass Blue", variant: "glass-blue" as const, description: "Tinted glass with blue accent" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-8"
        >
          <motion.div
            animate={isAnimating ? { rotate: 360, scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-3xl gradient-premium shadow-glow-blue"
          >
            <Palette className="w-12 h-12 text-white" />
          </motion.div>

          <Display level={1} gradient="modern" className="max-w-4xl mx-auto">
            Enhanced Design System
          </Display>

          <Body size={1} color="secondary" className="max-w-3xl mx-auto text-xl">
            Experience the refined AI Workout design system with premium glass morphism,
            enhanced gradients, and sophisticated micro-interactions.
          </Body>

          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              variant="primary" 
              size="lg"
              leftIcon={isAnimating ? <Pause /> : <Play />}
              onClick={toggleAnimation}
              className="hover-lift"
            >
              {isAnimating ? 'Pause' : 'Play'} Animations
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              leftIcon={<RotateCcw />}
              onClick={() => setSelectedCard(null)}
              className="hover-lift-subtle"
            >
              Reset Demo
            </Button>
          </div>
        </motion.div>

        {/* Typography Showcase */}
        <DemoSection
          title="Premium Typography"
          description="Sophisticated text hierarchy with gradient effects and enhanced readability"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card variant="glass-ultra" padding="lg" className="hover-lift-subtle">
              <div className="space-y-4">
                <Display level={2} gradient="fresh">Display Text</Display>
                <Heading level={1} gradient="luxury">Heading Text</Heading>
                <Body size={1} color="primary">Body text with enhanced readability and optimal line spacing for comfortable reading experience.</Body>
              </div>
            </Card>

            <Card variant="glass-light" padding="lg" className="hover-lift-subtle">
              <div className="space-y-4">
                <Heading level={2} color="gradient-blue">Gradient Headers</Heading>
                <Body size={2} color="secondary">Secondary text with perfect contrast ratios and accessibility compliance.</Body>
                <div className="flex gap-2">
                  <Badge variant="primary">Premium</Badge>
                  <Badge variant="secondary">Enhanced</Badge>
                </div>
              </div>
            </Card>

            <Card variant="glass-blue" padding="lg" className="hover-lift-subtle">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Type className="w-5 h-5 text-primary-600" />
                  <Heading level={3} color="primary">Typography Scale</Heading>
                </div>
                <Body size={2} color="muted">Mathematically precise scaling with enhanced mobile optimization.</Body>
              </div>
            </Card>
          </div>
        </DemoSection>

        {/* Enhanced Gradients */}
        <DemoSection
          title="Premium Gradients"
          description="Sophisticated gradient systems with enhanced depth and animation"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {gradientCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={index}
                  variants={cardVariants}
                  initial="initial"
                  whileHover="hover"
                  whileTap="tap"
                  className={`${card.class} rounded-2xl p-8 text-white shadow-glow-blue cursor-pointer`}
                  onClick={() => setSelectedCard(index)}
                >
                  <div className="text-center space-y-4">
                    <Icon className="w-12 h-12 mx-auto" />
                    <Heading level={3} color="primary" className="text-white">
                      {card.title}
                    </Heading>
                    <Body size={2} className="text-white/90">
                      Enhanced gradient with smooth animations
                    </Body>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </DemoSection>

        {/* Glass Morphism Effects */}
        <DemoSection
          title="Premium Glass Effects"
          description="Enhanced glass morphism with improved depth and blur effects"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {glassCards.map((card, index) => (
              <Card 
                key={index}
                variant={card.variant}
                padding="lg"
                className="hover-glow interactive-card"
                onClick={() => setSelectedCard(index + 10)}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Layers className="w-6 h-6 text-primary-600" />
                    <Heading level={4} color="primary">{card.title}</Heading>
                  </div>
                </CardHeader>
                <CardBody>
                  <Body size={2} color="secondary">{card.description}</Body>
                  <div className="mt-4 flex gap-2">
                    <Badge variant="outline">Glass</Badge>
                    <Badge variant="secondary">Premium</Badge>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </DemoSection>

        {/* Interactive Elements */}
        <DemoSection
          title="Enhanced Interactions"
          description="Sophisticated micro-interactions with premium feel"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="primary" size="lg" className="hover-lift">
              Primary
            </Button>
            <Button variant="secondary" size="lg" className="hover-lift-subtle">
              Secondary
            </Button>
            <Button variant="outline" size="lg" className="hover-glow">
              Outline
            </Button>
            <Button variant="ghost" size="lg" className="hover-lift-subtle">
              Ghost
            </Button>
          </div>
        </DemoSection>

        {/* Selected Card Details */}
        <AnimatePresence>
          {selectedCard !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50"
              onClick={() => setSelectedCard(null)}
            >
              <Card variant="glass-ultra" padding="lg" className="max-w-md w-full">
                <div className="text-center space-y-4">
                  <Trophy className="w-16 h-16 mx-auto text-primary-600" />
                  <Display level={2} gradient="premium">
                    Enhanced Design
                  </Display>
                  <Body size={1} color="secondary">
                    This demonstrates the premium design system with enhanced visual hierarchy,
                    sophisticated interactions, and accessibility-first approach.
                  </Body>
                  <Button 
                    variant="primary" 
                    onClick={() => setSelectedCard(null)}
                    className="hover-lift"
                  >
                    Close
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EnhancedDesignDemo;
