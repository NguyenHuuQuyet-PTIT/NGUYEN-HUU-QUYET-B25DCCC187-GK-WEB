export interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
}

export interface Comment {
  id: number;
  postId: number;
  name: string;
  email: string;
  body: string;
}

export interface LocalPost {
  id: string;
  title: string;
  body: string;
  author: 'admin';
  createdAt: string;
}

export interface LocalComment {
  id: string;
  postId: string;
  body: string;
  author: 'admin';
  createdAt: string;
}

export interface Session {
  username: 'admin';
}

export type BlogPost = Post | LocalPost;
export type TypeGuard<T> = (value: unknown) => value is T;
export type SortOrder = 'newest' | 'oldest' | 'title';
