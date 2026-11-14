'use client';
import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, ArrowUpRight } from 'lucide-react';
import type { AcademyCourse } from '@/server/site-content';
import { usePlatform } from '@/components/providers';
import { Button } from '@/components/ui/button';
export default function CoursePlayer({ course }: { course: AcademyCourse }) {
  const id = course.id;
  const [lesson, setLesson] = useState(0);
  const { state, complete } = usePlatform();
  const completed = state.progress[id] || [];
  if (!course.lessons.length) {
    return (
      <div className="notice">
        Lessons for this course are coming soon.{' '}
        <Link className="text-link" href={'/academy/pre-registration?course=' + id}>
          Pre-register to be notified
        </Link>
        .
      </div>
    );
  }
  return (
    <>
      <div className="notice">
        Free learning preview. Progress lasts for this browsing session.
        Verified certificates are To Be Confirmed.
      </div>
      <p className="subtle" aria-live="polite">
        {completed.length} of {course.lessons.length} lessons completed
      </p>
      <progress
        value={completed.length}
        max={course.lessons.length}
        aria-label="Course progress"
      />
      <div className="lesson-layout" style={{ marginTop: 30 }}>
        <nav className="lesson-nav" aria-label="Course curriculum">
          {course.lessons.map((l, i) => (
            <button
              key={l.title}
              aria-current={lesson === i}
              onClick={() => setLesson(i)}
            >
              {completed.includes(i) ? '✓' : '0' + (i + 1)} · {l.title}
            </button>
          ))}
        </nav>
        <article className="card">
          <span className="eyebrow">
            LESSON {lesson + 1} / {course.lessons.length}
          </span>
          <h2>{course.lessons[lesson].title}</h2>
          <p className="lesson-copy">{course.lessons[lesson].body}</p>
          <div className="hero-actions">
            <Button
              disabled={completed.includes(lesson)}
              onClick={() => complete(id, lesson)}
            >
              <CheckCircle2 size={18} />
              {completed.includes(lesson) ? 'Completed' : 'Mark as complete'}
            </Button>
            {lesson < course.lessons.length - 1 && (
              <Button variant="outline" onClick={() => setLesson(lesson + 1)}>
                Next lesson <ArrowUpRight size={18} />
              </Button>
            )}
          </div>
          {completed.length === course.lessons.length && (
            <p className="success" role="status" style={{ marginTop: 20 }}>
              You have completed this introduction. Explore another course to
              keep learning.
            </p>
          )}
        </article>
      </div>
    </>
  );
}
