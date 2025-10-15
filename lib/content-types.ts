export type TestimonialID = string;
export type TestimonialDoc = {
  id: TestimonialID;
  name: string;
  location?: string;
  rating: number;        // 0..5
  message: string;
  avatarUrl?: string;    // optional image URL
  createdAt: number;     // epoch ms
  published: boolean;    // toggle visibility
};

export type JournalID = string;
export type JournalDoc = {
  id: JournalID;
  title: string;
  slug: string;
  excerpt: string;
  coverUrl?: string;
  content: string;       // markdown or html
  published: boolean;
  publishedAt: number;   // epoch ms
  updatedAt: number;     // epoch ms
  author?: string;
};
