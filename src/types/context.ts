export type LifeStage = 'student' | 'early-career' | 'mid-career' | 'other';
export type UpbringingStyle = 'be-tough' | 'be-kind' | 'balanced';

export interface UserContext {
  lifeStage: LifeStage;
  dailyStructure: 'structured' | 'flexible' | 'mixed';
  socialExposure: 'low' | 'medium' | 'high';
  upbringing: UpbringingStyle;
  previousMBTIExperience: boolean;
  selfReportedType?: string;
  isTypingOther: boolean;
  otherPersonName?: string;
}
