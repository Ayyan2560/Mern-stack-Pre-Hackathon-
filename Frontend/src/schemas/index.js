import { z } from 'zod';

export const emailField = z
  .string()
  .trim()
  .min(1, 'Email address is required.')
  .email('Enter a valid email address.');

const newPasswordField = z
  .string()
  .min(8, 'Use at least 8 characters.')
  .max(128, 'Password must be 128 characters or fewer.');

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Password is required.'),
});

export const signupSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Tell us your name (at least 2 characters).')
      .max(60, 'Name must be 60 characters or fewer.'),
    email: emailField,
    password: newPasswordField,
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  });

export const otpField = z
  .string()
  .trim()
  .regex(/^\d{6}$/, 'Enter the 6-digit code.');

export const verifyEmailSchema = z.object({
  email: emailField,
  otp: otpField,
});

export const forgotPasswordSchema = z.object({
  email: emailField,
});

export const resetPasswordSchema = z
  .object({
    email: emailField,
    otp: otpField,
    password: newPasswordField,
    confirmPassword: z.string().min(1, 'Please confirm your new password.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  });

export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters.')
    .max(60, 'Name must be 60 characters or fewer.'),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password.'),
    newPassword: newPasswordField,
    confirmPassword: z.string().min(1, 'Please confirm your new password.'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  })
  .refine((values) => values.newPassword !== values.currentPassword, {
    path: ['newPassword'],
    message: 'Choose a password different from your current one.',
  });

export const postSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'A title is required.')
    .max(200, 'Title must be 200 characters or fewer.'),
  content: z
    .string()
    .trim()
    .min(1, 'Write something before publishing.')
    .max(100000, 'This post is too long.'),
});

export const commentSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, 'Write a comment first.')
    .max(1000, 'Comments are limited to 1000 characters.'),
});
