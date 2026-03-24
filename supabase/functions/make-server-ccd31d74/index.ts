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
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-ccd31d74/health", (c) => {
  return c.json({ status: "ok" });
});

// Initialize default data
async function initializeData() {
  try {
    // Check if vote data exists
    const currentVote = await kv.get("vote:current");
    if (!currentVote) {
      // Create default vote
      const defaultVote = {
        id: "2026-03",
        month: "3월",
        question: "당신의 이상형은?",
        optionA: {
          title: "디자이너",
          emoji: "🎨",
          description: "감성적이고 창의적인 디자이너와 함께",
        },
        optionB: {
          title: "개발자",
          emoji: "💻",
          description: "논리적이고 문제 해결형 개발자와 함께",
        },
      };
      await kv.set("vote:current", defaultVote);
      await kv.set("vote:results:2026-03", { optionA: 0, optionB: 0, totalVotes: 0 });
    }

    // Check if newsletters exist
    const newsletters = await kv.getByPrefix("newsletter:");
    const hasLegacyMonth = newsletters.some((item) => {
      if (!item || typeof item.month !== "string") return false;
      return item.month.includes("1월") || item.month.includes("2월");
    });

    if (newsletters.length === 0 || hasLegacyMonth) {
      if (hasLegacyMonth) {
        for (const newsletter of newsletters) {
          await kv.del(`newsletter:${newsletter.id}`);
        }
      }

      // Create default newsletters (March to May 2026)
      const defaultNewsletters = [
        {
          id: 1,
          month: "2026년 3월",
          title: "봄이 오면 생각나는 우리들의 창업 이야기",
          summary: "알럼나이 선배님들의 3월 소식을 전합니다. 스타트업 창업부터 커리어 전환까지, 생생한 이야기가 가득합니다.",
          image: "https://images.unsplash.com/photo-1565841327798-694bc2074762?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwc3R1ZGVudHMlMjBjb2RpbmclMjBsYXB0b3B8ZW58MXx8fHwxNzc0MzQwMzc3fDA&ixlib=rb-4.1.0&q=80&w=1080",
          date: "2026.03.24",
          highlights: ["창업 성공 사례 5건", "취업 축하 3명", "토이 프로젝트 showcase"],
        },
        {
          id: 2,
          month: "2026년 4월",
          title: "알럼나이의 봄, 성장의 속도를 높인 한 달",
          summary: "4월에는 커리어 전환, 사이드 프로젝트 출시, 커뮤니티 네트워킹까지 다양한 소식이 이어졌습니다.",
          image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1080&q=80",
          date: "2026.04.18",
          highlights: ["이직/합격 소식", "사이드 프로젝트 런칭", "오프라인 밋업 후기"],
        },
        {
          id: 3,
          month: "2026년 5월",
          title: "함께 만든 결과, 5월 알럼나이 하이라이트",
          summary: "5월 뉴스레터에서는 오픈소스 기여, 해커톤 성과, 협업 사례를 중심으로 알럼나이 스토리를 소개합니다.",
          image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1080&q=80",
          date: "2026.05.20",
          highlights: ["오픈소스 기여 사례", "해커톤 수상 소식", "협업 프로젝트 회고"],
        },
      ];
      
      for (const newsletter of defaultNewsletters) {
        await kv.set(`newsletter:${newsletter.id}`, newsletter);
      }
    }
  } catch (error) {
    console.error("Error initializing data:", error);
  }
}

// Initialize data on startup
initializeData();

async function requireAdminAuth(c: any): Promise<{ ok: true; token: string } | { ok: false; response: any }> {
  const authHeader = c.req.header("Authorization") || "";
  if (!authHeader.startsWith("Bearer ")) {
    return { ok: false, response: c.json({ error: "Unauthorized" }, 401) };
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return { ok: false, response: c.json({ error: "Unauthorized" }, 401) };
  }

  const session = await kv.get(`${ADMIN_SESSION_PREFIX}${token}`);
  if (!session || typeof session.expiresAt !== "number") {
    return { ok: false, response: c.json({ error: "Unauthorized" }, 401) };
  }

  if (Date.now() > session.expiresAt) {
    await kv.del(`${ADMIN_SESSION_PREFIX}${token}`);
    return { ok: false, response: c.json({ error: "Session expired" }, 401) };
  }

  return { ok: true, token };
}

