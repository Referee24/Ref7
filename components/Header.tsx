import React from 'react';
import { ViewState } from '../types';

interface HeaderProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  return (
    <header className="sticky top-0 z-50 w-full glass-panel shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            className="flex-shrink-0 flex items-center cursor-pointer group"
            onClick={() => onNavigate('HOME')}
          >
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center mr-3 group-hover:bg-indigo-600 transition-colors duration-300">
              <span className="text-white font-bold text-lg">R7</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Ref7-T</h1>
              <p className="text-xs text-gray-500 font-medium">国家级裁判考核系统</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex space-x-8">
            <button
              onClick={() => onNavigate('HOME')}
              className={`text-sm font-medium transition-colors duration-200 ${
                currentView === 'HOME' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              首页
            </button>
            <button
              onClick={() => onNavigate('STUDY')}
              className={`text-sm font-medium transition-colors duration-200 ${
                currentView === 'STUDY' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              资料学习
            </button>
            <button
              onClick={() => onNavigate('EXAM')}
              className={`px-4 py-2 rounded-md text-sm font-medium text-white transition-all duration-200 shadow-md ${
                currentView === 'EXAM' 
                  ? 'bg-indigo-700 shadow-indigo-200' 
                  : 'bg-black hover:bg-gray-800'
              }`}
            >
              模拟考试
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};