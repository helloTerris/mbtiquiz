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

export interface UserContext {
  lifeStage: LifeStage;
  lifeStageDetail?: string;
  workEnvironment: WorkEnvironment;
  workEnvironmentDetail?: string;
  dailyStructure: 'structured' | 'flexible' | 'mixed';
  socialExposure: 'low' | 'medium' | 'high';
  livingSituation: LivingSituation;
  stressLevel: StressLevel;
  upbringing: UpbringingStyle;
  previousMBTIExperience: boolean;
  selfReportedType?: string;
  isTypingOther: boolean;
  otherPersonName?: string;
}
