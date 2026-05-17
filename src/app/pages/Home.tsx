import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft, ChevronRight, Calendar, Archive, Loader2, AlertCircle, RefreshCw, Inbox } from 'lucide-react';
import { getNewsletters, Newsletter } from '../utils/api';
import likelionLogo from '../../assets/0e22b8d85e32254db31b5fd548862b4df3d4b0a1.png';

const APRIL_NEWSLETTER_DETAIL_URL = 'https://stib.ee/s8TN';
const DEFAULT_NEWSLETTER_DETAIL_URL = 'https://stib.ee/8ewL';

function getNewsletterDetailUrl(newsletter: Newsletter): string {
  if (newsletter.id === 2 || newsletter.month.includes('4월')) {
    return APRIL_NEWSLETTER_DETAIL_URL;
  }
  return DEFAULT_NEWSLETTER_DETAIL_URL;
}

function NewsletterImage({ src, alt, className }: { src: string; alt: string; className: string }) {
  const [hasError, setHasError] = useState(false);
  const normalizedSrc = (src || '').trim();

  if (!normalizedSrc || hasError) {
    return (
      <div
        role="img"
        aria-label={`${alt} 이미지 없음`}
        className={`${className} bg-linear-to-br from-gray-100 to-gray-200`}
      />
    );
  }

  return (
    <img
      src={normalizedSrc}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setHasError(true)}
    />
  );
}

