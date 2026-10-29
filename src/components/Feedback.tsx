import { Link } from 'react-router-dom';

export function Loading({ label = 'Đang tải dữ liệu…' }: { label?: string }) {
  return <div className="feedback loading-state" role="status" aria-live="polite">
    <span className="loading-line" aria-hidden="true" />
    <p>{label}</p>
  </div>;
}

export function ErrorState({ message, retry }: { message: string; retry?: () => void }) {
  return <div className="feedback error-state" role="alert">
    <h2>Chưa tải được nội dung</h2>
    <p>{message}</p>
    {retry && <button type="button" className="button" onClick={retry}>Thử lại</button>}
  </div>;
}

export function NotFoundContent({ isPost = false }: { isPost?: boolean }) {
  return <section className="feedback not-found">
    <span className="eyebrow">404 / KHÔNG TÌM THẤY</span>
    <h1>{isPost ? 'Không tìm thấy bài viết' : 'Trang này không tồn tại'}</h1>
    <p>{isPost ? 'Bài viết không tồn tại hoặc đường dẫn không hợp lệ.'
      : 'Đường dẫn có thể đã thay đổi. Hãy quay lại để đọc những bài viết khác.'}</p>
    <Link className="button" to="/">Về trang chủ</Link>
  </section>;
}
