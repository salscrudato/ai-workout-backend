/**
 * Social Features & Gamification Service
 * Provides achievement systems, streak tracking, and social challenges
 */

import { WorkoutPlanModel } from '../models/WorkoutPlan';
import { WorkoutSessionModel } from '../models/WorkoutSession';
import { ProfileModel } from '../models/Profile';

export interface UserGameProfile {
  userId: string;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  achievements: Achievement[];
  streaks: StreakData;
  badges: Badge[];
  socialStats: SocialStats;
  challenges: Challenge[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'consistency' | 'strength' | 'endurance' | 'social' | 'milestone' | 'special';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  points: number;
  dateEarned?: Date;
  progress?: number; // 0-1 for in-progress achievements
  requirements: AchievementRequirement[];
  rewards: Reward[];
}

export interface AchievementRequirement {
  type: 'workout_count' | 'streak_days' | 'total_time' | 'rating_average' | 'social_interaction';
  value: number;
  timeframe?: string; // e.g., 'week', 'month', 'all_time'
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  dateEarned: Date;
  category: string;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  streakType: 'daily' | 'weekly';
  lastWorkoutDate: Date;
  streakHistory: StreakRecord[];
  milestones: StreakMilestone[];
}

export interface StreakRecord {
  startDate: Date;
  endDate: Date;
  length: number;
  type: 'daily' | 'weekly';
}

export interface StreakMilestone {
  days: number;
  title: string;
  reward: Reward;
  achieved: boolean;
}

export interface SocialStats {
  workoutsShared: number;
  likesReceived: number;
  commentsReceived: number;
  friendsCount: number;
  challengesCompleted: number;
  challengesWon: number;
  motivationalMessages: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'individual' | 'group' | 'community';
  category: 'consistency' | 'strength' | 'endurance' | 'variety';
  startDate: Date;
  endDate: Date;
  participants: ChallengeParticipant[];
  requirements: ChallengeRequirement[];
  rewards: Reward[];
  status: 'upcoming' | 'active' | 'completed';
  userProgress?: number; // 0-1
}

export interface ChallengeParticipant {
  userId: string;
  username: string;
  progress: number;
  rank: number;
  joinDate: Date;
}

export interface ChallengeRequirement {
  type: 'workout_count' | 'total_minutes' | 'streak_days' | 'specific_exercise';
  target: number;
  description: string;
}

export interface Reward {
  type: 'experience' | 'badge' | 'title' | 'feature_unlock' | 'virtual_item';
  value: string | number;
  description: string;
}

export interface WorkoutShare {
  id: string;
  userId: string;
  workoutId: string;
  shareType: 'achievement' | 'workout_complete' | 'streak_milestone' | 'challenge_update';
  message?: string;
  timestamp: Date;
  likes: number;
  comments: Comment[];
  visibility: 'public' | 'friends' | 'private';
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: Date;
  likes: number;
}

export class SocialGamificationService {
  private userProfiles: Map<string, UserGameProfile> = new Map();
  private achievements: Achievement[] = [];
  private activeChallenges: Challenge[] = [];

  constructor() {
    this.initializeAchievements();
    this.initializeChallenges();
  }

  /**
   * Get user's gamification profile
   */
  async getUserGameProfile(userId: string): Promise<UserGameProfile> {
    if (this.userProfiles.has(userId)) {
      return this.userProfiles.get(userId)!;
    }

    const profile = await this.createUserGameProfile(userId);
    this.userProfiles.set(userId, profile);
    return profile;
  }

  /**
   * Update user progress after workout completion
   */
  async updateProgressAfterWorkout(userId: string, workoutData: any, feedback: any): Promise<{
    experienceGained: number;
    achievementsUnlocked: Achievement[];
    levelUp: boolean;
    streakUpdated: StreakData;
  }> {
    const profile = await this.getUserGameProfile(userId);
    
    // Calculate experience gained
    const experienceGained = this.calculateExperienceGain(workoutData, feedback);
    profile.experience += experienceGained;

    // Check for level up
    const levelUp = this.checkLevelUp(profile);

    // Update streaks
    const streakUpdated = this.updateStreaks(profile, new Date());

    // Check for new achievements
    const achievementsUnlocked = await this.checkAchievements(userId, profile);

    // Update profile
    this.userProfiles.set(userId, profile);

    return {
      experienceGained,
      achievementsUnlocked,
      levelUp,
      streakUpdated
    };
  }

