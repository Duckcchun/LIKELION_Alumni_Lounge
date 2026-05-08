import { useState, useEffect } from 'react';
import { MessageCircle, Send, CheckCircle, Lock, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { adminLogin } from '../utils/api';

const ADMIN_TOKEN_KEY = 'alumni_admin_token';

export function Feedback() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'bug',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [shiftCount, setShiftCount] = useState(0);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);

  // Shift key detection
  useEffect(() => {
    let resetTimer: number;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setShiftCount((prev) => {
          const newCount = prev + 1;
          if (newCount === 5) {
            setShowAdminModal(true);
            return 0;
          }
          return newCount;
        });

        // Reset counter after 2 seconds of no shift presses
        clearTimeout(resetTimer);
        resetTimer = window.setTimeout(() => {
          setShiftCount(0);
        }, 2000);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(resetTimer);
    };
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setAdminLoading(true);
      setAdminError(false);
      const result = await adminLogin(adminPassword);
      sessionStorage.setItem(ADMIN_TOKEN_KEY, result.token);
      navigate('/feedback/admin');
    } catch (error) {
      console.error('Admin login failed:', error);
      setAdminError(true);
      setTimeout(() => setAdminError(false), 2000);
    } finally {
      setAdminLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/alumni-server/feedback`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            ...formData,
            timestamp: new Date().toISOString(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error('피드백 전송에 실패했습니다.');
      }

      setIsSuccess(true);
      setFormData({ name: '', email: '', category: 'bug', message: '' });

      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Feedback submission error:', error);
      alert('피드백 전송 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#FF6B00] to-[#E56000] rounded-2xl mb-4 shadow-lg">
            <MessageCircle className="text-white" size={32} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            피드백 보내기
          </h1>
          <p className="text-gray-600 text-lg">
            의견을 자유롭게 남겨주세요
          </p>
        </div>

        {/* Success Message */}
        {isSuccess && (
          <div className="mb-8 p-6 bg-green-50 border-2 border-green-200 rounded-xl flex items-center gap-3 animate-fadeIn">
            <CheckCircle className="text-green-600" size={24} />
            <div>
              <h3 className="font-semibold text-green-900">전송 완료</h3>
              <p className="text-green-700 text-sm">
                피드백이 정상적으로 전송되었습니다.
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-xl p-8 space-y-6"
        >
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              이름 (선택)
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="익명으로 남기셔도 됩니다"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#FF6B00] focus:outline-none transition-colors"
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              이메일 (선택)
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="답변받으실 이메일 주소"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#FF6B00] focus:outline-none transition-colors"
            />
            <p className="text-xs text-gray-500 mt-1">
              답변이 필요한 경우 이메일을 남겨주세요
            </p>
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              분류 <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#FF6B00] focus:outline-none transition-colors bg-white"
            >
              <option value="bug">버그 제보</option>
              <option value="feature">기능 제안</option>
              <option value="improvement">개선 사항</option>
              <option value="question">문의사항</option>
              <option value="other">기타</option>
            </select>
          </div>

          {/* Message */}
          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              내용 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={8}
              placeholder="의견을 입력하세요"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#FF6B00] focus:outline-none transition-colors resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              10자 이상 작성
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || formData.message.length < 10}
            className="w-full bg-gradient-to-r from-[#FF6B00] to-[#E56000] text-white py-4 rounded-lg font-medium text-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                전송 중...
              </>
            ) : (
              <>
                <Send size={20} />
                피드백 보내기
              </>
            )}
          </button>
        </form>
      </div>

      {/* Admin Login Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
            <button
              onClick={() => {
                setShowAdminModal(false);
                setAdminPassword('');
                setAdminError(false);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>

            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl mb-4">
                <Lock className="text-white" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                관리자
              </h2>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label
                  htmlFor="adminPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  비밀번호
                </label>
                <input
                  type="password"
                  id="adminPassword"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  autoFocus
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                    adminError
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-gray-200 focus:border-[#FF6B00]'
                  }`}
                />
                {adminError && (
                  <p className="text-red-600 text-sm mt-2">
                    비밀번호가 올바르지 않습니다
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={adminLoading || !adminPassword.trim()}
                className="w-full bg-gradient-to-r from-gray-700 to-gray-900 text-white py-3 rounded-lg font-medium hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {adminLoading ? '인증 중...' : '로그인'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}