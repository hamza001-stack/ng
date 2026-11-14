'use client';

import Link from 'next/link';
import { UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';

type SessionUser = { name: string; role: string } | null;

export function HeaderAccount() {
  const [user, setUser] = useState<SessionUser>(null);
  useEffect(() => {
    void fetch('/api/session', { credentials: 'include' })
      .then((response) => response.json())
      .then((payload: { user?: { name: string; role: string } | null }) => {
        setUser(payload.user ?? null);
      })
      .catch(() => setUser(null));
  }, []);
  if (user) {
    return (
      <Link className="account-link auth-signin" href="/dashboard">
        <UserRound size={16} /> {user.name.split(' ')[0]}
      </Link>
    );
  }
  return (
    <>
      <Link className="account-link auth-signin" href="/sign-in">
        <UserRound size={16} /> Sign in
      </Link>
      <Link className="header-signup" href="/sign-up">
        Create account
      </Link>
    </>
  );
}
