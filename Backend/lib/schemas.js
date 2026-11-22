const { z } = require("zod");
const { Category } = require("@prisma/client");

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 72;
const MAX_IMAGES = 10;
const MAX_PAGE_SIZE = 50;
const MAX_COMMENT_LENGTH = 2000;
const MAX_MESSAGE_LENGTH = 2000;

const objectId = (label = "id") =>
  z.string({ error: `Invalid ${label}` }).regex(/^[a-f\d]{24}$/i, `Invalid ${label}`);

const trimmed = (label, max) =>
  z
    .string({ error: `${label} must be text` })
    .trim()
    .max(max, `${label} must be at most ${max} characters`);

const requiredText = (label, max) => trimmed(label, max).min(1, `${label} is required`);

const httpUrl = z
  .string()
  .trim()
  .refine((value) => {
    try {
      const { protocol } = new URL(value);
      return protocol === "https:" || protocol === "http:";
    } catch {
      return false;
    }
  }, "Must be an http(s) URL");

const password = z
  .string({ error: "Password is required" })
  .min(
    MIN_PASSWORD_LENGTH,
    `Password must be ${MIN_PASSWORD_LENGTH}-${MAX_PASSWORD_LENGTH} characters`
  )
  .max(
    MAX_PASSWORD_LENGTH,
    `Password must be ${MIN_PASSWORD_LENGTH}-${MAX_PASSWORD_LENGTH} characters`
  );

const email = z
  .string({ error: "Email is required" })
  .trim()
  .min(1, "Email is required")
  .pipe(z.email("Enter a valid email address"));

const category = z.enum(Object.values(Category), { error: "Invalid category" });

const images = z
  .array(httpUrl, { error: `Images must be up to ${MAX_IMAGES} http(s) URLs` })
  .max(MAX_IMAGES, `Images must be up to ${MAX_IMAGES} http(s) URLs`);

const paging = z.object({
  page: z.coerce.number().int().min(1).catch(1),
  limit: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).catch(10),
});

const params = {
  id: z.object({ id: objectId() }),
  userId: z.object({ userId: objectId("user id") }),
  postIdList: z.object({
    id: z.preprocess(
      (value) => (typeof value === "string" ? value.split(",")[0].trim() : value),
      objectId("post id")
    ),
  }),
};

const normalizedEmail = email.transform((value) => value.toLowerCase());

const sixDigitCode = z
  .union([z.string(), z.number()], { error: "Enter the 6-digit code" })
  .transform((value) => String(value).replace(/\s+/g, ""))
  .pipe(z.string().regex(/^\d{6}$/, "Enter the 6-digit code"));

const opaqueToken = (label) =>
  z
    .string({ error: `${label} is missing. Start again` })
    .trim()
    .regex(/^[A-Za-z0-9_-]{20,128}$/, `${label} is invalid. Start again`);

const auth = {
  registerStart: z.object({ email: normalizedEmail }),
  registerVerify: z.object({ email: normalizedEmail, code: sixDigitCode }),
  registerComplete: z.object({
    signupToken: opaqueToken("Sign-up session"),
    username: z
      .string({ error: "Username is required" })
      .trim()
      .regex(
        /^[A-Za-z0-9_.]{3,30}$/,
        "Username must be 3-30 characters: letters, numbers, dots or underscores"
      ),
    fullname: trimmed("Full name", 60).optional(),
    password,
  }),
  forgotPassword: z.object({ email: normalizedEmail }),
  resetPassword: z.object({ email: normalizedEmail, code: sixDigitCode, password }),
  mfaChallenge: z.object({
    mfaToken: opaqueToken("Sign-in session"),
    code: z
      .string({ error: "Enter your code" })
      .trim()
      .min(6, "Enter your code")
      .max(20, "Enter your code"),
  }),
  mfaResend: z.object({ mfaToken: opaqueToken("Sign-in session") }),
  mfaEnable: z.object({ code: sixDigitCode }),
  mfaPassword: z.object({
    password: z.string({ error: "Enter your password" }).min(1, "Enter your password"),
  }),
  login: z.object({
    email: z
      .string({ error: "All fields are mandatory" })
      .trim()
      .min(1, "All fields are mandatory"),
    password: z.string({ error: "All fields are mandatory" }).min(1, "All fields are mandatory"),
  }),
};