export function Home() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showArchive, setShowArchive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const newsletterSectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    loadNewsletters();
  }, []);

  const loadNewsletters = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getNewsletters();
      setNewsletters(data);
    } catch (err) {
      console.error('Failed to load newsletters:', err);
      setError('뉴스레터를 불러오는데 실패했습니다. 네트워크 연결을 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % newsletters.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + newsletters.length) % newsletters.length);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (newsletters.length === 0) return;
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'ArrowRight') nextSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [newsletters.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#F5F5F5] via-orange-50 to-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="relative inline-block mb-6">
            <img src={likelionLogo} alt="멋사" className="h-20 w-auto animate-pulse" />
            <div className="absolute inset-0 bg-[#FF6B00] opacity-20 blur-xl rounded-full animate-pulse"></div>
          </div>
          <Loader2 className="w-12 h-12 text-[#FF6B00] animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">뉴스레터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">연결 오류</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={loadNewsletters}
            className="bg-[#FF6B00] text-white px-6 py-3 rounded-lg hover:bg-[#E56000] transition-colors font-medium inline-flex items-center gap-2"
          >
            <RefreshCw size={20} />
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (newsletters.length === 0) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto">
          <Inbox className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">아직 뉴스레터가 없어요</h2>
          <p className="text-gray-600 mb-6">
            곧 첫 번째 뉴스레터가 발행될 예정입니다!<br />
            조금만 기다려주세요.
          </p>
          <button
            onClick={loadNewsletters}
            className="bg-[#FF6B00] text-white px-6 py-3 rounded-lg hover:bg-[#E56000] transition-colors font-medium inline-flex items-center gap-2"
          >
            <RefreshCw size={20} />
            새로고침
          </button>
        </div>
      </div>
    );
  }

  const currentNewsletter = newsletters[currentIndex];

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <section className="relative bg-linear-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] text-white py-12 sm:py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border-4 border-[#FF6B00] rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 border-4 border-[#FF6B00] rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-[#FF6B00] rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="mb-6 flex justify-center">
            <div className="relative group">
              <img 
                src={likelionLogo} 
                alt="멋쟁이사자처럼 대학" 
                className="h-16 sm:h-20 md:h-24 w-auto opacity-90 group-hover:opacity-100 transition-opacity duration-300"
              />
              <div className="absolute inset-0 bg-[#FF6B00] opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-300 rounded-full"></div>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 font-extrabold tracking-tight">
            <span className="bg-linear-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">멋사대학</span>
            <br />
            <span className="bg-linear-to-r from-[#FF6B00] via-[#FF8534] to-[#FF6B00] bg-clip-text text-transparent">Alumni Lounge</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            지금 진행 중인 <span className="text-[#FF6B00] font-semibold">14기 활동</span>을 모아<br className="hidden sm:block" />
            알럼나이 선배님들께 전하는 월간 뉴스레터입니다.
          </p>
        </div>
      </section>

      <section ref={newsletterSectionRef} className="pt-10 sm:pt-14 pb-8 sm:pb-12 relative z-20 animate-fade-in">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6 sm:mb-8 opacity-0 animate-slide-up" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
            <h2 className="text-2xl sm:text-3xl text-[#1A1A1A] font-bold flex items-center gap-2">
              <span className="text-[#FF6B00]">📰</span> 활동 뉴스레터
            </h2>
            <button
              onClick={() => setShowArchive(!showArchive)}
              className="flex items-center gap-2 text-[#FF6B00] hover:underline text-sm sm:text-base font-medium transition-all hover:gap-3"
            >
              <Archive size={20} />
              <span className="hidden sm:inline">{showArchive ? '접기' : '지난 활동 뉴스레터 보기'}</span>
              <span className="sm:hidden">{showArchive ? '접기' : '아카이브'}</span>
            </button>
          </div>

          <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden hover:shadow-3xl transition-shadow duration-300 border border-gray-100">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="relative h-64 md:h-auto overflow-hidden group">
                <NewsletterImage
                  src={currentNewsletter.image}
                  alt={currentNewsletter.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent"></div>
                <div className="absolute top-4 left-4 bg-linear-to-r from-[#FF6B00] to-[#E56000] text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium shadow-lg">
                  <Calendar size={16} />
                  {currentNewsletter.date}
                </div>
              </div>

              <div className="p-6 sm:p-8 flex flex-col justify-center bg-linear-to-br from-white to-orange-50/30">
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#FF6B00] mb-3 bg-orange-100 px-3 py-1 rounded-full w-fit">
                  {currentNewsletter.month}
                </div>
                <h3 className="text-xl sm:text-2xl md:text-3xl mb-4 font-bold text-gray-900 leading-tight">{currentNewsletter.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed text-sm sm:text-base">
                  {currentNewsletter.summary}
                </p>

                <div className="space-y-2 mb-6">
                  <div className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                    <span className="w-1 h-4 bg-[#FF6B00] rounded-full"></span>
                    14기 활동 하이라이트
                  </div>
                  {currentNewsletter.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-start gap-3 group">
                      <span className="text-[#FF6B00] mt-1 group-hover:scale-125 transition-transform">▸</span>
                      <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">{highlight}</span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    window.open(getNewsletterDetailUrl(currentNewsletter), '_blank', 'noopener,noreferrer')
                  }
                  className="bg-linear-to-r from-[#FF6B00] to-[#E56000] text-white px-6 py-3 rounded-xl hover:shadow-xl hover:scale-[1.02] transition-all w-full md:w-auto text-sm sm:text-base font-semibold flex items-center justify-center gap-2"
                >
                  이번 호 자세히 보기
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
            </div>

            {newsletters.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white p-3 rounded-full shadow-xl transition-all hover:scale-110"
                  aria-label="Previous newsletter"
                >
                  <ChevronLeft className="text-[#1A1A1A]" size={24} />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white p-3 rounded-full shadow-xl transition-all hover:scale-110"
                  aria-label="Next newsletter"
                >
                  <ChevronRight className="text-[#1A1A1A]" size={24} />
                </button>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {newsletters.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-2 rounded-full transition-all ${
                        idx === currentIndex ? 'bg-[#FF6B00] w-8' : 'bg-gray-300 w-2 hover:bg-gray-400'
                      }`}
                      aria-label={`Go to newsletter ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {showArchive && (
        <section className="py-8 sm:py-12 bg-linear-to-br from-white to-orange-50/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl sm:text-2xl text-[#1A1A1A] mb-6 sm:mb-8 font-bold flex items-center gap-2">
              <Archive className="text-[#FF6B00]" size={24} />
              뉴스레터 아카이브
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {newsletters.map((newsletter, idx) => (
                <button
                  key={newsletter.id}
                  type="button"
                  onClick={() => {
                    setCurrentIndex(idx);
                    setShowArchive(false);
                    requestAnimationFrame(() => {
                      newsletterSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    });
                  }}
                  className="w-full appearance-none bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-[#FF6B00] group text-left p-0"
                  aria-label={`${newsletter.month} 뉴스레터 보기`}
                >
                  <div className="relative h-48 overflow-hidden">
                    <NewsletterImage
                      src={newsletter.image}
                      alt={newsletter.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent"></div>
                    <div className="absolute top-3 left-3 bg-linear-to-r from-[#FF6B00] to-[#E56000] text-white text-xs px-3 py-1 rounded-lg font-medium shadow-lg">
                      {newsletter.month}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="mb-2 min-h-[3.25rem] line-clamp-2 text-sm sm:text-base font-bold text-gray-900 group-hover:text-[#FF6B00] transition-colors">
                      {newsletter.title}
                    </h3>
                    <p className={`text-sm line-clamp-2 min-h-[3.5rem] ${newsletter.summary?.trim() ? 'text-gray-600' : 'text-gray-400'}`}>
                      {newsletter.summary?.trim() || '뉴스레터 준비 중입니다.'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="relative bg-linear-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] text-white py-20 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-40 h-40 border-4 border-[#FF6B00] rounded-full animate-pulse"></div>
          <div className="absolute bottom-10 left-10 w-32 h-32 bg-[#FF6B00] rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl mb-6 font-bold">
            알럼나이에게 공유할 <span className="bg-linear-to-r from-[#FF6B00] to-[#FF8534] bg-clip-text text-transparent">활동</span>을 제보해주세요
          </h2>
          <p className="text-gray-300 mb-8 sm:mb-10 leading-relaxed text-base sm:text-lg max-w-2xl mx-auto">
            세션, 스터디, 프로젝트, 행사 후기를 모아<br className="hidden sm:block" />
            다음 뉴스레터에서 선배님들과 함께 나눕니다.
          </p>
          <button
            onClick={() => navigate('/submit')}
            className="bg-linear-to-r from-[#FF6B00] to-[#E56000] text-white px-8 sm:px-10 py-4 sm:py-5 rounded-xl hover:shadow-2xl hover:scale-105 transition-all inline-flex items-center gap-3 text-base sm:text-lg font-bold group"
          >
            <span>활동 제보하기</span>
            <span className="group-hover:translate-x-1 transition-transform text-xl">→</span>
          </button>
        </div>
      </section>
    </div>
  );
}