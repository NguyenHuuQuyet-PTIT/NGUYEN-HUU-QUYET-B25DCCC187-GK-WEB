import { Link, useParams } from 'react-router-dom';
import { CommentList } from '../components/CommentList';
import { ErrorState, Loading, NotFoundContent } from '../components/Feedback';
import { usePostDetail } from '../hooks/usePostDetail';
import { formatDate } from '../services/validation';

export function PostDetailPage() {
  const { id = '' } = useParams();
  const { post, author, comments, loading, error, notFound, retry } = usePostDetail(id);
  if (notFound) return <NotFoundContent isPost />;

  return <div className="reading-layout">
    <Link className="back-link" to="/">Về danh sách bài viết</Link>
    {loading && <Loading label="Đang tải bài viết và bình luận…" />}
    {!loading && error && <ErrorState message={error.message} retry={retry} />}
    {!loading && !error && post && <>
      <article className="post-detail">
        <p className="eyebrow">{'createdAt' in post ? 'BÀI VIẾT CỦA BẠN' : 'BÀI VIẾT CỘNG ĐỒNG'}</p>
        <h1>{post.title}</h1>
        <div className="detail-meta"><strong>{author}</strong>
          {'createdAt' in post ? <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
            : <span>Cộng đồng MiniBlog</span>}</div>
        <div className="post-body">{post.body}</div>
      </article>
      <CommentList key={id} postId={id} comments={comments} />
    </>}
  </div>;
}
