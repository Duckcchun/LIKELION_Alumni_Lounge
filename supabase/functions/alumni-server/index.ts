// @ts-nocheck
// deno-lint-ignore-file
import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

const ADMIN_SESSION_PREFIX = "admin:session:";
const ADMIN_SESSION_TTL_MS = 1000 * 60 * 60 * 8; // 8 hours

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "X-Admin-Token"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/alumni-server/health", (c) => {
  return c.json({ status: "ok" });
});

const DEFAULT_VOTE = {
  id: "2026-03",
  month: "3월",
  question: "둘 중 하나만 팀원으로 골라야 한다면?",
  optionA: {
    title: "개발 지식 0인데 말은 기가 막히게 통하는\n기획자",
    emoji: "📝",
    description: "기술 이해는 부족하지만 맥락 공유와 조율이 뛰어난 타입",
  },
  optionB: {
    title: "코딩은 신인데 소통이 1도 안 되는\n개발자",
    emoji: "⚡",
    description: "구현 속도와 완성도는 압도적이지만 협업 난이도가 높은 타입",
  },
};

const DEFAULT_NEWSLETTERS = [
  {
    id: 1,
    month: "2026년 3월",
    title: "14기의 힘찬 첫걸음과 반가운 3월 소식 전하러 왔습니다! 🦁",
    summary: "3월 소식을 전합니다. 라이온킹 캠프부터 리크루팅 일화  까지, 생생한 이야기가 가득합니다.",
    image: "https://likelion-alumni-lounge.vercel.app/newsletters/march-2026-lion.jpg",
    date: "2026.03.27",
    highlights: ["크록스 벗고 어흥! 우당탕탕 리크루팅 썰 ZIP.", "전국 80개 대학 대표진의 뜨거웠던 밤, '라이온킹 캠프' 비하인드", "극한의 IT 밸런스 게임: 선배님들의 선택은?"],
  },
  {
    id: 2,
    month: "2026년 4월",
    title: "발행 예정",
    summary: "",
    image: "",
    date: "",
    highlights: [],
  },
  {
    id: 3,
    month: "2026년 5월",
    title: "발행 예정",
    summary: "",
    image: "",
    date: "",
    highlights: [],
  },
];

async function syncNewslettersFromDefaults(forceReplace = false) {
  const newsletters = await kv.getByPrefix("newsletter:");
  const defaultIds = new Set(DEFAULT_NEWSLETTERS.map((item) => item.id));

  if (forceReplace) {
    for (const newsletter of newsletters) {
      await kv.del(`newsletter:${newsletter.id}`);
    }
    for (const newsletter of DEFAULT_NEWSLETTERS) {
      await kv.set(`newsletter:${newsletter.id}`, newsletter);
    }
    return;
  }

  for (const newsletter of newsletters) {
    const month = typeof newsletter?.month === "string" ? newsletter.month : "";
    const isLegacyMonth = month.includes("1월") || month.includes("2월");
    const isUnknownId = !defaultIds.has(newsletter.id);
    if (isLegacyMonth || isUnknownId) {
      await kv.del(`newsletter:${newsletter.id}`);
    }
  }

  for (const newsletter of DEFAULT_NEWSLETTERS) {
    const current = await kv.get(`newsletter:${newsletter.id}`);
    if (!current || JSON.stringify(current) !== JSON.stringify(newsletter)) {
      await kv.set(`newsletter:${newsletter.id}`, newsletter);
    }
  }
}

function isSameVoteConfig(currentVote: any, defaultVote: typeof DEFAULT_VOTE): boolean {
  if (!currentVote || !defaultVote) return false;

  return (
    currentVote.id === defaultVote.id &&
    currentVote.month === defaultVote.month &&
    currentVote.question === defaultVote.question &&
    currentVote.optionA?.title === defaultVote.optionA.title &&
    currentVote.optionA?.emoji === defaultVote.optionA.emoji &&
    currentVote.optionA?.description === defaultVote.optionA.description &&
    currentVote.optionB?.title === defaultVote.optionB.title &&
    currentVote.optionB?.emoji === defaultVote.optionB.emoji &&
    currentVote.optionB?.description === defaultVote.optionB.description
  );
}