  /**
   * Share workout achievement
   */
  async shareWorkout(userId: string, workoutId: string, shareType: WorkoutShare['shareType'], message?: string): Promise<WorkoutShare> {
    const share: WorkoutShare = {
      id: `share_${Date.now()}_${userId}`,
      userId,
      workoutId,
      shareType,
      message,
      timestamp: new Date(),
      likes: 0,
      comments: [],
      visibility: 'friends'
    };

    // Update social stats
    const profile = await this.getUserGameProfile(userId);
    profile.socialStats.workoutsShared++;
    
    // Award experience for sharing
    profile.experience += 10;

    this.userProfiles.set(userId, profile);

    return share;
  }

  /**
   * Get available challenges for user
   */
  async getAvailableChallenges(_userId: string): Promise<Challenge[]> {
    // Filter challenges based on user level and preferences
    return this.activeChallenges.filter(challenge => {
      // Basic filtering - could be more sophisticated
      return challenge.status === 'active' || challenge.status === 'upcoming';
    });
  }

  /**
   * Join a challenge
   */
  async joinChallenge(userId: string, challengeId: string): Promise<boolean> {
    const challenge = this.activeChallenges.find(c => c.id === challengeId);
    if (!challenge || challenge.status !== 'active') {
      return false;
    }

    // Check if user is already participating
    if (challenge.participants.some(p => p.userId === userId)) {
      return false;
    }

    // Add user to challenge
    const profile = await ProfileModel.findOne({ userId });
    challenge.participants.push({
      userId,
      username: (profile as any)?.name || 'Anonymous',
      progress: 0,
      rank: challenge.participants.length + 1,
      joinDate: new Date()
    });

    // Update user's challenges
    const gameProfile = await this.getUserGameProfile(userId);
    gameProfile.challenges.push(challenge);

    return true;
  }

  /**
   * Get leaderboard for a challenge
   */
  async getChallengeLeaderboard(challengeId: string): Promise<ChallengeParticipant[]> {
    const challenge = this.activeChallenges.find(c => c.id === challengeId);
    if (!challenge) return [];

    return challenge.participants
      .sort((a, b) => b.progress - a.progress)
      .map((participant, index) => ({
        ...participant,
        rank: index + 1
      }));
  }

  /**
   * Create initial user game profile
   */
  private async createUserGameProfile(userId: string): Promise<UserGameProfile> {
    const [_workoutHistory, sessionHistory] = await Promise.all([
      WorkoutPlanModel.find({ userId }, { limit: 50 }),
      WorkoutSessionModel.find({ userId }, { limit: 100 })
    ]);

    const completedSessions = sessionHistory.filter(s => s.completedAt);
    const initialExperience = completedSessions.length * 25; // 25 XP per completed workout
    const level = this.calculateLevel(initialExperience);

    return {
      userId,
      level,
      experience: initialExperience,
      experienceToNextLevel: this.getExperienceForLevel(level + 1) - initialExperience,
      achievements: [],
      streaks: this.calculateInitialStreaks(sessionHistory),
      badges: [],
      socialStats: {
        workoutsShared: 0,
        likesReceived: 0,
        commentsReceived: 0,
        friendsCount: 0,
        challengesCompleted: 0,
        challengesWon: 0,
        motivationalMessages: 0
      },
      challenges: []
    };
  }

