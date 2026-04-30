import { projectId, publicAnonKey } from '../../../utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/alumni-server`;

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

const DEV_NEWSLETTERS: Newsletter[] = [
  {
    id: 1,
    month: '2026년 3월',
    title: '14기의 힘찬 첫걸음과 반가운 3월 소식 전하러 왔습니다! 🦁',
    summary: '3월 소식을 전합니다. 라이온킹 캠프부터 리크루팅 일화  까지, 생생한 이야기가 가득합니다.',
    image: '/newsletters/march-2026-lion.jpg',
    date: '2026.03.27',
    highlights: [
      '크록스 벗고 어흥! 우당탕탕 리크루팅 썰 ZIP.',
      "전국 80개 대학 대표진의 뜨거웠던 밤, '라이온킹 캠프' 비하인드",
      '극한의 IT 밸런스 게임: 선배님들의 선택은?',
    ],
  },
  {
    id: 2,
    month: '2026년 4월',
    title: '"14기는 여기까지!" 시작하자마자 공중분해 위기 맞은 멋사 14기 근황..😦 ',
    summary: '4월 소식을 전합니다. 본격적인 활동이 시작되는 아기사자들을 지켜봐주세요 !',
    image: '/newsletters/april-2026-lion.jpg',
    date: '2026.04.30',
    highlights: [
      '솔로지옥 출연으로 대표 사퇴?! 우당탕탕 만우절 인스타 대소동',
      "상금 100만 원의 주인공은? 신설 AI 배틀 '애니멀리그' 첫 결과 공개!",
      '극한의 IT 밸런스 게임: 매 학기 전액 장학금 vs 졸업하자마자 연봉 1억',
    ],
  },
  {
    id: 3,
    month: '2026년 5월',
    title: '발행 예정',
    summary: '',
    image: '',
    date: '',
    highlights: [],
  },
];

const DEV_APRIL_VOTE: VoteData = {
  id: '2026-04',
  month: '4월',
  question: '둘 중 하나만 골라야 한다면?',
  optionA: {
    title: '졸업할 때까지 매 학기 전액 장학금',
    emoji: '🎓',
    description: '등록금 걱정 없이 대학 생활!',
  },
  optionB: {
    title: '졸업하자마자 연봉 1억 취업',
    emoji: '💸',
    description: '취업 걱정 끝, 바로 고연봉 커리어 시작!',
  },
};

const DEV_APRIL_INITIAL_RESULTS: VoteResults = {
  optionA: 0,
  optionB: 0,
  totalVotes: 0,
};

function isLocalDevRuntime(): boolean {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1';
}

export interface Submission {
  name: string;
  email: string;
  cohort: string;
  category: string;
  title: string;
  content: string;
  imageDataUrl?: string;
  imageName?: string;
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
  const data = await response.json();

  if (isLocalDevRuntime() && data?.vote?.id !== DEV_APRIL_VOTE.id) {
    return {
      vote: DEV_APRIL_VOTE,
      results: DEV_APRIL_INITIAL_RESULTS,
    };
  }

  return data;
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
  if (isLocalDevRuntime()) {
    return DEV_NEWSLETTERS;
  }

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
      'X-Admin-Token': adminToken,
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

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || '관리자 로그인에 실패했습니다.');
  }

  const data = await response.json();
  return data;
}

// Get feedbacks (admin)
export async function getFeedbacks(adminToken: string): Promise<FeedbackItem[]> {
  const response = await fetch(`${API_BASE}/feedback`, {
    headers: {
      ...headers,
      'X-Admin-Token': adminToken,
    },
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || '피드백을 불러오는데 실패했습니다.');
  }

  const data = await response.json();
  return data.feedbacks || [];
}

// Reset newsletters (admin)
export async function resetNewsletters(adminToken: string): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE}/admin/reset-newsletters`, {
    method: 'POST',
    headers: {
      ...headers,
      'X-Admin-Token': adminToken,
    },
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || '뉴스레터 초기화에 실패했습니다.');
  }

  const data = await response.json();
  return data;
}
