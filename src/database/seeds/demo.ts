import * as argon2 from 'argon2';
import type { Knex } from 'knex';

const DEMO_USER_ID = '10000000-0000-4000-8000-000000000001';
const DEMO_EMAIL = 'demo@interviewlab.com';
const DEMO_PASSWORD = 'Password123!';

const candidateProfiles = [
  {
    firstName: 'Amelia',
    lastName: 'Stone',
    currentRole: 'Frontend Engineer',
    targetRole: 'Senior Frontend Engineer',
  },
  {
    firstName: 'Benjamin',
    lastName: 'Carter',
    currentRole: 'Backend Engineer',
    targetRole: 'Senior Backend Engineer',
  },
  {
    firstName: 'Chloe',
    lastName: 'Martin',
    currentRole: 'Full Stack Developer',
    targetRole: 'Staff Engineer',
  },
  {
    firstName: 'Daniel',
    lastName: 'Wilson',
    currentRole: 'Software Engineer',
    targetRole: 'Backend Engineer',
  },
  {
    firstName: 'Elena',
    lastName: 'Popescu',
    currentRole: 'QA Automation Engineer',
    targetRole: 'Software Engineer',
  },
  {
    firstName: 'Felix',
    lastName: 'Schmidt',
    currentRole: 'Platform Engineer',
    targetRole: 'Senior Platform Engineer',
  },
  {
    firstName: 'Grace',
    lastName: 'Walker',
    currentRole: 'Junior Developer',
    targetRole: 'Frontend Engineer',
  },
  {
    firstName: 'Hugo',
    lastName: 'Laurent',
    currentRole: 'Data Engineer',
    targetRole: 'Backend Engineer',
  },
  {
    firstName: 'Isabella',
    lastName: 'Rossi',
    currentRole: 'Product Engineer',
    targetRole: 'Full Stack Engineer',
  },
  {
    firstName: 'Jacob',
    lastName: 'Anderson',
    currentRole: 'Senior Engineer',
    targetRole: 'Engineering Lead',
  },
] as const;

const interviewTemplates = [
  {
    title: 'Coding fundamentals',
    type: 'CODING',
    technologies: ['TypeScript', 'Algorithms'],
  },
  {
    title: 'Backend API design',
    type: 'BACKEND',
    technologies: ['NestJS', 'PostgreSQL'],
  },
  {
    title: 'Frontend architecture',
    type: 'FRONTEND',
    technologies: ['React', 'TypeScript'],
  },
  {
    title: 'System design practice',
    type: 'SYSTEM_DESIGN',
    technologies: ['Distributed Systems', 'PostgreSQL'],
  },
  {
    title: 'Behavioral interview',
    type: 'BEHAVIORAL',
    technologies: [],
  },
  {
    title: 'Full stack application design',
    type: 'FULL_STACK',
    technologies: ['React', 'NestJS', 'Docker'],
  },
] as const;

function candidateId(index: number): string {
  return `20000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`;
}

function interviewId(index: number): string {
  return `30000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`;
}

function feedbackId(index: number): string {
  return `40000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`;
}

export async function seed(knex: Knex): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('The demo seed must not run in production');
  }

  const passwordHash = await argon2.hash(DEMO_PASSWORD);

  await knex.transaction(async (transaction) => {
    const demoUserIds = transaction('users')
      .select('id')
      .where('id', DEMO_USER_ID)
      .orWhere('email', DEMO_EMAIL);

    const existingInterviewIds = transaction('interviews')
      .select('id')
      .whereIn('created_by', demoUserIds);

    await transaction('feedback')
      .whereIn('interview_id', existingInterviewIds)
      .delete();
    await transaction('interviews').whereIn('created_by', demoUserIds).delete();
    await transaction('candidates').whereIn('created_by', demoUserIds).delete();
    await transaction('users')
      .where('id', DEMO_USER_ID)
      .orWhere('email', DEMO_EMAIL)
      .delete();

    await transaction('users').insert({
      id: DEMO_USER_ID,
      name: 'Demo User',
      email: DEMO_EMAIL,
      password_hash: passwordHash,
    });

    await transaction('candidates').insert(
      candidateProfiles.map((candidate, index) => ({
        id: candidateId(index),
        created_by: DEMO_USER_ID,
        first_name: candidate.firstName,
        last_name: candidate.lastName,
        email:
          `${candidate.firstName}.${candidate.lastName}@example.com`.toLowerCase(),
        current_role: candidate.currentRole,
        target_role: candidate.targetRole,
        resume_url: null,
        notes: `Demo candidate ${index + 1} of ${candidateProfiles.length}.`,
      })),
    );

    const interviews = Array.from({ length: 35 }, (_, index) => {
      const template = interviewTemplates[index % interviewTemplates.length];
      const isCompleted = index < 24;
      const isScheduled = index >= 24 && index < 32;
      const scheduledAt = isCompleted
        ? new Date(Date.UTC(2026, 5, 3 + index, 9 + (index % 5), 0))
        : isScheduled
          ? new Date(Date.UTC(2026, 7, 3 + (index - 24), 9 + (index % 5), 0))
          : new Date(Date.UTC(2026, 6, 5 + (index - 32), 10, 0));
      const durationMinutes = [45, 60, 75, 90][index % 4];

      return {
        id: interviewId(index),
        created_by: DEMO_USER_ID,
        candidate_id: candidateId(index % candidateProfiles.length),
        title: template.title,
        scheduled_at: scheduledAt,
        duration_minutes: durationMinutes,
        type: template.type,
        status: isCompleted
          ? 'COMPLETED'
          : isScheduled
            ? 'SCHEDULED'
            : 'CANCELLED',
        difficulty: ['JUNIOR', 'MID', 'SENIOR', 'EXPERT'][index % 4],
        technologies: [...template.technologies],
        notes: `Demo interview session ${index + 1} of 35.`,
        completed_at: isCompleted
          ? new Date(scheduledAt.getTime() + durationMinutes * 60_000)
          : null,
      };
    });

    await transaction('interviews').insert(interviews);

    await transaction('feedback').insert(
      interviews.slice(0, 24).map((interview, index) => {
        const overallScore = 5 + (index % 5);

        return {
          id: feedbackId(index),
          interview_id: interview.id,
          overall_score: overallScore,
          technical_score: Math.min(10, overallScore + (index % 2)),
          communication_score: Math.min(10, overallScore + ((index + 1) % 2)),
          problem_solving_score: overallScore,
          strengths:
            'Communicated the approach clearly and broke the problem into manageable steps.',
          improvement_areas:
            'Could discuss tradeoffs and edge cases in greater depth.',
          recommendation:
            overallScore >= 9
              ? 'STRONG_HIRE'
              : overallScore >= 8
                ? 'HIRE'
                : overallScore >= 6
                  ? 'MIXED'
                  : 'NO_HIRE',
          additional_notes: `Generated feedback for ${interview.title}.`,
        };
      }),
    );
  });
}
