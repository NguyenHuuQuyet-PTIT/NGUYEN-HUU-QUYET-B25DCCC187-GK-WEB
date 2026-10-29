import { useRef, useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { FormField } from '../components/FormField';
import { useAuth } from '../context/AuthContext';
import { isRecord } from '../services/guards';
import { nextFrame, validateText } from '../services/validation';

export function LoginPage() {
  const { user, login } = useAuth();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ username: '', password: '', credentials: '' });
  const [submitting, setSubmitting] = useState(false);
  const lock = useRef(false);
  const state: unknown = location.state;
  const from = isRecord(state) && isRecord(state.from) ? state.from : null;
  const path = from && typeof from.pathname === 'string' ? from.pathname : '/';
  const search = from && typeof from.search === 'string' ? from.search : '';
  const hash = from && typeof from.hash === 'string' ? from.hash : '';
  const destination = path.startsWith('/') && !path.startsWith('//') && path !== '/login'
    ? `${path}${search}${hash}` : '/';
  if (user) return <Navigate to={destination} replace state={{ notice: 'Đăng nhập thành công.' }} />;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current) return;
    const failures = {
      username: validateText(username, 'tên đăng nhập', 3, 30),
      password: validateText(password, 'mật khẩu', 6, 64), credentials: '',
    };
    setErrors(failures);
    if (failures.username || failures.password) return;
    lock.current = true;
    setSubmitting(true);
    await nextFrame();
    const failure = login(username, password);
    if (failure) setErrors({ ...failures, credentials: failure });
    setSubmitting(false);
    lock.current = false;
  }

  return <div className="auth-layout">
    <section className="auth-intro"><p className="eyebrow">CHÀO MỪNG TRỞ LẠI</p>
      <h1>Đăng nhập<br /><em>để viết bài và bình luận.</em></h1>
      <p>Đăng nhập để viết bài và tham gia trao đổi cùng mọi người.</p>
      <Link className="back-link" to="/">Tiếp tục đọc bài viết</Link>
    </section>
    <section className="form-panel" aria-labelledby="login-title">
      <h2 id="login-title">Đăng nhập</h2><p className="muted">Nhập tài khoản để tiếp tục.</p>
      <form noValidate onSubmit={submit}>
        <FormField id="username" label="Tên đăng nhập" value={username} min={3} max={30}
          autoComplete="username" error={errors.username} onChange={(event) => setUsername(event.target.value)} />
        <FormField id="password" label="Mật khẩu" type="password" value={password} min={6} max={64}
          autoComplete="current-password" error={errors.password} onChange={(event) => setPassword(event.target.value)} />
        {errors.credentials && <p className="field-error" role="alert">{errors.credentials}</p>}
        <button type="submit" className="button button-full" disabled={submitting}>
          {submitting ? 'Đang đăng nhập…' : 'Đăng nhập'}
        </button>
      </form>
      <p className="demo-account">Tài khoản dùng thử: <strong>admin</strong> / <strong>123456</strong></p>
    </section>
  </div>;
}
