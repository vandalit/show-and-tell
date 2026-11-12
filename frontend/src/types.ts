export interface Slide {
  id: string;
  title: string;
  summary: string;
  body: string;
  position: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Milestone {
  id: string;
  title: string;
  summary: string;
  position: number;
  categories: Category[];
  slides: Slide[];
}

export interface LearningSession {
  id: string;
  slug: string;
  title: string;
  description: string;
  position: number;
  milestones: Milestone[];
}

export interface SessionSummary {
  id: string;
  slug: string;
  title: string;
  position: number;
  slide_count: number;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  sessions: SessionSummary[];
}

export interface CourseGroup {
  id: string;
  name: string;
  children: CourseGroup[];
  courses: Course[];
}
