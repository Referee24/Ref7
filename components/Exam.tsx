import React, { useState, useEffect, useCallback } from 'react';
import { generateExamQuestions } from '../services/geminiService';
import { Question, QuestionType, ExamResult } from '../types';

interface ExamProps {
  onFinish: (result: ExamResult) => void;
  onCancel: () => void;
}

export const Exam: React.FC<ExamProps> = ({ onFinish, onCancel }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

  // Load questions on mount
  useEffect(() => {
    const loadQuestions = async () => {
      // Fetch 10 questions
      const qs = await generateExamQuestions(10);
      setQuestions(qs);
      setLoading(false);
    };
    loadQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Timer
  useEffect(() => {
    if (loading || questions.length === 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, questions]);

  const handleAnswer = (answer: boolean) => {
    setAnswers(prev => ({
      ...prev,
      [questions[currentIndex].id]: answer
    }));
  };

  const handleSubmit = useCallback(() => {
    if (questions.length === 0) return;

    let correctCount = 0;
    const wrongQuestions: Question[] = [];

    questions.forEach(q => {
      const userAnswer = answers[q.id];
      if (userAnswer === q.correctAnswer) {
        correctCount++;
      } else {
        wrongQuestions.push(q);
      }
    });

    onFinish({
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      score: Math.round((correctCount / questions.length) * 100),
      wrongQuestions
    });
  }, [questions, answers, onFinish]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mb-6"></div>
        <h2 className="text-2xl font-bold text-gray-800">正在生成考卷...</h2>
        <p className="text-gray-500 mt-2">AI 考官正在根据 FIBA 规则库随机抽取题目</p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header Info */}
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center space-x-4">
            <span className="text-gray-500 font-medium">题目 {currentIndex + 1} / {questions.length}</span>
            <div className={`px-2 py-1 rounded text-xs font-bold ${currentQuestion.type === QuestionType.VIDEO ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                {currentQuestion.type === QuestionType.VIDEO ? '视频情境题' : '理论判断题'}
            </div>
        </div>
        <div className={`font-mono text-xl font-bold ${timeLeft < 60 ? 'text-red-600 animate-pulse' : 'text-gray-700'}`}>
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-8">
        <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        
        {/* Video Placeholder Area */}
        {currentQuestion.type === QuestionType.VIDEO && (
            <div className="relative w-full h-64 sm:h-80 bg-black">
                {currentQuestion.videoPlaceholderUrl ? (
                    <img 
                        src={currentQuestion.videoPlaceholderUrl} 
                        alt="Video Scenario" 
                        className="w-full h-full object-cover opacity-80"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gray-900" />
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full border border-white/30">
                        <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </div>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-black/60 backdrop-blur-md p-3 rounded text-white text-sm">
                        <span className="font-bold text-yellow-400 mr-2">情境:</span>
                        请阅读下方描述并结合画面（模拟）进行判断。
                    </div>
                </div>
            </div>
        )}

        <div className="p-8">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 leading-relaxed mb-8">
            {currentQuestion.content}
          </h3>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <button
              onClick={() => handleAnswer(true)}
              className={`flex-1 py-4 px-6 rounded-xl border-2 text-lg font-bold transition-all duration-200 ${
                answers[currentQuestion.id] === true
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-inner'
                  : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50 text-gray-600'
              }`}
            >
              YES / 正确
            </button>
            <button
              onClick={() => handleAnswer(false)}
              className={`flex-1 py-4 px-6 rounded-xl border-2 text-lg font-bold transition-all duration-200 ${
                answers[currentQuestion.id] === false
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-inner'
                  : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50 text-gray-600'
              }`}
            >
              NO / 错误
            </button>
          </div>
        </div>

        <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 flex justify-between items-center">
            <button 
                onClick={onCancel}
                className="text-gray-500 hover:text-gray-700 font-medium"
            >
                退出考试
            </button>
            
            <div className="flex gap-4">
                <button
                    onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentIndex === 0}
                    className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    上一题
                </button>
                {currentIndex < questions.length - 1 ? (
                    <button
                        onClick={() => setCurrentIndex(prev => prev + 1)}
                        className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 font-medium"
                    >
                        下一题
                    </button>
                ) : (
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-lg shadow-indigo-200"
                    >
                        提交试卷
                    </button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};