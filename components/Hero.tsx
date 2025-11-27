import React from 'react';
import { ViewState } from '../types';

interface HeroProps {
  onStartExam: () => void;
  onStartStudy: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartExam, onStartStudy }) => {
  return (
    <div className="relative overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
          <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            <div className="sm:text-center lg:text-left">
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block xl:inline">通往国家级裁判的</span>{' '}
                <span className="block text-indigo-600 xl:inline">专业之路</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                Ref7-T 是专为篮球裁判员打造的智能考核平台。结合最新FIBA规则，通过AI生成实战情景与理论试题，助您备战国家级考试。
              </p>
              <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                <div className="rounded-md shadow">
                  <button
                    onClick={onStartExam}
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg transition-all transform hover:scale-105"
                  >
                    开始模拟考试
                  </button>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <button
                    onClick={onStartStudy}
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 md:py-4 md:text-lg transition-all"
                  >
                    浏览学习资料
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 bg-gray-50">
        <img
          className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full opacity-90"
          src="https://images.unsplash.com/photo-1519861531473-920026393112?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
          alt="Basketball court referee"
        />
        <div className="absolute inset-0 bg-indigo-900 mix-blend-multiply opacity-20"></div>
      </div>
    </div>
  );
};