async function syncVoteFromDefaults() {
  const currentVote = await kv.get("vote:current");
  const voteChanged = !isSameVoteConfig(currentVote, DEFAULT_VOTE);
  if (voteChanged) {
    await kv.set("vote:current", DEFAULT_VOTE);
    await kv.set(`vote:results:${DEFAULT_VOTE.id}`, { optionA: 0, optionB: 0, totalVotes: 0 });
    return;
  }

  const resultsKey = `vote:results:${DEFAULT_VOTE.id}`;
  const currentResults = await kv.get(resultsKey);
  if (!currentResults) {
    await kv.set(resultsKey, { optionA: 0, optionB: 0, totalVotes: 0 });
  }
}

// Initialize default data
async function initializeData() {
  try {
    await syncVoteFromDefaults();

    // Keep KV in sync with code defaults on startup.
    await syncNewslettersFromDefaults();
  } catch (error) {
    console.error("Error initializing data:", error);
  }
}

// Initialize data on startup
initializeData();

const ADMIN_FIXED_TOKEN = "admin-token-fixed-2026";

async function requireAdminAuth(c: any): Promise<{ ok: true; token: string } | { ok: false; response: any }> {
  const headerToken = (c.req.header("X-Admin-Token") || "").trim();
  if (headerToken) {
    if (headerToken === ADMIN_FIXED_TOKEN) {
      return { ok: true, token: headerToken };
    }
    return { ok: false, response: c.json({ error: "Unauthorized" }, 401) };
  }

  // Fallback for older clients that still send admin token via Authorization.
  const authHeader = c.req.header("Authorization") || "";
  if (!authHeader.startsWith("Bearer ")) {
    return { ok: false, response: c.json({ error: "Unauthorized" }, 401) };
  }

  const token = authHeader.slice(7).trim();
  if (token !== ADMIN_FIXED_TOKEN) {
    return { ok: false, response: c.json({ error: "Unauthorized" }, 401) };
  }

  return { ok: true, token };
}

app.post("/alumni-server/admin/login", async (c) => {
  try {
    const body = await c.req.json();
    const password = body?.password;
    
    // Hardcoded password for now
    if (!password || password !== "admin123") {
      return c.json({ error: "Invalid password" }, 401);
    }

    // Use a fixed token instead of KV store
    const token = "admin-token-fixed-2026";
    return c.json({ success: true, token, expiresAt: Date.now() + 86400000 });
  } catch (error) {
    console.error("Error during admin login:", error);
    return c.json({ error: "Failed to login" }, 500);
  }
});

// Admin endpoint to reset newsletter data (remove old newsletters)
app.post("/alumni-server/admin/reset-newsletters", async (c) => {
  try {
    const auth = await requireAdminAuth(c);
    if (!auth.ok) return auth.response;

    await syncNewslettersFromDefaults(true);

    return c.json({ success: true, message: "Newsletters reset to March-May 2026" });
  } catch (error) {
    console.error("Error resetting newsletters:", error);
    return c.json({ error: "Failed to reset newsletters" }, 500);
  }
});

// Get current balance game
app.get("/alumni-server/vote/current", async (c) => {
  try {
    await syncVoteFromDefaults();

    const voteData = await kv.get("vote:current");
    if (!voteData) {
      return c.json({ error: "No active vote found" }, 404);
    }

    const results = await kv.get(`vote:results:${voteData.id}`);
    
    return c.json({
      vote: voteData,
      results: results || { optionA: 0, optionB: 0, totalVotes: 0 },
    });
  } catch (error) {
    console.error("Error fetching vote:", error);
    return c.json({ error: "Failed to fetch vote data" }, 500);
  }
});

