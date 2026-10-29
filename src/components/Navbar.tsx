import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Navbar() {
  const { user, logout, error } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => setOpen(false), [location.pathname]);

  function handleLogout() {
    if (logout()) navigate('/', { state: { notice: 'Bạn đã đăng xuất.' } });
  }

  return <header className="site-header">
    <div className="container header-inner">
      <Link to="/" className="brand" aria-label="MiniBlog — Trang chủ">Mini<span>Blog</span><span className="brand-dot">.</span></Link>
      <button className="menu-toggle" type="button" aria-label={open ? 'Đóng menu' : 'Mở menu'}
        aria-expanded={open} aria-controls="main-nav" onClick={() => setOpen(!open)}>
        <span /><span /><span />
      </button>
      <nav id="main-nav" aria-label="Điều hướng chính" className={`main-nav${open ? ' is-open' : ''}`}>
        <NavLink to="/" end>Trang chủ</NavLink>
        {user ? <>
          <NavLink to="/write" className="button button-small">Viết bài</NavLink>
          <span className="nav-user">{user.username}</span>
          <button type="button" className="text-button" onClick={handleLogout}>Đăng xuất</button>
        </> : <NavLink to="/login" className="button button-small">Đăng nhập</NavLink>}
      </nav>
    </div>
    {error && <p className="container field-error" role="alert">{error}</p>}
  </header>;
}
