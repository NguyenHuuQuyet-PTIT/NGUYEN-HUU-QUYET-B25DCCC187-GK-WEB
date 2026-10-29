import { useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { isRecord } from '../services/guards';
import { Navbar } from './Navbar';

export function Layout() {
  const { pathname, state } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  const notice = isRecord(state) && typeof state.notice === 'string' ? state.notice : '';

  return <>
    <a className="skip-link" href="#main-content">Đến nội dung chính</a>
    <Navbar />
    <main id="main-content" className="container main-content">
      {notice && <p className="success-notice" role="status">{notice}</p>}
      <Outlet />
    </main>
    <footer className="site-footer">
      <div className="container footer-inner">
        <Link to="/" className="footer-brand">MiniBlog.</Link>
        <p>Một nơi để đọc, viết và chia sẻ.</p>
        <a href="https://jsonplaceholder.typicode.com/" target="_blank" rel="noreferrer">Dữ liệu từ JSONPlaceholder</a>
      </div>
    </footer>
  </>;
}
