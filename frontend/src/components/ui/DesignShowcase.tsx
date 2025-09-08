import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap, Heart, Star, Trophy, Target } from 'lucide-react';
import { Container, Stack, Grid, Section, Flex, ContentArea } from './Layout';
import { Display, Heading, Body } from './Typography';
import Button from './Button';
import Card from './Card';
import { microInteractionVariants } from './animations/variants';

/**
 * Design Showcase Component
 * 
 * Demonstrates the enhanced UI/UX system with:
 * - Premium typography with sophisticated scaling
 * - Advanced color psychology implementation
 * - Sophisticated micro-interactions
 * - Premium component variants
 * - Enhanced layout system
 */

const DesignShowcase: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Hero Section with Premium Typography */}
      <Section spacing="4xl" background="none">
        <Container size="lg">
          <ContentArea width="medium">
            <Stack spacing="xl" align="center" className="text-center">
              <motion.div
                initial="initial"
                animate="animate"
                variants={microInteractionVariants.floatingElement}
                className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-xl"
              >
                <Sparkles className="w-10 h-10 text-white" />
              </motion.div>

              <Display
                level={1}
                gradient="premium"
                animate="shimmer"
                className="max-w-4xl"
              >
                Premium UI Design System
              </Display>

              <Body size={1} color="secondary" className="max-w-2xl text-xl">
                Experience sophisticated design patterns with advanced micro-interactions,
                premium typography, and psychologically-optimized color systems.
              </Body>

              <Flex gap="md" className="flex-wrap justify-center">
                <Button variant="luxury" size="lg" className="px-8">
                  <Zap className="w-5 h-5 mr-2" />
                  Explore Features
                </Button>
                <Button variant="minimal" size="lg" className="px-8">
                  View Documentation
                </Button>
              </Flex>
            </Stack>
          </ContentArea>
        </Container>
      </Section>

      {/* Typography Showcase */}
      <Section spacing="3xl" background="subtle">
        <Container size="lg">
          <Stack spacing="xl">
            <ContentArea width="medium" className="text-center">
              <Heading level={2} gradient="luxury" className="mb-4">
                Advanced Typography System
              </Heading>
              <Body size={1} color="secondary">
                Mathematical scaling with enhanced readability and sophisticated visual hierarchy
              </Body>
            </ContentArea>

            <Grid columns={2} gap="lg">
              <Card variant="luxury" padding="lg" hover>
                <Stack spacing="md">
                  <Display level={2} gradient="electric">Display Heading</Display>
                  <Heading level={3} color="primary">Section Heading</Heading>
                  <Body size={1} color="secondary">
                    Premium body text with optimal line spacing and enhanced readability.
                    Designed for comfortable reading across all device sizes.
                  </Body>
                </Stack>
              </Card>

              <Card variant="sophisticated" padding="lg" hover>
                <Stack spacing="md">
                  <Heading level={4} gradient="modern">Gradient Text Effects</Heading>
                  <Body size={2} color="muted">
                    Sophisticated gradient animations with smooth transitions and
                    accessibility-compliant contrast ratios.
                  </Body>
                </Stack>
              </Card>
            </Grid>
          </Stack>
        </Container>
      </Section>

      {/* Button Variants Showcase */}
      <Section spacing="3xl" background="none">
        <Container size="lg">
          <Stack spacing="xl">
            <ContentArea width="medium" className="text-center">
              <Heading level={2} gradient="fresh" className="mb-4">
                Premium Button Components
              </Heading>
              <Body size={1} color="secondary">
                Sophisticated variants with advanced micro-interactions and haptic feedback
              </Body>
            </ContentArea>

            <Grid columns={3} gap="md">
              <motion.div
                whileHover="hover"
                whileTap="tap"
                variants={microInteractionVariants.premiumButton}
              >
                <Button variant="premium" size="lg" fullWidth>
                  <Star className="w-5 h-5 mr-2" />
                  Premium
                </Button>
              </motion.div>

              <motion.div
                whileHover="hover"
                whileTap="tap"
                variants={microInteractionVariants.premiumButton}
              >
                <Button variant="luxury" size="lg" fullWidth>
                  <Trophy className="w-5 h-5 mr-2" />
                  Luxury
                </Button>
              </motion.div>

              <motion.div
                whileHover="hover"
                whileTap="tap"
                variants={microInteractionVariants.premiumButton}
              >
                <Button variant="electric" size="lg" fullWidth>
                  <Zap className="w-5 h-5 mr-2" />
                  Electric
                </Button>
              </motion.div>

              <Button variant="glass" size="lg" fullWidth>
                <Heart className="w-5 h-5 mr-2" />
                Glass
              </Button>

              <Button variant="minimal" size="lg" fullWidth>
                <Target className="w-5 h-5 mr-2" />
                Minimal
              </Button>

              <Button variant="gradient" size="lg" fullWidth>
                <Sparkles className="w-5 h-5 mr-2" />
                Gradient
              </Button>
            </Grid>
          </Stack>
        </Container>
      </Section>

      {/* Card Variants Showcase */}
      <Section spacing="3xl" background="premium">
        <Container size="lg">
          <Stack spacing="xl">
            <ContentArea width="medium" className="text-center">
              <Heading level={2} gradient="deep" className="mb-4">
                Sophisticated Card Components
              </Heading>
              <Body size={1} color="secondary">
                Premium variants with glass morphism effects and advanced hover states
              </Body>
            </ContentArea>

            <Grid columns={2} gap="lg">
              <motion.div
                whileHover="hover"
                whileTap="tap"
                variants={microInteractionVariants.luxuryCard}
              >
                <Card variant="luxury" padding="lg" hover clickable>
                  <Stack spacing="md">
                    <Heading level={4} color="primary">Luxury Card</Heading>
                    <Body size={2} color="secondary">
                      Premium styling with sophisticated gradients and enhanced shadows.
                    </Body>
                  </Stack>
                </Card>
              </motion.div>

              <Card variant="glass-blue-premium" padding="lg" hover>
                <Stack spacing="md">
                  <Heading level={4} color="accent">Glass Morphism</Heading>
                  <Body size={2} color="secondary">
                    Advanced glass effects with backdrop blur and subtle transparency.
                  </Body>
                </Stack>
              </Card>

              <Card variant="sophisticated" padding="lg" hover>
                <Stack spacing="md">
                  <Heading level={4} color="primary">Sophisticated</Heading>
                  <Body size={2} color="secondary">
                    Refined styling with subtle gradients and premium feel.
                  </Body>
                </Stack>
              </Card>

              <Card variant="premium-elevated" padding="lg" hover>
                <Stack spacing="md">
                  <Heading level={4} color="primary">Premium Elevated</Heading>
                  <Body size={2} color="secondary">
                    Enhanced elevation with sophisticated shadow systems.
                  </Body>
                </Stack>
              </Card>
            </Grid>
          </Stack>
        </Container>
      </Section>

      {/* Micro-Interactions Demo */}
      <Section spacing="3xl" background="none">
        <Container size="lg">
          <ContentArea width="medium" className="text-center">
            <Stack spacing="xl">
              <Heading level={2} gradient="electric" className="mb-4">
                Delightful Micro-Interactions
              </Heading>
              <Body size={1} color="secondary" className="mb-8">
                Sophisticated animations with premium easing curves and haptic feedback
              </Body>

              <Flex justify="center" gap="lg" className="flex-wrap">
                <motion.div
                  initial="initial"
                  animate="animate"
                  variants={microInteractionVariants.floatingElement}
                  className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg"
                >
                  <Sparkles className="w-8 h-8 text-white" />
                </motion.div>

                <motion.div
                  whileHover="hover"
                  whileTap="tap"
                  variants={microInteractionVariants.premiumButton}
                  className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg cursor-pointer"
                >
                  <Heart className="w-8 h-8 text-white" />
                </motion.div>

                <motion.div
                  initial="initial"
                  animate="animate"
                  variants={microInteractionVariants.successFeedback}
                  className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg"
                >
                  <Trophy className="w-8 h-8 text-white" />
                </motion.div>
              </Flex>
            </Stack>
          </ContentArea>
        </Container>
      </Section>
    </div>
  );
};

export default DesignShowcase;
