import { useRef, useState, type FormEvent } from 'react';
import { useBlog } from '../context/BlogContext';
import { nextFrame, validateText } from '../services/validation';
import { FormField } from './FormField';

export function CommentForm({ postId }: { postId: string }) {
  const { addComment, commentError } = useBlog();
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const lock = useRef(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current) return;
    const failure = validateText(body, 'nội dung bình luận', 3, 2000);
    setError(failure);
    setSuccess('');
    if (failure) return;
    lock.current = true;
    setSubmitting(true);
    await nextFrame();
    if (addComment(postId, body)) {
      setBody('');
      setSuccess('Đã gửi bình luận.');
    }
    setSubmitting(false);
    lock.current = false;
  }

  return <form className="comment-form" noValidate onSubmit={submit}>
    <FormField id="comment" label="Bình luận của bạn" value={body} min={3} max={2000}
      multiline error={error} placeholder="Chia sẻ suy nghĩ của bạn về bài viết…"
      onChange={(event) => { setBody(event.target.value); setSuccess(''); }} />
    {commentError && <p className="field-error" role="alert">{commentError}</p>}
    {success && <p className="success-notice" role="status">{success}</p>}
    <button className="button" type="submit" disabled={submitting}>
      {submitting ? 'Đang gửi…' : 'Gửi bình luận'}
    </button>
  </form>;
}
