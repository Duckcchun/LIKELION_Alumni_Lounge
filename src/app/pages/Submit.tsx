import { Send, Rocket, Award, Code, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { submitStory } from '../utils/api';
import { toast } from 'sonner';

export function Submit() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cohort: '',
    category: '',
    title: '',
    content: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    {
      icon: <Rocket className="text-[#FF6B00]" size={32} />,
      title: '창업 & 스타트업',
      description: '창업 스토리, 팀 빌딩, 투자 유치 등',
      value: 'startup',
    },
    {
      icon: <Award className="text-[#FF6B00]" size={32} />,
      title: '커리어 & 취업',
      description: '이직 성공담, 면접 팁, 포트폴리오 공유',
      value: 'career',
    },
    {
      icon: <Code className="text-[#FF6B00]" size={32} />,
      title: '프로젝트 & 개발',
      description: '토이 프로젝트, 오픈소스 기여, 기술 스택',
      value: 'project',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.cohort || !formData.category || !formData.title || !formData.content) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      await submitStory(formData);

      toast.success('띠링! 제보가 완료되었습니다.', {
        description: `${formData.cohort} ${formData.name}님의 제보가 정상 접수되었습니다.`,
        duration: 4000,
      });

      setFormData({
        name: '',
        email: '',
        cohort: '',
        category: '',
        title: '',
        content: '',
      });
    } catch (err) {
      console.error('Failed to submit story:', err);
      setError('제보 제출에 실패했습니다. 다시 시도해주세요.');
      toast.error('제보 제출에 실패했습니다.', {
        description: '잠시 후 다시 시도해주세요.',
        duration: 3000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] text-white py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block px-4 py-2 bg-[#FF6B00] rounded-full text-sm mb-4">
            나의 이야기 공유하기
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl mb-4">
            알럼나이 <span className="text-[#FF6B00]">제보하기</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            여러분의 멋진 이야기를 들려주세요!<br />
            다음 뉴스레터의 주인공은 바로 당신입니다.
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl text-[#1A1A1A] text-center mb-4">어떤 이야기를 나눠주실 건가요?</h2>
          <p className="text-gray-600 text-center mb-8 sm:mb-12 text-sm sm:text-base">
            주제는 자유! 아래 카테고리를 참고해주세요 ✨
          </p>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {categories.map((category, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow text-center"
              >
                <div className="flex justify-center mb-4">{category.icon}</div>
                <h3 className="text-lg sm:text-xl text-[#1A1A1A] mb-2">{category.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {category.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-8 sm:py-12 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl text-[#1A1A1A] mb-4">제보 양식</h2>
            <p className="text-gray-600 text-sm sm:text-base">
              아래 양식을 작성하시면 담당자가 검토 후 뉴스레터에 포함될 예정입니다.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 sm:mb-8 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="text-red-800 font-medium mb-1 text-sm sm:text-base">오류가 발생했습니다</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6 bg-[#F5F5F5] rounded-2xl p-6 sm:p-8">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block mb-2 text-[#1A1A1A] text-sm sm:text-base font-medium">
                이름 <span className="text-[#FF6B00]">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent text-sm sm:text-base"
                placeholder="홍길동"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block mb-2 text-[#1A1A1A] text-sm sm:text-base font-medium">
                이메일 <span className="text-[#FF6B00]">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent text-sm sm:text-base"
                placeholder="likelion@example.com"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="cohort" className="block mb-2 text-[#1A1A1A] text-sm sm:text-base font-medium">
                기수 <span className="text-[#FF6B00]">*</span>
              </label>
              <select
                id="cohort"
                name="cohort"
                value={formData.cohort}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent text-sm sm:text-base"
                required
              >
                <option value="">기수를 선택하세요</option>
                {Array.from({ length: 14 }, (_, i) => i + 1).map((cohort) => (
                  <option key={cohort} value={`${cohort}기`}>
                    {cohort}기
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block mb-2 text-[#1A1A1A] text-sm sm:text-base font-medium">
                카테고리 <span className="text-[#FF6B00]">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent text-sm sm:text-base"
                required
              >
                <option value="">카테고리를 선택하세요</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block mb-2 text-[#1A1A1A] text-sm sm:text-base font-medium">
                제목 <span className="text-[#FF6B00]">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent text-sm sm:text-base"
                placeholder="예: 첫 스타트업 창업 1년차, 배운 것들"
                required
              />
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block mb-2 text-[#1A1A1A] text-sm sm:text-base font-medium">
                내용 <span className="text-[#FF6B00]">*</span>
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={8}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent resize-none text-sm sm:text-base"
                placeholder="여러분의 이야기를 자유롭게 작성해주세요. 사진이나 링크가 있다면 함께 포함해주세요!"
                required
              />
              <p className="mt-2 text-xs sm:text-sm text-gray-500">
                작성 글자 수: {formData.content.length}자
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#FF6B00] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:bg-[#E56000] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base sm:text-lg font-medium"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  제출 중...
                </>
              ) : (
                <>
                  <Send size={20} />
                  제보하기
                </>
              )}
            </button>
          </form>

        </div>
      </section>

      {/* Guidelines Section */}
      <section className="py-8 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl text-[#1A1A1A] mb-6 text-center">제보 가이드라인</h2>
          
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-[#F5F5F5] rounded-xl p-6">
              <div className="text-xl sm:text-2xl mb-3">✅ 이런 내용 환영해요!</div>
              <ul className="space-y-2 text-gray-700 text-sm sm:text-base">
                <li>• 창업/사이드 프로젝트 런칭 소식</li>
                <li>• 이직/취업 성공 스토리</li>
                <li>• 오픈소스 기여 경험</li>
                <li>• 기술 블로그 포스팅</li>
                <li>• 해커톤 수상 소식</li>
                <li>• 컨퍼런스 발표 경험</li>
              </ul>
            </div>

            <div className="bg-[#F5F5F5] rounded-xl p-6">
              <div className="text-xl sm:text-2xl mb-3">📌 작성 팁</div>
              <ul className="space-y-2 text-gray-700 text-sm sm:text-base">
                <li>• 구체적인 수치와 결과를 포함해주세요</li>
                <li>• 과정에서 배운 점을 공유해주세요</li>
                <li>• 다른 알럼나이에게 도움이 될 팁을 담아주세요</li>
                <li>• 사진이나 링크가 있다면 함께 첨부해주세요</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 sm:mt-8 bg-[#1A1A1A] text-white rounded-xl p-6 text-center">
            <p className="text-sm leading-relaxed">
              제보해주신 모든 분께 감사드립니다! 🙏<br />
              여러분의 이야기가 다른 알럼나이들에게 큰 영감이 됩니다.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}