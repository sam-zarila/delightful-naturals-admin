// app/api/admin/types.ts (optional helper file)
export type TestimonialDoc = {
  id: string;
  name: string;
  location?: string;
  rating: number;      // 0..5
  message: string;
  avatarUrl?: string;
  createdAt: number;   // epoch ms
  published: boolean;
};

export type JournalDoc = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverUrl?: string;
  content: string;     // markdown or html
  author?: string;
  published: boolean;
  publishedAt: number;
  updatedAt: number;
};
