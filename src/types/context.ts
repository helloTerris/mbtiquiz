export type LifeStage =
  | 'student'
  | 'early-career'
  | 'mid-career'
  | 'freelance'
  | 'caregiver'
  | 'retired'
  | 'between-jobs'
  | 'other';

export type WorkEnvironment =
  | 'corporate'
  | 'startup'
  | 'creative'
  | 'service'
  | 'technical'
  | 'other'
  | 'na';

export type LivingSituation = 'alone' | 'partner-family' | 'roommates';

export type StressLevel = 'low' | 'moderate' | 'high';

export type UpbringingStyle = 'be-tough' | 'be-kind' | 'balanced';

export type CulturalValues = 'individualist' | 'collectivist' | 'mixed';

export type MentalEnergy = 'clear' | 'scattered' | 'low' | 'anxious';

export interface UserContext {
  lifeStage: LifeStage;
  lifeStageDetail?: string;
  workEnvironment: WorkEnvironment;
  workEnvironmentDetail?: string;
  dailyStructure: 'structured' | 'flexible' | 'mixed';
  socialExposure: 'low' | 'medium' | 'high';
  livingSituation: LivingSituation;
  hobbies?: string;
  stressLevel: StressLevel;
  mentalEnergy: MentalEnergy;
  upbringing: UpbringingStyle;
  culturalValues: CulturalValues;
  previousMBTIExperience: boolean;
  selfReportedType?: string;
  isTypingOther: boolean;
  otherPersonName?: string;
}
