import { useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FormField } from '../components/FormField';
import { useBlog } from '../context/BlogContext';
import { nextFrame, validateText } from '../services/validation';

export function WritePostPage() {
  const { addPost, postError } = useBlog();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [errors, setErrors] = useState({ title: '', body: '' });
  const [submitting, setSubmitting] = useState(false);
  const lock = useRef(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current) return;
    const failures = {
      title: validateText(title, 'tiêu đề', 5, 200),
      body: validateText(body, 'nội dung bài viết', 20, 10000),
    };
    setErrors(failures);
    if (failures.title || failures.body) return;
    lock.current = true;
    setSubmitting(true);
    await nextFrame();
    const post = addPost(title, body);
    if (post) navigate(`/posts/${post.id}`, { replace: true, state: { notice: 'Đã đăng bài viết thành công.' } });
    setSubmitting(false);
    lock.current = false;
  }

  return <div className="writing-layout">
    <Link className="back-link" to="/">Về danh sách bài viết</Link>
    <p className="eyebrow">GÓC VIẾT CỦA BẠN</p>
    <h1>Viết bài mới</h1>
    <p className="page-description">Nhập tiêu đề và nội dung. Bài viết mới sẽ xuất hiện trong danh sách.</p>
    <form className="writing-form" noValidate onSubmit={submit}>
      <FormField id="title" label="Tiêu đề" min={5} max={200} value={title} error={errors.title}
        placeholder="Đặt một tiêu đề cho bài viết…" onChange={(event) => setTitle(event.target.value)} />
      <FormField id="body" label="Nội dung bài viết" min={20} max={10000} value={body} error={errors.body}
        multiline placeholder="Viết câu chuyện của bạn ở đây…" onChange={(event) => setBody(event.target.value)} />
      {postError && <p className="field-error" role="alert">{postError}</p>}
      <div className="form-actions"><span className="muted">Bài viết được lưu trên trình duyệt này.</span>
        <button type="submit" className="button" disabled={submitting}>{submitting ? 'Đang đăng…' : 'Đăng bài viết'}</button>
      </div>
    </form>
  </div>;
}