// Submit a vote
app.post("/alumni-server/vote", async (c) => {
  try {
    const body = await c.req.json();
    const { option } = body;

    if (!option || (option !== "A" && option !== "B")) {
      return c.json({ error: "Invalid option. Must be 'A' or 'B'" }, 400);
    }

    const voteData = await kv.get("vote:current");
    if (!voteData) {
      return c.json({ error: "No active vote found" }, 404);
    }

    // Get current results
    const results = await kv.get(`vote:results:${voteData.id}`) || { optionA: 0, optionB: 0, totalVotes: 0 };

    // Update results
    const updatedResults = {
      optionA: option === "A" ? results.optionA + 1 : results.optionA,
      optionB: option === "B" ? results.optionB + 1 : results.optionB,
      totalVotes: results.totalVotes + 1,
    };

    await kv.set(`vote:results:${voteData.id}`, updatedResults);

    return c.json({ success: true, results: updatedResults });
  } catch (error) {
    console.error("Error submitting vote:", error);
    return c.json({ error: "Failed to submit vote" }, 500);
  }
});

// Get all newsletters
app.get("/alumni-server/newsletters", async (c) => {
  try {
    const newsletters = await kv.getByPrefix("newsletter:");
    
    // Sort by id ascending (March -> April -> May)
    const sortedNewsletters = newsletters.sort((a, b) => a.id - b.id);
    
    return c.json({ newsletters: sortedNewsletters });
  } catch (error) {
    console.error("Error fetching newsletters:", error);
    return c.json({ error: "Failed to fetch newsletters" }, 500);
  }
});

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function sendSubmissionEmails(submission: {
  name: string;
  email: string;
  cohort: string;
  category: string;
  title: string;
  content: string;
  imageDataUrl?: string;
  imageName?: string;
  createdAt: string;
}) {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const fromEmail = Deno.env.get("SUBMISSION_FROM_EMAIL") || "Alumni Lounge <onboarding@resend.dev>";
  const notifyEmail = Deno.env.get("SUBMISSION_NOTIFY_EMAIL") || Deno.env.get("ADMIN_EMAIL");

  if (!resendApiKey || !fromEmail || !notifyEmail) {
    console.warn("Submission email is skipped. Missing RESEND_API_KEY, SUBMISSION_FROM_EMAIL, or SUBMISSION_NOTIFY_EMAIL.");
    return;
  }

  const safeName = escapeHtml(submission.name);
  const safeEmail = escapeHtml(submission.email);
  const safeCohort = escapeHtml(submission.cohort);
  const safeCategory = escapeHtml(submission.category);
  const safeTitle = escapeHtml(submission.title);
  const safeContent = escapeHtml(submission.content).replaceAll("\n", "<br />");
  const safeCreatedAt = escapeHtml(submission.createdAt);
  const safeImageName = escapeHtml(submission.imageName || "");
  const hasImage = typeof submission.imageDataUrl === "string" && submission.imageDataUrl.startsWith("data:image/");

  const adminHtml = `
    <h2>새로운 알럼나이 제보가 접수되었습니다.</h2>
    <p><strong>이름:</strong> ${safeName}</p>
    <p><strong>이메일:</strong> ${safeEmail}</p>
    <p><strong>기수:</strong> ${safeCohort}</p>
    <p><strong>카테고리:</strong> ${safeCategory}</p>
    <p><strong>제목:</strong> ${safeTitle}</p>
    <p><strong>내용:</strong><br />${safeContent}</p>
    ${hasImage ? `<p><strong>첨부 이미지:</strong> ${safeImageName || "image"}</p>` : ""}
    ${hasImage ? `<img src="${submission.imageDataUrl}" alt="첨부 이미지" style="max-width: 480px; width: 100%; border-radius: 8px;" />` : ""}
    <p><strong>제출 시각:</strong> ${safeCreatedAt}</p>
  `;

  const submitterHtml = `
    <h2>알럼나이 제보가 접수되었습니다.</h2>
    <p>${safeName}님, 제보해주셔서 감사합니다. 아래 내용으로 접수되었습니다.</p>
    <hr />
    <p><strong>이름:</strong> ${safeName}</p>
    <p><strong>이메일:</strong> ${safeEmail}</p>
    <p><strong>기수:</strong> ${safeCohort}</p>
    <p><strong>카테고리:</strong> ${safeCategory}</p>
    <p><strong>제목:</strong> ${safeTitle}</p>
    <p><strong>내용:</strong><br />${safeContent}</p>
    <p><strong>제출 시각:</strong> ${safeCreatedAt}</p>
  `;

  const payloads = [
    {
      from: fromEmail,
      to: [notifyEmail],
      subject: `[Alumni Lounge] 신규 제보 - ${submission.cohort} ${submission.name}`,
      html: adminHtml,
    },
    {
      from: fromEmail,
      to: [submission.email],
      subject: "[Alumni Lounge] 제보 접수 확인",
      html: submitterHtml,
    },
  ];

  for (const payload of payloads) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to send submission email:", errorText);
    }
  }
}

