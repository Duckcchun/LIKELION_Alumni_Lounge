import { useState, useEffect } from 'react';
import { MessageCircle, Mail, User, Calendar, RefreshCw, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { getFeedbacks, resetNewsletters as resetNewslettersApi, FeedbackItem } from '../utils/api';

const ADMIN_TOKEN_KEY = 'alumni_admin_token';

const categoryLabels: Record<string, string> = {
  bug: '🐛 버그 제보',
  feature: '✨ 기능 제안',
  improvement: '🔧 개선 사항',
  question: '❓ 문의사항',
  other: '💬 기타',
};

const categoryColors: Record<string, string> = {
  bug: 'bg-red-100 text-red-700 border-red-200',
  feature: 'bg-blue-100 text-blue-700 border-blue-200',
  improvement: 'bg-green-100 text-green-700 border-green-200',
  question: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  other: 'bg-gray-100 text-gray-700 border-gray-200',
};

export function FeedbackAdmin() {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    const adminToken = sessionStorage.getItem(ADMIN_TOKEN_KEY);
    if (!adminToken) {
      navigate('/feedback');
      return;
    }
    fetchFeedbacks(adminToken);
  }, []);

  const fetchFeedbacks = async (adminToken?: string) => {
    const token = adminToken || sessionStorage.getItem(ADMIN_TOKEN_KEY);
    if (!token) {
      navigate('/feedback');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getFeedbacks(token);
      setFeedbacks(data);
    } catch (err) {
      console.error('Error fetching feedbacks:', err);
      sessionStorage.removeItem(ADMIN_TOKEN_KEY);
      setError('인증이 만료되었거나 접근 권한이 없습니다. 다시 로그인해주세요.');
      navigate('/feedback');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetNewsletters = async () => {
    if (!confirm('뉴스레터를 2026년 3월~5월 데이터로 초기화하시겠습니까?')) {
      return;
    }

    const adminToken = sessionStorage.getItem(ADMIN_TOKEN_KEY);
    if (!adminToken) {
      navigate('/feedback');
      return;
    }

    setResetting(true);
    try {
      const data = await resetNewslettersApi(adminToken);
      alert('✅ 뉴스레터가 2026년 3월~5월 기준으로 초기화되었습니다!');
      console.log(data);
    } catch (err) {
      console.error('Error resetting newsletters:', err);
      alert('❌ 초기화 중 오류가 발생했습니다.');
    } finally {
      setResetting(false);
    }
  };

  const filteredFeedbacks =
    selectedCategory === 'all'
      ? feedbacks
      : feedbacks.filter((f) => f.category === selectedCategory);

  const categoryCounts = feedbacks.reduce((acc, f) => {
    acc[f.category] = (acc[f.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#FF6B00] to-[#E56000] rounded-2xl mb-4 shadow-lg">
            <MessageCircle className="text-white" size={32} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            피드백 관리
          </h1>
          <p className="text-gray-600 text-lg mb-4">
            총 <span className="font-bold text-[#FF6B00]">{feedbacks.length}</span>개의 피드백이 접수되었습니다
          </p>
          
          {/* Admin Actions */}
          <div className="flex gap-3 justify-center mt-6">
            <button
              onClick={handleResetNewsletters}
              disabled={resetting}
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md"
            >
              <Trash2 size={18} />
              {resetting ? '초기화 중...' : '뉴스레터 초기화 (3~5월)'}
            </button>
            <button
              onClick={() => fetchFeedbacks()}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md"
            >
              <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
              새로고침
            </button>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8 flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedCategory === 'all'
                ? 'bg-[#FF6B00] text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            전체 ({feedbacks.length})
          </button>
          {Object.entries(categoryLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === key
                  ? 'bg-[#FF6B00] text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {label} ({categoryCounts[key] || 0})
            </button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">피드백을 불러오는 중...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => fetchFeedbacks()}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* Feedback List */}
        {!isLoading && !error && (
          <div className="space-y-6">
            {filteredFeedbacks.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <MessageCircle className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-gray-600 text-lg">
                  {selectedCategory === 'all'
                    ? '아직 접수된 피드백이 없습니다.'
                    : '해당 카테고리의 피드백이 없습니다.'}
                </p>
              </div>
            ) : (
              filteredFeedbacks.map((feedback) => (
                <div
                  key={feedback.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-lg text-sm font-medium border ${
                          categoryColors[feedback.category]
                        }`}
                      >
                        {categoryLabels[feedback.category]}
                      </span>
                      <span className="text-gray-500 text-sm flex items-center gap-1">
                        <Calendar size={14} />
                        {formatDate(feedback.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                      {feedback.message}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <User size={16} />
                      <span>{feedback.name || '익명'}</span>
                    </div>
                    {feedback.email && (
                      <div className="flex items-center gap-2">
                        <Mail size={16} />
                        <a
                          href={`mailto:${feedback.email}`}
                          className="text-[#FF6B00] hover:underline"
                        >
                          {feedback.email}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Info */}
        <div className="mt-12 bg-orange-50 border border-orange-200 rounded-xl p-6 text-center">
          <p className="text-gray-700">
            💡 <strong>관리자 전용 페이지입니다.</strong> 사용자들이 남긴 피드백을 확인하고 개선에 반영하세요.
          </p>
        </div>
      </div>
    </div>
  );
}