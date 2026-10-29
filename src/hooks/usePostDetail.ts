import { useBlog } from '../context/BlogContext';
import { isComments, isLocalId, isPost, isRemoteId, isUser } from '../services/guards';
import { useFetch } from './useFetch';

export function usePostDetail(id: string) {
  const { posts } = useBlog();
  const local = posts.find((post) => post.id === id);
  const remoteId = isRemoteId(id);
  const valid = remoteId || isLocalId(id);
  const remote = useFetch(remoteId ? `/posts/${id}` : null, isPost);
  const comments = useFetch(remoteId ? `/posts/${id}/comments` : null, isComments);
  const author = useFetch(remote.data ? `/users/${remote.data.userId}` : null, isUser);
  const notFound = !valid || (!remoteId && !local) || remote.error?.status === 404;
  const error = remote.error || comments.error || author.error;

  return {
    post: local || remote.data,
    author: local ? 'admin' : author.data?.name,
    comments: comments.data || [],
    notFound,
    error,
    loading: remote.loading || comments.loading || author.loading,
    retry: () => { remote.retry(); comments.retry(); author.retry(); },
  };
}