  /**
   * Initialize achievement system
   */
  private initializeAchievements(): void {
    this.achievements = [
      {
        id: 'first_workout',
        title: 'Getting Started',
        description: 'Complete your first workout',
        category: 'milestone',
        rarity: 'common',
        points: 50,
        requirements: [{ type: 'workout_count', value: 1 }],
        rewards: [{ type: 'experience', value: 50, description: '50 bonus XP' }]
      },
      {
        id: 'week_warrior',
        title: 'Week Warrior',
        description: 'Maintain a 7-day workout streak',
        category: 'consistency',
        rarity: 'uncommon',
        points: 100,
        requirements: [{ type: 'streak_days', value: 7 }],
        rewards: [
          { type: 'experience', value: 100, description: '100 bonus XP' },
          { type: 'badge', value: 'week_warrior', description: 'Week Warrior badge' }
        ]
      },
      {
        id: 'century_club',
        title: 'Century Club',
        description: 'Complete 100 total workouts',
        category: 'milestone',
        rarity: 'rare',
        points: 500,
        requirements: [{ type: 'workout_count', value: 100 }],
        rewards: [
          { type: 'experience', value: 500, description: '500 bonus XP' },
          { type: 'title', value: 'Fitness Enthusiast', description: 'Special title' }
        ]
      },
      {
        id: 'perfectionist',
        title: 'Perfectionist',
        description: 'Maintain 5.0 average rating for 10 workouts',
        category: 'strength',
        rarity: 'epic',
        points: 300,
        requirements: [{ type: 'rating_average', value: 5.0, timeframe: 'recent_10' }],
        rewards: [
          { type: 'experience', value: 300, description: '300 bonus XP' },
          { type: 'feature_unlock', value: 'advanced_analytics', description: 'Unlock advanced analytics' }
        ]
      },
      {
        id: 'social_butterfly',
        title: 'Social Butterfly',
        description: 'Share 25 workout achievements',
        category: 'social',
        rarity: 'uncommon',
        points: 150,
        requirements: [{ type: 'social_interaction', value: 25 }],
        rewards: [
          { type: 'experience', value: 150, description: '150 bonus XP' },
          { type: 'badge', value: 'social_butterfly', description: 'Social Butterfly badge' }
        ]
      }
    ];
  }

  /**
   * Initialize challenge system
   */
  private initializeChallenges(): void {
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    this.activeChallenges = [
      {
        id: 'weekly_consistency',
        title: 'Weekly Consistency Challenge',
        description: 'Complete 5 workouts this week',
        type: 'community',
        category: 'consistency',
        startDate: now,
        endDate: weekFromNow,
        participants: [],
        requirements: [
          { type: 'workout_count', target: 5, description: 'Complete 5 workouts' }
        ],
        rewards: [
          { type: 'experience', value: 200, description: '200 bonus XP' },
          { type: 'badge', value: 'weekly_warrior', description: 'Weekly Warrior badge' }
        ],
        status: 'active'
      },
      {
        id: 'strength_builder',
        title: 'Strength Builder',
        description: 'Complete 300 minutes of strength training',
        type: 'individual',
        category: 'strength',
        startDate: now,
        endDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        participants: [],
        requirements: [
          { type: 'total_minutes', target: 300, description: 'Complete 300 minutes of strength training' }
        ],
        rewards: [
          { type: 'experience', value: 400, description: '400 bonus XP' },
          { type: 'title', value: 'Strength Seeker', description: 'Strength Seeker title' }
        ],
        status: 'active'
      }
    ];
  }

  /**
   * Calculate experience gain from workout
   */
  private calculateExperienceGain(workoutData: any, feedback: any): number {
    let baseXP = 25; // Base XP per workout

    // Bonus for workout duration
    const duration = workoutData.duration || 30;
    const durationBonus = Math.floor(duration / 10) * 2; // 2 XP per 10 minutes

    // Bonus for high rating
    const rating = feedback.rating || 3;
    const ratingBonus = rating > 4 ? 10 : rating > 3 ? 5 : 0;

    // Bonus for workout completion
    const completionBonus = feedback.completed ? 15 : 0;

    return baseXP + durationBonus + ratingBonus + completionBonus;
  }

  /**
   * Check if user leveled up
   */
  private checkLevelUp(profile: UserGameProfile): boolean {
    const newLevel = this.calculateLevel(profile.experience);
    if (newLevel > profile.level) {
      profile.level = newLevel;
      profile.experienceToNextLevel = this.getExperienceForLevel(newLevel + 1) - profile.experience;
      return true;
    }
    profile.experienceToNextLevel = this.getExperienceForLevel(profile.level + 1) - profile.experience;
    return false;
  }

  /**
   * Update user streaks
   */
  private updateStreaks(profile: UserGameProfile, workoutDate: Date): StreakData {
    const lastWorkout = profile.streaks.lastWorkoutDate;
    const daysSinceLastWorkout = lastWorkout ? 
      Math.floor((workoutDate.getTime() - lastWorkout.getTime()) / (24 * 60 * 60 * 1000)) : 999;

    if (daysSinceLastWorkout <= 1) {
      // Continue or maintain streak
      if (daysSinceLastWorkout === 1) {
        profile.streaks.currentStreak++;
      }
    } else {
      // Streak broken, start new one
      if (profile.streaks.currentStreak > 0) {
        profile.streaks.streakHistory.push({
          startDate: new Date(lastWorkout.getTime() - (profile.streaks.currentStreak - 1) * 24 * 60 * 60 * 1000),
          endDate: lastWorkout,
          length: profile.streaks.currentStreak,
          type: 'daily'
        });
      }
      profile.streaks.currentStreak = 1;
    }

    // Update longest streak
    if (profile.streaks.currentStreak > profile.streaks.longestStreak) {
      profile.streaks.longestStreak = profile.streaks.currentStreak;
    }

    profile.streaks.lastWorkoutDate = workoutDate;
    return profile.streaks;
  }

