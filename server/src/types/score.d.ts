interface ScoreDetail {
  score: number;
  weight: number;
  feedback: string;
}

interface ScoreCategories {
  relevance: ScoreDetail;
  skills: ScoreDetail;
  experience: ScoreDetail;
  achievements: ScoreDetail;
  formatting: ScoreDetail;
  clarity: ScoreDetail;
  ats: ScoreDetail;
  education: ScoreDetail;
}
export interface Scores {
  overall_score: number;
  category_scores: ScoreCategories;
  action_items: string[];
}
