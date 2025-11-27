import React, { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Study } from './components/Study';
import { Exam } from './components/Exam';
import { ExamResult, ViewState } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('HOME');
  const [lastExamResult, setLastExamResult] = useState<ExamResult | null>(null);

  const handleFinishExam = (result: ExamResult) => {
    setLastExamResult(result);
    setView('RESULTS');
  };

  const renderContent = () => {
    switch (view) {
      case 'HOME':
        return <Hero onStartExam={() => setView('EXAM')} onStartStudy={() => setView('STUDY')} />;
      case 'STUDY':
        return <Study />;
      case 'EXAM':
        return <Exam onFinish={handleFinishExam} onCancel={() => setView('HOME')} />;
      case 'RESULTS':
        return (
          <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
              <div className={`p-8 text-center text-white ${lastExamResult && lastExamResult.score >= 80 ? 'bg-green-600' : 'bg-indigo-600'}`}>
                <h2 className="text-3xl font-bold mb-2">考试结束</h2>
                <div className="text-6xl font-extrabold my-6">{lastExamResult?.score} <span className="text-2xl font-medium opacity-80">分</span></div>
                <p className="text-xl opacity-90">
                    {lastExamResult?.score && lastExamResult.score >= 80 ? '恭喜！您已达到国家级裁判及格标准。' : '还需努力，请查阅错题解析。'}
                </p>
                <div className="mt-6 flex justify-center space-x-8 text-sm font-medium">
                    <div>
                        <div className="opacity-70">答对</div>
                        <div className="text-2xl">{lastExamResult?.correctAnswers}</div>
                    </div>
                    <div>
                        <div className="opacity-70">总题数</div>
                        <div className="text-2xl">{lastExamResult?.totalQuestions}</div>
                    </div>
                </div>
              </div>
              
              <div className="p-8 bg-gray-50">
                <h3 className="text-xl font-bold text-gray-900 mb-6">错题解析</h3>
                {lastExamResult?.wrongQuestions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        完美表现！没有错题。
                    </div>
                ) : (
                    <div className="space-y-6">
                        {lastExamResult?.wrongQuestions.map((q, idx) => (
                            <div key={q.id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                <div className="flex items-start">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">X</span>
                                    <div>
                                        <p className="text-gray-900 font-medium mb-2">{q.content}</p>
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-600">正确答案: {q.correctAnswer ? 'YES' : 'NO'}</span>
                                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-600">类型: {q.type === 'VIDEO' ? '视频情境' : '理论'}</span>
                                        </div>
                                        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded border border-blue-100">
                                            <span className="font-bold text-blue-800">解析：</span> {q.explanation}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                <div className="mt-8 flex justify-center gap-4">
                    <button 
                        onClick={() => setView('HOME')}
                        className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        返回首页
                    </button>
                    <button 
                        onClick={() => setView('EXAM')}
                        className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        再考一次
                    </button>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <div>Not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header currentView={view} onNavigate={setView} />
      <main>
        {renderContent()}
      </main>
      
      {/* Simple Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center text-gray-400 text-sm">
            <p>© 2024 Ref7-T Exam System. All rights reserved.</p>
            <p>Designed for FIBA Referees</p>
        </div>
      </footer>
    </div>
  );
};

export default App;