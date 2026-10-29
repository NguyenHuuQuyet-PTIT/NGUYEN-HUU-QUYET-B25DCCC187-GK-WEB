import { createContext, useContext, type ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { isLocalComments, isLocalPosts } from '../services/guards';
import type { LocalComment, LocalPost } from '../types/models';

interface BlogValue {
  posts: LocalPost[];
  comments: LocalComment[];
  addPost: (title: string, body: string) => LocalPost | null;
  addComment: (postId: string, body: string) => boolean;
  postError: string;
  commentError: string;
}

const BlogContext = createContext<BlogValue | null>(null);

export function BlogProvider({ children }: { children: ReactNode }) {
  const postStore = useLocalStorage<LocalPost[]>('miniblog.posts', [], isLocalPosts);
  const commentStore = useLocalStorage<LocalComment[]>('miniblog.comments', [], isLocalComments);
  const addPost = (title: string, body: string) => {
    const post: LocalPost = {
      id: `local-${crypto.randomUUID()}`, title: title.trim(), body: body.trim(),
      author: 'admin', createdAt: new Date().toISOString(),
    };
    return postStore.save((previous) => [post, ...previous]) ? post : null;
  };
  const addComment = (postId: string, body: string) => commentStore.save((previous) => [{
    id: `local-${crypto.randomUUID()}`, postId, body: body.trim(),
    author: 'admin', createdAt: new Date().toISOString(),
  }, ...previous]);

  return <BlogContext.Provider value={{
    posts: postStore.value, comments: commentStore.value, addPost, addComment,
    postError: postStore.error, commentError: commentStore.error,
  }}>{children}</BlogContext.Provider>;
}

export function useBlog() {
  const context = useContext(BlogContext);
  if (!context) throw new Error('BlogProvider chưa được khởi tạo.');
  return context;
}