app.post("/make-server-ccd31d74/admin/login", async (c) => {
  try {
    const configuredPassword = Deno.env.get("ADMIN_PASSWORD");
    if (!configuredPassword) {
      return c.json({ error: "Admin authentication is not configured" }, 500);
    }

    const body = await c.req.json();
    const password = body?.password;
    if (!password || password !== configuredPassword) {
      return c.json({ error: "Invalid password" }, 401);
    }

    const token = crypto.randomUUID();
    const expiresAt = Date.now() + ADMIN_SESSION_TTL_MS;

    await kv.set(`${ADMIN_SESSION_PREFIX}${token}`, {
      createdAt: new Date().toISOString(),
      expiresAt,
    });

    return c.json({ success: true, token, expiresAt });
  } catch (error) {
    console.error("Error during admin login:", error);
    return c.json({ error: "Failed to login" }, 500);
  }
});

// Admin endpoint to reset newsletter data (remove old newsletters)
app.post("/make-server-ccd31d74/admin/reset-newsletters", async (c) => {
  try {
    const auth = await requireAdminAuth(c);
    if (!auth.ok) return auth.response;

    // Delete all existing newsletters
    const newsletters = await kv.getByPrefix("newsletter:");
    for (const newsletter of newsletters) {
      await kv.del(`newsletter:${newsletter.id}`);
    }

    const newslettersFromMarch = [
      {
        id: 1,
        month: "2026년 3월",
        title: "봄이 오면 생각나는 우리들의 창업 이야기",
        summary: "알럼나이 선배님들의 3월 소식을 전합니다. 스타트업 창업부터 커리어 전환까지, 생생한 이야기가 가득합니다.",
        image: "https://images.unsplash.com/photo-1565841327798-694bc2074762?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwc3R1ZGVudHMlMjBjb2RpbmclMjBsYXB0b3B8ZW58MXx8fHwxNzc0MzQwMzc3fDA&ixlib=rb-4.1.0&q=80&w=1080",
        date: "2026.03.24",
        highlights: ["창업 성공 사례 5건", "취업 축하 3명", "토이 프로젝트 showcase"],
      },
      {
        id: 2,
        month: "2026년 4월",
        title: "알럼나이의 봄, 성장의 속도를 높인 한 달",
        summary: "4월에는 커리어 전환, 사이드 프로젝트 출시, 커뮤니티 네트워킹까지 다양한 소식이 이어졌습니다.",
        image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1080&q=80",
        date: "2026.04.18",
        highlights: ["이직/합격 소식", "사이드 프로젝트 런칭", "오프라인 밋업 후기"],
      },
      {
        id: 3,
        month: "2026년 5월",
        title: "함께 만든 결과, 5월 알럼나이 하이라이트",
        summary: "5월 뉴스레터에서는 오픈소스 기여, 해커톤 성과, 협업 사례를 중심으로 알럼나이 스토리를 소개합니다.",
        image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1080&q=80",
        date: "2026.05.20",
        highlights: ["오픈소스 기여 사례", "해커톤 수상 소식", "협업 프로젝트 회고"],
      },
    ];

    for (const newsletter of newslettersFromMarch) {
      await kv.set(`newsletter:${newsletter.id}`, newsletter);
    }

    return c.json({ success: true, message: "Newsletters reset to March-May 2026" });
  } catch (error) {
    console.error("Error resetting newsletters:", error);
    return c.json({ error: "Failed to reset newsletters" }, 500);
  }
});

// Get current balance game
app.get("/make-server-ccd31d74/vote/current", async (c) => {
  try {
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
app.post("/make-server-ccd31d74/vote", async (c) => {
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
app.get("/make-server-ccd31d74/newsletters", async (c) => {
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

  const adminHtml = `
    <h2>새로운 알럼나이 제보가 접수되었습니다.</h2>
    <p><strong>이름:</strong> ${safeName}</p>
    <p><strong>이메일:</strong> ${safeEmail}</p>
    <p><strong>기수:</strong> ${safeCohort}</p>
    <p><strong>카테고리:</strong> ${safeCategory}</p>
    <p><strong>제목:</strong> ${safeTitle}</p>
    <p><strong>내용:</strong><br />${safeContent}</p>
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
app.post("/make-server-ccd31d74/submit", async (c) => {
  try {
    const body = await c.req.json();
    const { name, email, cohort, category, title, content } = body;

    if (!name || !email || !cohort || !category || !title || !content) {
      return c.json({ error: "Missing required fields" }, 400);
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
app.get("/make-server-ccd31d74/submissions", async (c) => {
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
app.post("/make-server-ccd31d74/feedback", async (c) => {
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
app.get("/make-server-ccd31d74/feedback", async (c) => {
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