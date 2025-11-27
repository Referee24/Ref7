
import React, { useState, useEffect, useRef } from 'react';
import { generateStudyMaterial } from '../services/geminiService';
import { StudyTopic } from '../types';

const SYSTEM_TOPICS: StudyTopic[] = [
  { id: '1', title: '第5条：球员 - 受伤', description: '关于球员受伤时的比赛停止与替换规则', prompt: 'FIBA规则第5条：球员受伤' },
  { id: '2', title: '第25条：带球走', description: '中枢脚的确定、持球移动的合法性', prompt: 'FIBA规则第25条：带球走' },
  { id: '3', title: '第33条：接触 - 一般原则', description: '圆柱体原则、垂直原则、合法防守位置', prompt: 'FIBA规则第33条：接触的一般原则' },
  { id: '4', title: '第37条：违反体育运动精神的犯规', description: 'C1-C5类型的判断标准', prompt: 'FIBA规则第37条：违反体育运动精神的犯规 (Unsportsmanlike Foul)' },
  { id: '5', title: '三人裁判法 (3PO)', description: '前导、中央、追踪裁判的移动与责任区域', prompt: 'FIBA三人裁判法基础与责任分工' },
];

export const Study: React.FC = () => {
  const [activeTopic, setActiveTopic] = useState<StudyTopic | null>(null);
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  // Custom Topics State
  const [customTopics, setCustomTopics] = useState<StudyTopic[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load custom topics from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('ref7_custom_topics');
    if (saved) {
      try {
        setCustomTopics(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved topics");
      }
    }
  }, []);

  const handleTopicClick = async (topic: StudyTopic) => {
    setActiveTopic(topic);
    setLoading(true);
    setContent('');
    
    // Pass the full topic object to service
    const result = await generateStudyMaterial(topic);
    setContent(result);
    setLoading(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === 'string') {
        setNewContent(text);
        if (!newTitle) {
          setNewTitle(file.name.replace(/\.[^/.]+$/, "")); // Use filename as title if empty
        }
      }
    };
    reader.readAsText(file);
    // Reset input so the same file can be selected again if needed
    event.target.value = '';
  };

  const handleSaveCustomTopic = () => {
    if (!newTitle.trim() || !newContent.trim()) {
      alert("请输入标题和内容");
      return;
    }

    const newTopic: StudyTopic = {
      id: `custom-${Date.now()}`,
      title: newTitle,
      description: '用户自定义资料',
      prompt: newTitle,
      isCustom: true,
      userContent: newContent,
      createdAt: Date.now()
    };

    const updatedList = [newTopic, ...customTopics];
    setCustomTopics(updatedList);
    localStorage.setItem('ref7_custom_topics', JSON.stringify(updatedList));
    
    // Reset form
    setNewTitle('');
    setNewContent('');
    setShowAddModal(false);
    
    // Automatically select the new topic
    handleTopicClick(newTopic);
  };

  const handleDeleteTopic = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('确定要删除这份资料吗？')) {
      const updatedList = customTopics.filter(t => t.id !== id);
      setCustomTopics(updatedList);
      localStorage.setItem('ref7_custom_topics', JSON.stringify(updatedList));
      if (activeTopic?.id === id) {
        setActiveTopic(null);
        setContent('');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Custom Materials Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">我的资料库</h2>
              <button 
                onClick={() => setShowAddModal(true)}
                className="text-sm bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700 transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                添加
              </button>
            </div>
            
            <div className="space-y-2">
              {customTopics.length === 0 && (
                <div className="text-sm text-gray-500 italic p-4 bg-gray-50 rounded border border-dashed border-gray-300 text-center">
                  暂无资料，点击右上角添加
                </div>
              )}
              {customTopics.map((topic) => (
                <div key={topic.id} className="relative group">
                  <button
                    onClick={() => handleTopicClick(topic)}
                    className={`w-full text-left p-3 pr-8 rounded-lg border transition-all duration-200 ${
                      activeTopic?.id === topic.id
                        ? 'border-indigo-500 bg-indigo-50 shadow-md ring-1 ring-indigo-500'
                        : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <h3 className={`font-semibold text-sm truncate ${activeTopic?.id === topic.id ? 'text-indigo-900' : 'text-gray-900'}`}>
                      {topic.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(topic.createdAt || 0).toLocaleDateString()}
                    </p>
                  </button>
                  <button 
                    onClick={(e) => handleDeleteTopic(e, topic.id)}
                    className="absolute right-2 top-3 text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="删除"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* System Topics Section */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">系统课程</h2>
            <div className="space-y-2">
              {SYSTEM_TOPICS.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => handleTopicClick(topic)}
                  className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                    activeTopic?.id === topic.id
                      ? 'border-indigo-500 bg-indigo-50 shadow-md ring-1 ring-indigo-500'
                      : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <h3 className={`font-semibold ${activeTopic?.id === topic.id ? 'text-indigo-900' : 'text-gray-900'}`}>
                    {topic.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{topic.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[600px] p-8">
            {!activeTopic ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <p className="text-lg">请从左侧选择一个主题或上传资料</p>
              </div>
            ) : loading ? (
              <div className="h-full flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <p className="mt-4 text-indigo-600 font-medium">
                    {activeTopic.isCustom ? '正在分析您的资料并提取考点...' : 'AI 讲师正在生成教案...'}
                </p>
              </div>
            ) : (
              <div className="prose prose-indigo max-w-none">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                   <h2 className="text-3xl font-bold text-gray-900 my-0 flex-grow">{activeTopic.title}</h2>
                   {activeTopic.isCustom && (
                       <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full font-bold">自定义资料</span>
                   )}
                </div>
                
                {/* AI Generated Analysis */}
                <div className="whitespace-pre-wrap leading-relaxed text-gray-800">
                    {content.split('\n').map((line, idx) => {
                        if (line.startsWith('# ')) return <h1 key={idx} className="text-2xl font-bold mt-8 mb-4">{line.replace('# ', '')}</h1>
                        if (line.startsWith('## ')) return <h2 key={idx} className="text-xl font-bold mt-6 mb-3 text-indigo-700">{line.replace('## ', '')}</h2>
                        if (line.startsWith('### ')) return <h3 key={idx} className="text-lg font-bold mt-5 mb-2 text-gray-800">{line.replace('### ', '')}</h3>
                        if (line.startsWith('- ')) return <li key={idx} className="ml-4 mb-1 list-disc">{line.replace('- ', '')}</li>
                        if (line.match(/^\d+\./)) return <div key={idx} className="mb-2 font-medium">{line}</div>
                        return <p key={idx} className="mb-3">{line}</p>
                    })}
                </div>

                {/* Show Original Content for custom topics */}
                {activeTopic.isCustom && activeTopic.userContent && (
                    <div className="mt-12 pt-8 border-t border-gray-200">
                        <h3 className="text-lg font-bold text-gray-500 uppercase tracking-wider mb-4">资料原文</h3>
                        <div className="bg-gray-50 p-6 rounded-lg text-sm font-mono text-gray-600 whitespace-pre-wrap max-h-96 overflow-y-auto border border-gray-200">
                            {activeTopic.userContent}
                        </div>
                    </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Material Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowAddModal(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      添加学习资料
                    </h3>
                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">标题</label>
                        <input 
                            type="text" 
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="例如：2024判罚讲义"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">导入文件 (.txt, .md)</label>
                        <input 
                            type="file"
                            accept=".txt,.md,.json" 
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">内容</label>
                        <textarea 
                            rows={10}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-mono"
                            placeholder="在此粘贴文本内容或通过上方上传文件..."
                            value={newContent}
                            onChange={(e) => setNewContent(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                    type="button" 
                    onClick={handleSaveCustomTopic}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  保存资料
                </button>
                <button 
                    type="button" 
                    onClick={() => setShowAddModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
