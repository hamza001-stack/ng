// Temporary layout fixture for screenshots. `node qa/showcase-fixture.cjs up|down`
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const slug = 'qa-layout-check';

async function up() {
  await prisma.caseStudy.upsert({
    where: { slug },
    update: {},
    create: {
      slug,
      title: 'QA layout check — case study template',
      summary: 'Temporary record used only to verify the case study layout. Removed after screenshots.',
      body: [
        'Temporary text used to preview the layout.',
        '## Challenge',
        'Placeholder paragraph for the challenge section.',
        '## Architecture',
        '- Layout bullet one\n- Layout bullet two',
        '## Results',
        'Placeholder paragraph for the results section.',
        '## Lessons Learned',
        'Placeholder paragraph for lessons learned.',
      ].join('\n\n'),
      coverUrl: '/showcase/crm.webp',
      published: true,
      client: 'QA Fixture',
      industry: 'QA',
      country: 'United Kingdom',
      services: ['CRM', 'Automation'],
      technologies: ['Next.js', 'PostgreSQL'],
      results: ['QA result line'],
      duration: 'QA',
      year: 2026,
    },
  });
  await prisma.deliveryProject.upsert({
    where: { slug },
    update: {},
    create: {
      slug,
      title: 'QA layout check — project template',
      client: 'QA Fixture',
      summary: 'Temporary record used only to verify the project layout. Removed after screenshots.',
      goal: 'Verify the public project detail layout.',
      isPublic: true,
      phase: 'DEVELOPMENT',
      progress: 50,
      category: 'CRM',
      technologies: ['Next.js'],
      features: ['Layout feature one', 'Layout feature two'],
      coverUrl: '/showcase/saas.webp',
    },
  });
}

async function down() {
  await prisma.caseStudy.deleteMany({ where: { slug } });
  await prisma.deliveryProject.deleteMany({ where: { slug } });
  await prisma.lead.deleteMany({ where: { email: 'qa-layout@example.invalid' } });
}

(process.argv[2] === 'down' ? down() : up())
  .then(() => console.log('ok', process.argv[2] || 'up'))
  .finally(() => prisma.$disconnect());
