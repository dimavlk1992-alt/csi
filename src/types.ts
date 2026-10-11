export type PriorityLevel = 'high' | 'normal';

export interface ChecklistItem {
  id: string;
  text: string;
  category: string;
  completed: boolean;
  completedAt?: string;
  priority?: PriorityLevel;
  tip?: string;
  note?: string;
  labName?: string;
  packagingAdvice?: string;
  labAdvice?: string;
}

export interface ChecklistSession {
  id: string; // e.g. "DEMO-CHK-0001" or "CHK-2026-0042"
  sceneType: string;
  sceneDescription?: string;
  location?: string;
  examinerName?: string;
  createdAt: string; // ISO string
  completedAt?: string; // ISO string
  isCompleted: boolean;
  items: ChecklistItem[];
  isAiGenerated?: boolean;
  generatedBy?: string; // model id when isAiGenerated, e.g. 'claude-sonnet-5-5'
  generalNotes?: string;
}

export interface StandardSceneTemplate {
  id: string;
  title: string;
  description: string;
  iconName: string;
  items: Omit<ChecklistItem, 'completed' | 'completedAt' | 'note'>[];
}
