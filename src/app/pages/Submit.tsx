import { Send, Rocket, Award, Code, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { submitStory } from '../utils/api';
import { toast } from 'sonner';

const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;

export function Submit() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cohort: '14기',
    category: '',
    title: '',
    content: '',
    imageDataUrl: '',
    imageName: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

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
        cohort: '14기',
        category: '',
        title: '',
        content: '',
        imageDataUrl: '',
        imageName: '',
      });
      setImagePreview('');
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 첨부할 수 있습니다.');
      e.target.value = '';
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setError('이미지 용량은 2MB 이하만 첨부할 수 있습니다.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      setFormData((prev) => ({
        ...prev,
        imageDataUrl: result,
        imageName: file.name,
      }));
      setImagePreview(result);
      setError(null);
    };
    reader.onerror = () => {
      setError('이미지를 읽는 중 오류가 발생했습니다. 다시 시도해주세요.');
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setFormData((prev) => ({
      ...prev,
      imageDataUrl: '',
      imageName: '',
    }));
    setImagePreview('');
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] text-white py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block px-4 py-2 bg-[#FF6B00] rounded-full text-sm mb-4">
            활동 공유
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl mb-4">
            활동 <span className="text-[#FF6B00]">제보하기</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            이번 달 활동들을 모아<br />
            알럼나이 선배님들께 공유합니다.
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl text-[#1A1A1A] text-center mb-4">어떤 14기 활동을 공유할까요?</h2>
          <p className="text-gray-600 text-center mb-8 sm:mb-12 text-sm sm:text-base">
            아래 카테고리를 참고해서 활동 소식을 남겨주세요.
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
              작성해주신 내용은 검토 후 알럼나이 뉴스레터에 반영됩니다.
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

            {/* Cohort */}
            <div>
              <label htmlFor="cohort" className="block mb-2 text-[#1A1A1A] text-sm sm:text-base font-medium">
                대상 기수
              </label>
              <input
                type="text"
                id="cohort"
                name="cohort"
                value={formData.cohort}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent text-sm sm:text-base"
                readOnly
              />
              <p className="mt-2 text-xs sm:text-sm text-gray-500">현재는 활동 제보를 받고 있어요.</p>
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
                placeholder="활동 내용, 진행 과정, 결과, 사진/링크를 함께 적어주세요."
                required
              />
              <p className="mt-2 text-xs sm:text-sm text-gray-500">
                작성 글자 수: {formData.content.length}자
              </p>
            </div>

            {/* Image Attachment */}
            <div>
              <label htmlFor="image" className="block mb-2 text-[#1A1A1A] text-sm sm:text-base font-medium">
                사진 첨부 (선택)
              </label>
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent text-sm sm:text-base"
              />
              <p className="mt-2 text-xs sm:text-sm text-gray-500">
                JPG, PNG 등 이미지 1장 (최대 2MB)
              </p>

              {imagePreview && (
                <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-sm text-gray-700 truncate">첨부 파일: {formData.imageName}</p>
                    <button
                      type="button"
                      onClick={clearImage}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      첨부 제거
                    </button>
                  </div>
                  <img
                    src={imagePreview}
                    alt="첨부 이미지 미리보기"
                    className="max-h-72 w-full rounded-lg object-contain bg-gray-50"
                  />
                </div>
              )}
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
                  활동 제보하기
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
                <li>• 세션/스터디 운영 후기</li>
                <li>• 팀 프로젝트 데모데이 결과</li>
                <li>• 해커톤/공모전 참가 및 수상 소식</li>
                <li>• 파트별(기획·디자인·개발) 협업 사례</li>
                <li>• 커뮤니티 행사 스케치</li>
                <li>• 다음 기수에 전하고 싶은 배운 점</li>
              </ul>
            </div>

            <div className="bg-[#F5F5F5] rounded-xl p-6">
              <div className="text-xl sm:text-2xl mb-3">📌 작성 팁</div>
              <ul className="space-y-2 text-gray-700 text-sm sm:text-base">
                <li>• 언제, 어떤 활동이었는지 먼저 적어주세요</li>
                <li>• 참여 인원/성과를 숫자로 남겨주세요</li>
                <li>• 시행착오와 해결 과정을 함께 알려주세요</li>
                <li>• 사진/링크를 넣으면 뉴스레터 편집에 도움이 됩니다</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>

  );
  }