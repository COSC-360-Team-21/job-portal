import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Job from './models/Job.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const formatSalary = (salary) => {
  if (!salary) return undefined;
  const fmt = (n) =>
    n >= 1000 ? `$${n.toLocaleString('en-CA')}` : `$${n}`;
  const period = salary.period === 'yearly' ? '/yr' : '/hr';
  return `${fmt(salary.min)} – ${fmt(salary.max)} ${salary.currency}${period}`;
};

const normalizeWorkType = (type) => {
  const map = { 'Full-Time': 'Full-time', 'Part-Time': 'Part-time' };
  return map[type] || type;
};

export default async function seedJobs() {
  const count = await Job.countDocuments();
  if (count > 0) {
    console.log(`Database already has ${count} jobs — skipping seed.`);
    return;
  }

  const raw = JSON.parse(
    readFileSync(join(__dirname, 'data', 'jobs.json'), 'utf-8')
  );

  const docs = raw.map((j) => ({
    title: j.title,
    company: j.company,
    location: j.location,
    description: j.description,
    requirements: j.requirements ?? [],
    skills: j.skills ?? [],
    responsibilities: j.responsibilities ?? [],
    salaryRange: formatSalary(j.salary),
    workType: normalizeWorkType(j.workType),
    postedAt: j.postedDate ? new Date(j.postedDate) : new Date(),
    applicationDeadline: j.applicationDeadline
      ? new Date(j.applicationDeadline)
      : undefined,
    status: j.status ?? 'active',
  }));

  await Job.insertMany(docs);
  console.log(`Seeded ${docs.length} jobs into database.`);
}
