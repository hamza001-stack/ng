import { NextResponse, type NextRequest } from 'next/server';
import type { ZodType } from 'zod';
export async function handleSubmission(
  request: NextRequest,
  schema: ZodType,
  url: string | undefined,
) {
  if (request.headers.get('origin') !== request.nextUrl.origin)
    return NextResponse.json(
      { error: 'Request origin not allowed.' },
      { status: 403 },
    );
  if (!request.headers.get('content-type')?.includes('application/json'))
    return NextResponse.json({ error: 'JSON required.' }, { status: 415 });
  const raw = await request.text();
  if (raw.length > 12000)
    return NextResponse.json(
      { error: 'Request is too large.' },
      { status: 413 },
    );
  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: 'Please check the form fields.' },
      { status: 400 },
    );
  if (!url)
    return NextResponse.json(
      {
        error:
          'Online submissions are not open yet. Please return once the UK platform launches.',
      },
      { status: 503 },
    );
  try {
    const upstream = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.API_TOKEN || ''}`,
      },
      body: JSON.stringify(parsed.data),
      signal: AbortSignal.timeout(8000),
    });
    if (!upstream.ok) throw new Error('Upstream unavailable');
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: 'The service is unavailable. Please try again later.' },
      { status: 502 },
    );
  }
}
