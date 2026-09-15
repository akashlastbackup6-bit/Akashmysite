export type BrandId = 'islamic' | 'psychology';

export type UserRole = 'admin' | 'user';

export type PostType = 'article' | 'video';

export type PostStatus = 'draft' | 'published';

export type BlockType = 'text' | 'heading' | 'image' | 'quote' | 'youtube' | 'divider' | 'callout';
export type ContentBlockType = BlockType;

export interface ContentBlock {
  id: string;
  type: BlockType;
  content: string;
  caption?: string;
  level?: 1 | 2 | 3; // for headings
}

export interface StudyMaterial {
  id?: string;
  title: string;
  url: string;
  type?: string;
}

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string;
  bio?: string;
  role: UserRole;
  brandPreference: BrandId;
  createdAt: string;
}

export interface Post {
  id: string;
  title: string;
  titleBn?: string;
  slug: string;
  excerpt: string;
  excerptBn?: string;
  coverImage?: string;
  type: PostType;
  brand: BrandId;
  body: ContentBlock[];
  youtubeUrl?: string;
  transcript?: string;
  studyMaterials?: StudyMaterial[];
  tags: string[];
  authorId: string;
  authorName?: string;
  authorAvatar?: string;
  status: PostStatus;
  scheduledFor?: string | null;
  likeCount: number;
  commentCount: number;
  viewCount: number;
  createdAt: string;
  publishedAt?: string;
  updatedAt?: string;
}

export interface CommentItem {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  parentCommentId?: string | null;
  createdAt: string;
  likes?: number;
}

export interface BrandConfig {
  id: BrandId;
  name: string;
  nameBn?: string;
  tagline: string;
  taglineBn?: string;
  shortName: string;
  shortNameBn?: string;
  primaryColor: string;
  accentColor: string;
  headingFont: string;
  bodyFont: string;
  logoIcon: string;
  description: string;
  descriptionBn?: string;
}
