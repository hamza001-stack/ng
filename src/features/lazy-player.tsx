'use client';
import dynamic from 'next/dynamic';
import type { AcademyCourse } from '@/server/site-content';
const Player = dynamic(() => import('@/features/course-player'), {
  loading: () => <p role="status">Loading your lesson…</p>,
});
export function LazyPlayer({ course }: { course: AcademyCourse }) {
  return <Player course={course} />;
}
