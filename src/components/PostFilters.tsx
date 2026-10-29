import type { SortOrder } from '../types/models';

export function PostFilters({ query, sort, onQueryChange, onSortChange }: {
  query: string;
  sort: SortOrder;
  onQueryChange: (query: string) => void;
  onSortChange: (sort: SortOrder) => void;
}) {
  return <div className="post-filters">
    <div className="search-field">
      <label htmlFor="search">Tìm bài viết</label>
      <div className="search-input-wrap">
        <input id="search" type="search" value={query} placeholder="Nhập tiêu đề bạn muốn tìm…"
          onChange={(event) => onQueryChange(event.target.value)} />
      </div>
    </div>
    <div className="sort-field">
      <label htmlFor="sort">Sắp xếp theo</label>
      <select id="sort" value={sort} onChange={(event) => onSortChange(event.target.value as SortOrder)}>
        <option value="newest">Mới nhất</option>
        <option value="oldest">Cũ nhất</option>
        <option value="title">Tiêu đề A–Z</option>
      </select>
    </div>
  </div>;
}
