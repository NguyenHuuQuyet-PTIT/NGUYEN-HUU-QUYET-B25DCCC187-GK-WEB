import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBlog } from '../context/BlogContext';
import { formatDate } from '../services/validation';
import type { Comment } from '../types/models';
import { CommentForm } from './CommentForm';

export function CommentList({ postId, comments }: { postId: string; comments: Comment[] }) {
  const { user } = useAuth();
  const { comments: localComments } = useBlog();
  const location = useLocation();
  const added = localComments.filter((comment) => comment.postId === postId);

  return <section className="comments-section" aria-labelledby="comments-title">
    <div className="section-heading"><h2 id="comments-title">Trao đổi</h2>
      <span>{comments.length + added.length} bình luận</span></div>
    {user ? <CommentForm key={postId} postId={postId} />
      : <p className="login-prompt"><Link to="/login" state={{ from: location }}>Đăng nhập</Link> để tham gia bình luận.</p>}
    {comments.length + added.length === 0 && <p className="muted">Chưa có bình luận. Bạn có thể là người đầu tiên chia sẻ.</p>}
    <div className="comment-list">
      {added.map((comment) => <article className="comment" key={comment.id}>
        <div className="comment-heading"><strong>{comment.author}</strong>
          <time dateTime={comment.createdAt}>{formatDate(comment.createdAt)}</time></div>
        <p className="comment-body">{comment.body}</p>
      </article>)}
      {comments.map((comment) => <article className="comment" key={comment.id}>
        <div className="comment-heading"><strong>{comment.email}</strong><span>Bình luận cộng đồng</span></div>
        <h3>{comment.name}</h3>
        <p className="comment-body">{comment.body}</p>
      </article>)}
    </div>
  </section>;
}
