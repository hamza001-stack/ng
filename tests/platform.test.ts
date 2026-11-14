import test from 'node:test';
import assert from 'node:assert/strict';
import { contactSchema, newsletterSchema } from '../src/lib/validation';
import { routes, products, courses, privateRoutes } from '../src/lib/catalogue';
test('contact rejects invalid input and absent consent', () => {
  assert.equal(
    contactSchema.safeParse({
      name: 'A',
      email: 'bad',
      company: '',
      message: 'short',
      consent: false,
    }).success,
    false,
  );
  assert.equal(
    contactSchema.safeParse({
      name: 'Alex',
      email: 'alex@example.com',
      company: 'Example',
      message: 'We would like to discuss an automation project.',
      consent: true,
    }).success,
    true,
  );
});
test('newsletter requires explicit consent', () => {
  assert.equal(
    newsletterSchema.safeParse({ email: 'alex@example.com', consent: false })
      .success,
    false,
  );
});
test('catalogue identifiers are unique and safe for routing', () => {
  for (const ids of [
    routes,
    products.map((p) => p.id),
    courses.map((c) => c.id),
  ]) {
    assert.equal(new Set(ids).size, ids.length);
    assert.ok(ids.every((id) => /^[a-z0-9-]+$/.test(id)));
  }
  for (const route of privateRoutes) assert.ok(routes.includes(route));
  for (const course of courses) assert.ok(course.lessons.length > 0);
});
