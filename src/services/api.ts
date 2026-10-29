import type { TypeGuard } from '../types/models';

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function fetchResource<T>(path: string, guard: TypeGuard<T>, signal: AbortSignal) {
  const response = await fetch(`https://jsonplaceholder.typicode.com${path}`, { signal });
  if (!response.ok) {
    throw new ApiError(
      response.status === 404 ? 'Không tìm thấy nội dung này.' : `Không tải được dữ liệu (HTTP ${response.status}).`,
      response.status,
    );
  }
  const data: unknown = await response.json();
  if (!guard(data)) throw new ApiError('Dữ liệu trả về không đúng định dạng.', 502);
  return data;
}
