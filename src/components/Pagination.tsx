export function Pagination({ current, total, onChange }: {
  current: number;
  total: number;
  onChange: (page: number) => void;
}) {
  if (total <= 1) return null;
  const pages = Array.from({ length: total }, (_, index) => index + 1)
    .filter((page) => page === 1 || page === total || Math.abs(page - current) <= 1);
  return <nav className="pagination" aria-label="Phân trang bài viết">
    <button type="button" disabled={current === 1} onClick={() => onChange(current - 1)}>Trước</button>
    <div className="page-numbers">{pages.map((page, index) => <span key={page}>
      {index > 0 && page - pages[index - 1] > 1 && <span className="page-gap">…</span>}
      <button type="button" aria-label={`Trang ${page}`} aria-current={page === current ? 'page' : undefined}
        className={page === current ? 'current-page' : ''} onClick={() => onChange(page)}>{page}</button>
    </span>)}</div>
    <button type="button" disabled={current === total} onClick={() => onChange(current + 1)}>Sau</button>
  </nav>;
}
