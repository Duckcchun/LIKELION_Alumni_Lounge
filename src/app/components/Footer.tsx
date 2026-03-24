import { Mail, Instagram, MessageCircle } from 'lucide-react';
import { Link } from 'react-router';
import likelionLogo from '../../assets/0e22b8d85e32254db31b5fd548862b4df3d4b0a1.png';

export function Footer() {
  return (
    <footer className="bg-[#1A1A1A] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {/* About */}
          <div>
            <h3 className="text-[#FF6B00] mb-3 font-medium text-sm sm:text-base">🦁 알럼나이 라운지</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              멋쟁이사자처럼 대학을 수료한 선배님들을 위한<br />
              네트워킹 및 소식 공유 플랫폼입니다.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-[#FF6B00] mb-3 sm:mb-4 font-medium text-sm sm:text-base">빠른 링크</h3>
            <ul className="space-y-2 sm:space-y-3 text-sm">
              <li>
                <a
                  href="https://www.instagram.com/likelion.univ/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-[#FF6B00] transition-colors flex items-center gap-2"
                >
                  <Instagram size={18} />
                  멋사대학 공식 인스타그램
                </a>
              </li>
              <li>
                <a
                  href="https://likelion.university/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-[#FF6B00] transition-colors flex items-center gap-2"
                >
                  <Mail size={18} />
                  멋사대학 공식 홈페이지
                </a>
              </li>
            </ul>
          </div>

          {/* Feedback */}
          <div className="sm:col-span-2 md:col-span-1">
            <h3 className="text-[#FF6B00] mb-3 sm:mb-4 font-medium text-sm sm:text-base">피드백 & 문의</h3>
            <p className="text-gray-400 text-sm mb-4">
              버그 제보, 기능 제안, 기타 문의사항이 있으신가요?
            </p>
            <Link
              to="/feedback"
              className="inline-flex items-center gap-2 bg-linear-to-r from-[#FF6B00] to-[#E56000] text-white px-4 sm:px-5 py-2 sm:py-3 rounded-lg hover:shadow-lg hover:scale-105 transition-all text-sm"
            >
              <MessageCircle size={18} />
              피드백 보내기
            </Link>
            <p className="text-gray-500 text-xs mt-3">
              💡 여러분의 의견을 기다립니다!
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-gray-800">
          <div className="relative pb-20 sm:pb-0">
            <div className="text-center text-sm text-gray-500">
              <p className="text-xs sm:text-sm">© 2026 멋쟁이사자처럼 대학. All rights reserved.</p>
              <p className="mt-2 text-xs sm:text-sm">Made with 🧡 by 14기 아기사자들</p>
              <p className="mt-1 text-xs">실전 온보딩 프로젝트 · Alumni Lounge Platform</p>
            </div>
            {/* Logo positioned at bottom right */}
            <div className="absolute bottom-0 right-0">
              <img 
                src={likelionLogo} 
                alt="멋쟁이사자처럼 대학" 
                className="h-12 sm:h-16 md:h-20 w-auto opacity-60 hover:opacity-100 transition-opacity"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}