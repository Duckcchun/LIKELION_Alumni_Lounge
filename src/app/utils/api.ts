import { projectId, publicAnonKey } from '/utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-ccd31d74`;

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${publicAnonKey}`,
};

export interface VoteData {
  id: string;
  month: string;
  question: string;
  optionA: {
    title: string;
    emoji: string;
    description: string;
  };
  optionB: {
    title: string;
    emoji: string;
    description: string;
  };
}

export interface VoteResults {
  optionA: number;
  optionB: number;
  totalVotes: number;
}

export interface Newsletter {
  id: number;
  month: string;
  title: string;
  summary: string;
  image: string;
  date: string;
  highlights: string[];
}

export interface Submission {
  name: string;
  email: string;
  cohort: string;
  category: string;
  title: string;
  content: string;
}

export interface AdminLoginResponse {
  success: boolean;
  token: string;
  expiresAt: number;
}

export interface FeedbackItem {
  id: number;
  name: string;
  email: string;
  category: string;
  message: string;
  createdAt: string;
}

// Get current vote and results
export async function getCurrentVote(): Promise<{ vote: VoteData; results: VoteResults }> {
  const response = await fetch(`${API_BASE}/vote/current`, { headers });
  if (!response.ok) {
    throw new Error('Failed to fetch vote data');
  }
  return response.json();
}

// Submit a vote
export async function submitVote(option: 'A' | 'B'): Promise<{ success: boolean; results: VoteResults }> {
  const response = await fetch(`${API_BASE}/vote`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ option }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to submit vote');
  }
  
  return response.json();
}

// Get all newsletters
export async function getNewsletters(): Promise<Newsletter[]> {
  const response = await fetch(`${API_BASE}/newsletters`, { headers });
  if (!response.ok) {
    throw new Error('Failed to fetch newsletters');
  }
  const data = await response.json();
  return data.newsletters;
}

// Submit alumni story
export async function submitStory(submission: Submission): Promise<{ success: boolean; submissionId: number }> {
  const response = await fetch(`${API_BASE}/submit`, {
    method: 'POST',
    headers,
    body: JSON.stringify(submission),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to submit story');
  }
  
  return response.json();
}

// Get all submissions (admin)
export async function getSubmissions(adminToken: string): Promise<Submission[]> {
  const response = await fetch(`${API_BASE}/submissions`, {
    headers: {
      ...headers,
      Authorization: `Bearer ${adminToken}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch submissions');
  }
  const data = await response.json();
  return data.submissions;
}

// Admin login
export async function adminLogin(password: string): Promise<AdminLoginResponse> {
  const response = await fetch(`${API_BASE}/admin/login`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ password }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || '관리자 로그인에 실패했습니다.');
  }

  return data;
}

// Get feedbacks (admin)
export async function getFeedbacks(adminToken: string): Promise<FeedbackItem[]> {
  const response = await fetch(`${API_BASE}/feedback`, {
    headers: {
      ...headers,
      Authorization: `Bearer ${adminToken}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || '피드백을 불러오는데 실패했습니다.');
  }

  return data.feedbacks || [];
}

// Reset newsletters (admin)
export async function resetNewsletters(adminToken: string): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE}/admin/reset-newsletters`, {
    method: 'POST',
    headers: {
      ...headers,
      Authorization: `Bearer ${adminToken}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || '초기화에 실패했습니다.');
  }

  return data;
}