const post = {
  create: z.object({
    title: requiredText("Title", 200),
    subtitle: requiredText("Subtitle", 300),
    content: requiredText("Content", 50000),
    category,
    images: images.default([]),
  }),
  update: z.object({
    title: trimmed("Title", 200).optional(),
    subtitle: trimmed("Subtitle", 300).optional(),
    content: trimmed("Content", 50000).optional(),
    category: z
      .string()
      .trim()
      .optional()
      .transform((value) => value || undefined)
      .pipe(category.optional()),
    images: images.optional(),
  }),
  filter: z.object({
    category: z.string().trim().optional().catch(undefined),
    author: z.string().trim().max(100).optional().catch(undefined),
  }),
  search: paging.extend({
    q: z
      .string({ error: "Enter something to search for" })
      .trim()
      .min(1, "Enter something to search for")
      .max(100, "Search is too long"),
  }),
  postIdBody: z.object({ postId: objectId("post id") }),
};

const comment = {
  create: z.object({
    postId: objectId("post id"),
    description: requiredText("Comment", MAX_COMMENT_LENGTH),
  }),
};

const follow = {
  body: z.object({ followingId: objectId("user id") }),
  status: z.object({
    followerId: objectId("user id"),
    followingId: objectId("user id"),
  }),
};

const user = {
  update: z
    .object({
      fullname: trimmed("Full name", 60).optional(),
      gender: trimmed("Gender", 30).optional(),
      avatar: z
        .string()
        .trim()
        .optional()
        .refine(
          (value) => !value || httpUrl.safeParse(value).success,
          "Avatar must be an http(s) URL"
        ),
      password: z.string().optional(),
      currentPassword: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (!data.password) {
        return;
      }
      if (!password.safeParse(data.password).success) {
        ctx.addIssue({
          code: "custom",
          path: ["password"],
          message: `Password must be ${MIN_PASSWORD_LENGTH}-${MAX_PASSWORD_LENGTH} characters`,
        });
      } else if (!data.currentPassword) {
        ctx.addIssue({
          code: "custom",
          path: ["currentPassword"],
          message: "Enter your current password to set a new one",
        });
      }
    }),
  remove: z.object({
    password: z
      .string({ error: "Enter your password to delete your account" })
      .min(1, "Enter your password to delete your account"),
  }),
  search: z.object({
    q: z
      .string({ error: "Enter something to search for" })
      .trim()
      .min(1, "Enter something to search for")
      .max(100, "Search is too long"),
  }),
  interests: z.object({
    interests: z
      .array(category, { error: "Choose topics from the list" })
      .max(20, "Choose up to 20 topics")
      .transform((list) => [...new Set(list)]),
  }),
  suggestions: z.object({
    limit: z.coerce.number().int().min(1).max(20).catch(5),
  }),
};

const chat = {
  message: z.object({
    receiverId: objectId("receiver id"),
    content: requiredText("Message", MAX_MESSAGE_LENGTH),
  }),
  history: z.object({
    before: z.iso.datetime({ offset: true }).optional().catch(undefined),
  }),
  read: z.object({ userId: objectId("user id") }),
  typing: z.object({ userId: objectId("user id"), typing: z.boolean() }),
};

const notification = {
  list: paging.extend({
    unread: z
      .enum(["true", "false"])
      .optional()
      .transform((value) => value === "true")
      .catch(false),
  }),
  markRead: z.object({
    ids: z.array(objectId("notification id")).min(1).max(100).optional(),
  }),
};

const firstIssueMessage = (error) => error.issues[0]?.message || "Invalid request";

module.exports = {
  objectId,
  paging,
  params,
  auth,
  post,
  comment,
  follow,
  user,
  chat,
  notification,
  firstIssueMessage,
};
