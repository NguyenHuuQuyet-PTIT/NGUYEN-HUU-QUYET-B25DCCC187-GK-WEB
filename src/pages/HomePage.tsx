import { Link, useSearchParams } from 'react-router-dom';
import { ErrorState, Loading } from '../components/Feedback';
import { Pagination } from '../components/Pagination';
import { PostCard } from '../components/PostCard';
import { PostFilters } from '../components/PostFilters';
import { useAuth } from '../context/AuthContext';
import { useBlog } from '../context/BlogContext';
import { useFetch } from '../hooks/useFetch';
import { isPosts, isUsers } from '../services/guards';
import type { BlogPost, SortOrder } from '../types/models';

const PAGE_SIZE = 9;

export function HomePage() {
  const { user } = useAuth();
  const { posts: localPosts } = useBlog();
  const posts = useFetch('/posts', isPosts);
  const users = useFetch('/users', isUsers);
  const [params, setParams] = useSearchParams();
  const query = params.get('q') || '';
  const sortValue = params.get('sort');
  const sort: SortOrder = sortValue === 'oldest' || sortValue === 'title' ? sortValue : 'newest';
  const combined: BlogPost[] = [...localPosts, ...(posts.data || [])];
  const filtered = combined.filter((post) => post.title.toLocaleLowerCase('vi-VN')
    .includes(query.trim().toLocaleLowerCase('vi-VN')));
  filtered.sort((first, second) => {
    if (sort === 'title') return first.title.localeCompare(second.title, 'vi');
    const a = 'createdAt' in first ? Date.parse(first.createdAt) : first.id;
    const b = 'createdAt' in second ? Date.parse(second.createdAt) : second.id;
    return sort === 'oldest' ? a - b : b - a;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageValue = Number(params.get('page') || 1);
  const current = Number.isSafeInteger(pageValue) ? Math.min(Math.max(1, pageValue), totalPages) : 1;
  const visible = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const error = posts.error || users.error;
  const loading = posts.loading || users.loading;

  function update(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setParams(next, { replace: true });
  }

  function changePage(page: number) {
    const next = new URLSearchParams(params);
    next.set('page', String(page));
    setParams(next);
    document.getElementById('posts-heading')?.scrollIntoView({ block: 'start' });
  }

  return <>
    <section className="home-hero">
      <div className="hero-copy">
        <p className="eyebrow">MINIBLOG</p>
        <h1>Đọc bài viết.<br /><em>Chia sẻ ý kiến của bạn.</em></h1>
        <p className="hero-description">Tìm bài theo tiêu đề, đọc nội dung<br className="desktop-break" /> và trao đổi qua bình luận.</p>
      </div>
      <aside className="hero-note">
        <span className="eyebrow">THAM GIA MINIBLOG</span>
        <h2>Viết bài và<br /> trao đổi cùng mọi người.</h2>
        <Link to={user ? '/write' : '/login'} state={user ? undefined : { from: { pathname: '/write' } }}>
          Viết bài mới
        </Link>
      </aside>
    </section>
    <section className="posts-section" aria-labelledby="posts-heading">
      <div className="section-heading">
        <div><p className="eyebrow">KHÁM PHÁ MINIBLOG</p><h2 id="posts-heading">Bài viết mới</h2></div>
        {!loading && !error && <span className="post-count">{combined.length} bài viết</span>}
      </div>
      <PostFilters query={query} sort={sort} onQueryChange={(value) => update('q', value)}
        onSortChange={(value) => update('sort', value)} />
      {loading && <Loading label="Đang tải bài viết và tác giả…" />}
      {!loading && error && <ErrorState message={error.message} retry={() => { posts.retry(); users.retry(); }} />}
      {!loading && !error && <>
        <p className="results-summary" role="status">
          {query.trim() ? `${filtered.length} kết quả cho “${query.trim()}”` : 'Chọn một bài viết để đọc.'}
          {filtered.length > 0 && <span>Trang {current} / {totalPages}</span>}
        </p>
        {filtered.length === 0 ? <div className="feedback">
          <h3>Chưa tìm thấy bài viết phù hợp</h3><p>Hãy thử từ khóa khác hoặc xóa nội dung tìm kiếm.</p>
          <button type="button" className="button button-outline" onClick={() => update('q', '')}>Xóa tìm kiếm</button>
        </div> : <div className="post-grid">{visible.map((post, index) => <PostCard key={post.id} post={post}
          index={(current - 1) * PAGE_SIZE + index + 1}
          author={'userId' in post ? users.data?.find((author) => author.id === post.userId) : undefined} />)}</div>}
        <Pagination current={current} total={totalPages} onChange={changePage} />
      </>}
    </section>
  </>;
}
