import { Link } from 'react-router-dom';
import { formatDate } from '../services/validation';
import type { BlogPost, User } from '../types/models';

export function PostCard({ post, author, index }: { post: BlogPost; author?: User; index: number }) {
  const local = 'createdAt' in post;
  return <article className="post-card">
    <div className="card-topline">
      <span className="post-label">{local ? 'Bài viết của bạn' : 'Bài viết cộng đồng'}</span>
      <span className="post-number">{String(index).padStart(2, '0')}</span>
    </div>
    <h3><Link to={`/posts/${post.id}`}>{post.title}</Link></h3>
    <p className="post-excerpt">{post.body}</p>
    <div className="card-bottom">
      <div className="author-info">
        <span className="author-avatar" aria-hidden="true">{local ? 'A' : author?.name.charAt(0) || '?'}</span>
        <div><span className="author-name">{local ? post.author : author?.name || 'Không rõ tác giả'}</span>
          <span className="post-source">{local ? formatDate(post.createdAt) : 'Cộng đồng MiniBlog'}</span>
        </div>
      </div>
      <Link className="read-link" to={`/posts/${post.id}`} aria-label={`Đọc bài: ${post.title}`}>Đọc bài</Link>
    </div>
  </article>;
}