// Submit alumni story
app.post("/alumni-server/submit", async (c) => {
  try {
    const body = await c.req.json();
    const { name, email, cohort, category, title, content, imageDataUrl, imageName } = body;

    if (!name || !email || !cohort || !category || !title || !content) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    if (imageDataUrl) {
      if (typeof imageDataUrl !== "string" || !imageDataUrl.startsWith("data:image/")) {
        return c.json({ error: "Invalid image format" }, 400);
      }
      if (imageDataUrl.length > 3 * 1024 * 1024) {
        return c.json({ error: "Image is too large" }, 400);
      }
    }

    // Generate unique ID with timestamp
    const timestamp = Date.now();
    const submissionId = `submission:${timestamp}`;

    const submission = {
      id: timestamp,
      name,
      email,
      cohort,
      category,
      title,
      content,
      imageDataUrl: imageDataUrl || "",
      imageName: imageName || "",
      createdAt: new Date().toISOString(),
    };

    await kv.set(submissionId, submission);
    await sendSubmissionEmails(submission);

    return c.json({ success: true, submissionId: timestamp });
  } catch (error) {
    console.error("Error submitting story:", error);
    return c.json({ error: "Failed to submit story" }, 500);
  }
});

// Get all submissions (admin only - simple implementation)
app.get("/alumni-server/submissions", async (c) => {
  try {
    const auth = await requireAdminAuth(c);
    if (!auth.ok) return auth.response;

    const submissions = await kv.getByPrefix("submission:");
    
    // Sort by id descending (newest first)
    const sortedSubmissions = submissions.sort((a, b) => b.id - a.id);
    
    return c.json({ submissions: sortedSubmissions });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return c.json({ error: "Failed to fetch submissions" }, 500);
  }
});

// Submit feedback
app.post("/alumni-server/feedback", async (c) => {
  try {
    const body = await c.req.json();
    const { name, email, category, message, timestamp } = body;

    if (!category || !message) {
      return c.json({ error: "Missing required fields (category, message)" }, 400);
    }

    if (message.length < 10) {
      return c.json({ error: "Message must be at least 10 characters long" }, 400);
    }

    // Generate unique ID with timestamp
    const feedbackTimestamp = Date.now();
    const feedbackId = `feedback:${feedbackTimestamp}`;

    const feedback = {
      id: feedbackTimestamp,
      name: name || "익명",
      email: email || "",
      category,
      message,
      createdAt: timestamp || new Date().toISOString(),
    };

    await kv.set(feedbackId, feedback);

    return c.json({ success: true, feedbackId: feedbackTimestamp });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return c.json({ error: "Failed to submit feedback" }, 500);
  }
});

// Get all feedback (admin only - simple implementation)
app.get("/alumni-server/feedback", async (c) => {
  try {
    const auth = await requireAdminAuth(c);
    if (!auth.ok) return auth.response;

    const feedbacks = await kv.getByPrefix("feedback:");
    
    // Sort by id descending (newest first)
    const sortedFeedbacks = feedbacks.sort((a, b) => b.id - a.id);
    
    return c.json({ feedbacks: sortedFeedbacks });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return c.json({ error: "Failed to fetch feedback" }, 500);
  }
});

Deno.serve(app.fetch);