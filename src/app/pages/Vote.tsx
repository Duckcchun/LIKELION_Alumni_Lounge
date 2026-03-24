import { useState, useEffect } from 'react';
import { TrendingUp, Users, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { getCurrentVote, submitVote, VoteData, VoteResults } from '../utils/api';

const VOTE_STORAGE_KEY = 'likelion_alumni_vote_';

export function Vote() {
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  
  const [balanceGame, setBalanceGame] = useState<VoteData | null>(null);
  const [results, setResults] = useState<VoteResults>({
    optionA: 0,
    optionB: 0,
    totalVotes: 0,
  });

  // Load vote data on mount
  useEffect(() => {
    loadVoteData();
  }, []);

  // Check if user has already voted
  useEffect(() => {
    if (balanceGame) {
      const voteKey = VOTE_STORAGE_KEY + balanceGame.month;
      const savedVote = localStorage.getItem(voteKey);
      if (savedVote) {
        setHasVoted(true);
        setSelectedOption(savedVote as 'A' | 'B');
        setShowResults(true);
      }
    }
  }, [balanceGame]);

  const loadVoteData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCurrentVote();
      setBalanceGame(data.vote);
      setResults(data.results);
    } catch (err) {
      console.error('Failed to load vote data:', err);
      setError('투표 데이터를 불러오는데 실패했습니다. 네트워크 연결을 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (option: 'A' | 'B') => {
    if (selectedOption || submitting || hasVoted) return;
    
    try {
      setSubmitting(true);
      setSelectedOption(option);
      
      const response = await submitVote(option);
      setResults(response.results);

      // Save vote to localStorage
      if (balanceGame) {
        const voteKey = VOTE_STORAGE_KEY + balanceGame.month;
        localStorage.setItem(voteKey, option);
        setHasVoted(true);
      }

      // Show results after a short delay
      setTimeout(() => {
        setShowResults(true);
        setSubmitting(false);
      }, 500);
    } catch (err) {
      console.error('Failed to submit vote:', err);
      setError('투표 제출에 실패했습니다. 다시 시도해주세요.');
      setSelectedOption(null);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#F5F5F5] to-white flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#FF6B00] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">투표 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !balanceGame) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#F5F5F5] to-white flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4 text-lg">{error || '투표 데이터를 불러올 수 없습니다.'}</p>
          <button
            onClick={loadVoteData}
            className="bg-[#FF6B00] text-white px-6 py-3 rounded-lg hover:bg-[#E56000] transition-colors font-medium"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  const percentageA = results.totalVotes > 0 ? ((results.optionA / results.totalVotes) * 100).toFixed(1) : '0.0';
  const percentageB = results.totalVotes > 0 ? ((results.optionB / results.totalVotes) * 100).toFixed(1) : '0.0';

  return (
    <div className="min-h-screen bg-linear-to-br from-[#F5F5F5] to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-block px-4 py-2 bg-[#FF6B00] text-white rounded-full text-sm mb-4">
            🔥 {balanceGame.month} 밸런스 게임
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl text-[#1A1A1A] mb-4 px-4">
            이달의 밸런스 게임
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            알럼나이 선배님들의 선택은? 과몰입 주의! 🤔
          </p>
          
          {/* Total Votes */}
          <div className="mt-6 flex items-center justify-center gap-2 text-gray-500">
            <Users size={20} />
            <span>총 {results.totalVotes.toLocaleString()}명 참여</span>
          </div>

          {/* Already Voted Notice */}
          {hasVoted && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm"
            >
              <AlertCircle size={16} />
              <span>이미 투표에 참여하셨습니다</span>
            </motion.div>
          )}
        </div>

        {/* Balance Game Cards */}
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {/* Option A */}
          <motion.div
            whileHover={{ scale: selectedOption || hasVoted ? 1 : 1.02 }}
            whileTap={{ scale: selectedOption || hasVoted ? 1 : 0.98 }}
            className="relative"
          >
            <button
              onClick={() => handleVote('A')}
              disabled={selectedOption !== null || hasVoted}
              className={`w-full h-full p-6 sm:p-8 rounded-2xl shadow-xl transition-all ${
                selectedOption === 'A'
                  ? 'bg-[#FF6B00] text-white ring-4 ring-[#FF6B00] ring-offset-4'
                  : selectedOption === 'B'
                  ? 'bg-white text-gray-400 opacity-50'
                  : 'bg-white text-[#1A1A1A] hover:bg-[#FFF5F0] hover:shadow-2xl'
              } disabled:cursor-not-allowed`}
            >
              <div className="text-center">
                <div className="text-5xl sm:text-7xl mb-4">{balanceGame.optionA.emoji}</div>
                <h2 className={`text-2xl sm:text-3xl mb-3 ${selectedOption === 'A' ? 'text-white' : ''}`}>
                  {balanceGame.optionA.title}
                </h2>
                <p
                  className={`text-base sm:text-lg leading-relaxed ${
                    selectedOption === 'A' ? 'text-white/90' : 'text-gray-600'
                  }`}
                >
                  {balanceGame.optionA.description}
                </p>

                {/* Show results */}
                {showResults && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6"
                  >
                    <div className="text-3xl sm:text-4xl mb-2 font-bold">{percentageA}%</div>
                    <div className="w-full bg-white/30 rounded-full h-3 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentageA}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="bg-white h-full rounded-full"
                      />
                    </div>
                  </motion.div>
                )}
              </div>
            </button>

            {selectedOption === 'A' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 bg-[#FF6B00] text-white rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center text-xl sm:text-2xl shadow-xl"
              >
                ✓
              </motion.div>
            )}
          </motion.div>

          {/* Option B */}
          <motion.div
            whileHover={{ scale: selectedOption || hasVoted ? 1 : 1.02 }}
            whileTap={{ scale: selectedOption || hasVoted ? 1 : 0.98 }}
            className="relative"
          >
            <button
              onClick={() => handleVote('B')}
              disabled={selectedOption !== null || hasVoted}
              className={`w-full h-full p-6 sm:p-8 rounded-2xl shadow-xl transition-all ${
                selectedOption === 'B'
                  ? 'bg-[#1A1A1A] text-white ring-4 ring-[#1A1A1A] ring-offset-4'
                  : selectedOption === 'A'
                  ? 'bg-white text-gray-400 opacity-50'
                  : 'bg-white text-[#1A1A1A] hover:bg-[#F5F5F5] hover:shadow-2xl'
              } disabled:cursor-not-allowed`}
            >
              <div className="text-center">
                <div className="text-5xl sm:text-7xl mb-4">{balanceGame.optionB.emoji}</div>
                <h2 className={`text-2xl sm:text-3xl mb-3 ${selectedOption === 'B' ? 'text-white' : ''}`}>
                  {balanceGame.optionB.title}
                </h2>
                <p
                  className={`text-base sm:text-lg leading-relaxed ${
                    selectedOption === 'B' ? 'text-white/90' : 'text-gray-600'
                  }`}
                >
                  {balanceGame.optionB.description}
                </p>

                {/* Show results */}
                {showResults && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6"
                  >
                    <div className="text-3xl sm:text-4xl mb-2 font-bold">{percentageB}%</div>
                    <div className="w-full bg-white/30 rounded-full h-3 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentageB}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="bg-white h-full rounded-full"
                      />
                    </div>
                  </motion.div>
                )}
              </div>
            </button>

            {selectedOption === 'B' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 bg-[#1A1A1A] text-white rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center text-xl sm:text-2xl shadow-xl"
              >
                ✓
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Results Message */}
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center bg-white rounded-2xl shadow-lg p-6 sm:p-8"
          >
            <div className="flex items-center justify-center gap-2 text-[#FF6B00] mb-4">
              <TrendingUp size={24} />
              <h3 className="text-xl sm:text-2xl font-bold">투표 완료!</h3>
            </div>
            <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
              {selectedOption === 'A'
                ? `${balanceGame.optionA.title}를 선택하셨군요! ${percentageA}%의 알럼나이가 같은 선택을 했습니다.`
                : `${balanceGame.optionB.title}를 선택하셨군요! ${percentageB}%의 알럼나이가 같은 선택을 했습니다.`}
            </p>
            <p className="text-sm text-gray-500 mt-4">
              다음 달에도 재미있는 밸런스 게임으로 찾아뵙겠습니다! 🎉
            </p>
          </motion.div>
        )}

        {/* Info Section */}
        <div className="mt-8 sm:mt-12 bg-linear-to-r from-[#FF6B00] to-[#E56000] text-white rounded-2xl p-6 sm:p-8 text-center">
          <h3 className="text-xl sm:text-2xl mb-3 font-bold">매달 새로운 밸런스 게임!</h3>
          <p className="text-white/90 leading-relaxed max-w-2xl mx-auto text-sm sm:text-base">
            커리어, 개발 스택, 취미 등 다양한 주제로 알럼나이 선배님들의 선택을 확인해보세요.
            코딩 동아리 특유의 밈과 재미를 담은 질문들이 기다립니다!
          </p>
        </div>
      </div>
    </div>
  );
}