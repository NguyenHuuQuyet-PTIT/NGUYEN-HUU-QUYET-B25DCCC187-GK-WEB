import type { Comment, LocalComment, LocalPost, Post, Session, User } from '../types/models';

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

const isPositiveId = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value > 0;

const isText = (value: unknown): value is string => typeof value === 'string';
const isDate = (value: unknown): value is string =>
  isText(value) && Number.isFinite(Date.parse(value));

export const isLocalId = (value: string) =>
  /^local-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

export const isRemoteId = (value: string) =>
  /^[1-9]\d*$/.test(value) && Number.isSafeInteger(Number(value));

export function isPost(value: unknown): value is Post {
  return isRecord(value) && isPositiveId(value.id) && isPositiveId(value.userId)
    && isText(value.title) && isText(value.body);
}

export function isUser(value: unknown): value is User {
  return isRecord(value) && isPositiveId(value.id) && isText(value.name)
    && isText(value.username) && isText(value.email);
}

export function isComment(value: unknown): value is Comment {
  return isRecord(value) && isPositiveId(value.id) && isPositiveId(value.postId)
    && isText(value.name) && isText(value.email) && isText(value.body);
}

export function isLocalPost(value: unknown): value is LocalPost {
  return isRecord(value) && isText(value.id) && isLocalId(value.id)
    && isText(value.title) && value.title.trim().length >= 5 && value.title.length <= 200
    && isText(value.body) && value.body.trim().length >= 20 && value.body.length <= 10000
    && value.author === 'admin' && isDate(value.createdAt);
}

export function isLocalComment(value: unknown): value is LocalComment {
  return isRecord(value) && isText(value.id) && isLocalId(value.id)
    && isText(value.postId) && (isRemoteId(value.postId) || isLocalId(value.postId))
    && isText(value.body) && value.body.trim().length >= 3 && value.body.length <= 2000
    && value.author === 'admin' && isDate(value.createdAt);
}

export const isSession = (value: unknown): value is Session | null =>
  value === null || (isRecord(value) && value.username === 'admin');

export const isPosts = (value: unknown): value is Post[] =>
  Array.isArray(value) && value.every(isPost);
export const isUsers = (value: unknown): value is User[] =>
  Array.isArray(value) && value.every(isUser);
export const isComments = (value: unknown): value is Comment[] =>
  Array.isArray(value) && value.every(isComment);
export const isLocalPosts = (value: unknown): value is LocalPost[] =>
  Array.isArray(value) && value.every(isLocalPost);
export const isLocalComments = (value: unknown): value is LocalComment[] =>
  Array.isArray(value) && value.every(isLocalComment);
