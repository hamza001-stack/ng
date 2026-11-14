import { z } from 'zod';
export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name.').max(100),
  email: z.email('Enter a valid email.').max(254),
  phone: z.string().trim().max(40).optional(),
  company: z.string().trim().max(120),
  interest: z.string().trim().max(80).optional(),
  message: z
    .string()
    .trim()
    .min(20, 'Tell us a little more (at least 20 characters).')
    .max(4000),
  consent: z.boolean().refine(Boolean, 'Please agree before submitting.'),
});
export const newsletterSchema = z.object({
  email: z.email('Enter a valid email.').max(254),
  consent: z.boolean().refine(Boolean, 'Please agree to receive updates.'),
});
export const preRegistrationSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name.').max(100),
  email: z.email('Enter a valid email.').max(254),
  phone: z.string().trim().max(40).optional(),
  programmeId: z.string().trim().min(1, 'Choose a programme.').max(80),
  sessionId: z.string().trim().max(80).optional(),
  experience: z.string().trim().max(60).optional(),
  message: z.string().trim().max(1000).optional(),
  consent: z.boolean().refine(Boolean, 'Please agree before submitting.'),
  website: z.string().optional(), // honeypot
});

export const enrolmentSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name.').max(100),
  email: z.email('Enter a valid email.').max(254),
  phone: z.string().trim().max(40).optional(),
  programmeId: z.string().trim().min(1, 'Choose a programme.').max(80),
  sessionId: z.string().trim().min(1, 'Choose a start date.').max(80),
  goal: z.string().trim().max(1000).optional(),
  consent: z.boolean().refine(Boolean, 'Please agree before submitting.'),
  website: z.string().optional(), // honeypot
});

export const enrolmentLookupSchema = z.object({
  ref: z.string().trim().toUpperCase().min(5).max(20),
  email: z.email().max(254),
});