  /**
   * Check for new achievements
   */
  private async checkAchievements(userId: string, profile: UserGameProfile): Promise<Achievement[]> {
    const newAchievements: Achievement[] = [];
    const [_workoutHistory, sessionHistory] = await Promise.all([
      WorkoutPlanModel.find({ userId }) as Promise<any[]>,
      WorkoutSessionModel.find({ userId }) as Promise<any[]>
    ]);

    const completedSessions = sessionHistory.filter(s => s.completedAt);

    for (const achievement of this.achievements) {
      // Skip if already earned
      if (profile.achievements.some(a => a.id === achievement.id)) continue;

      let requirementsMet = true;

      for (const requirement of achievement.requirements) {
        switch (requirement.type) {
          case 'workout_count':
            if (completedSessions.length < requirement.value) {
              requirementsMet = false;
            }
            break;
          case 'streak_days':
            if (profile.streaks.currentStreak < requirement.value) {
              requirementsMet = false;
            }
            break;
          case 'rating_average':
            const recentRatings = completedSessions
              .slice(-10)
              .map(s => s.feedback?.rating)
              .filter(r => r !== undefined);
            const avgRating = recentRatings.length > 0 ? 
              recentRatings.reduce((sum, r) => sum + r, 0) / recentRatings.length : 0;
            if (avgRating < requirement.value) {
              requirementsMet = false;
            }
            break;
          case 'social_interaction':
            if (profile.socialStats.workoutsShared < requirement.value) {
              requirementsMet = false;
            }
            break;
        }
      }

      if (requirementsMet) {
        const earnedAchievement = { ...achievement, dateEarned: new Date() };
        profile.achievements.push(earnedAchievement);
        profile.experience += achievement.points;
        newAchievements.push(earnedAchievement);
      }
    }

    return newAchievements;
  }

  // Helper methods
  private calculateLevel(experience: number): number {
    // Level formula: level = floor(sqrt(experience / 100))
    return Math.floor(Math.sqrt(experience / 100)) + 1;
  }

  private getExperienceForLevel(level: number): number {
    // Experience needed for level: (level - 1)^2 * 100
    return Math.pow(level - 1, 2) * 100;
  }

  private calculateInitialStreaks(sessionHistory: any[]): StreakData {
    const completedSessions = sessionHistory
      .filter(s => s.completedAt)
      .sort((a, b) => b.completedAt.toDate().getTime() - a.completedAt.toDate().getTime());

    let currentStreak = 0;
    let longestStreak = 0;
    let lastWorkoutDate = new Date(0);

    if (completedSessions.length > 0) {
      lastWorkoutDate = completedSessions[0].completedAt.toDate();
      
      // Calculate current streak
      let streakDate = new Date();
      for (const session of completedSessions) {
        const sessionDate = session.completedAt.toDate();
        const daysDiff = Math.floor((streakDate.getTime() - sessionDate.getTime()) / (24 * 60 * 60 * 1000));
        
        if (daysDiff <= 1) {
          currentStreak++;
          streakDate = sessionDate;
        } else {
          break;
        }
      }

      // Calculate longest streak (simplified)
      longestStreak = Math.max(currentStreak, 5); // Placeholder
    }

    return {
      currentStreak,
      longestStreak,
      streakType: 'daily',
      lastWorkoutDate,
      streakHistory: [],
      milestones: [
        { days: 7, title: 'Week Warrior', reward: { type: 'badge', value: 'week_warrior', description: 'Week Warrior badge' }, achieved: currentStreak >= 7 },
        { days: 30, title: 'Month Master', reward: { type: 'badge', value: 'month_master', description: 'Month Master badge' }, achieved: currentStreak >= 30 },
        { days: 100, title: 'Centurion', reward: { type: 'title', value: 'Centurion', description: 'Centurion title' }, achieved: currentStreak >= 100 }
      ]
    };
  }
}

export const socialGamificationService = new SocialGamificationService();

// File cleaned up - removed duplicate class definitions
