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

export interface Item {
  id: string;
  slug: string;
  title: string;
  summary: string;
  categories: Category[];
  slides: Slide[];
}

export interface ItemSummary {
  id: string;
  slug: string;
  title: string;
  summary: string;
  slide_count: number;
}

export interface SessionItem {
  position: number;
  item: Item;
}

export interface LearningSession {
  id: string;
  slug: string;
  title: string;
  description: string;
  position: number;
  items: SessionItem[];
  course: {
    id: string;
    title: string;
    project: {
      id: string;
      slug: string;
      name: string;
    };
  };
}

export interface SessionSummary {
  id: string;
  slug: string;
  title: string;
  position: number;
  slide_count: number;
}

export interface CourseSummary {
  id: string;
  slug: string;
  title: string;
  session_count: number;
}

export interface ProjectSummary {
  id: string;
  slug: string;
  name: string;
  course_count: number;
}

export interface Project extends ProjectSummary {
  description: string;
  courses: CourseSummary[];
}

export interface Course extends CourseSummary {
  description: string;
  project: Pick<ProjectSummary, "id" | "slug" | "name">;
  sessions: SessionSummary[];
}

export type ListViewMode = "grid" | "list";
