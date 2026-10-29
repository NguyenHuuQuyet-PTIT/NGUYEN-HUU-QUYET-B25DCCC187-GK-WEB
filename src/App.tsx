import { Route, Routes } from 'react-router-dom';
import { NotFoundContent } from './components/Feedback';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { PostDetailPage } from './pages/PostDetailPage';
import { WritePostPage } from './pages/WritePostPage';

export default function App() {
  return <Routes>
    <Route element={<Layout />}>
      <Route index element={<HomePage />} />
      <Route path="posts/:id" element={<PostDetailPage />} />
      <Route path="login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}><Route path="write" element={<WritePostPage />} /></Route>
      <Route path="*" element={<NotFoundContent />} />
    </Route>
  </Routes>;
}
