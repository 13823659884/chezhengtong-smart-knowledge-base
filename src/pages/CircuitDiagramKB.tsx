import { memo, useState, useCallback } from 'react';
import { StatusBar } from '@/components/StatusBar';
import { NavBar } from '@/components/NavBar';

const quickTags = ['3C0-971-935-A', 'TAA28788', 'LFW5RXD6L6TAA28788', '3724015-GA118', '3724285MGA121', '尾灯'];

const CircuitDiagramKB = memo(function CircuitDiagramKB() {
  const [query, setQuery] = useState('');

  const handleTagClick = useCallback((tag: string) => {
    setQuery(tag);
  }, []);

  const handleSearch = useCallback(() => {
    if (!query.trim()) return;
    alert(`搜索：${query}`);
  }, [query]);

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <StatusBar />
      <NavBar
        title="电路图知识库"
        subtitle="智能问答：零件号 / 底盘号 / VIN的智能查询"
        showBack
        backTo="/knowledge"
        bgColor="bg-[#13C2C2]"
        rightAction={
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
        }
      />

      <div className="flex-1 px-3 pt-4 pb-4 overflow-y-auto">
        {/* AI Message */}
        <div className="flex gap-3 mb-6">
          <div className="w-9 h-9 rounded-full bg-[#13C2C2] flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <div className="bg-white rounded-xl rounded-tl-none p-3.5 shadow-sm max-w-[85%]">
            <p className="text-sm text-text-primary leading-relaxed">
              你好，我是电路图知识库助手，请输入零件号、底盘号或VIN码，我将为你查询对应的电路图信息。
            </p>
            <div className="mt-2.5 pt-2.5 border-t border-border-color space-y-1.5">
              <p className="text-xs text-text-secondary">
                <span className="font-medium text-text-primary">零件号：</span>
                如 3724015-GA118
              </p>
              <p className="text-xs text-text-secondary">
                <span className="font-medium text-text-primary">底盘号：</span>
                如 TAA28788
              </p>
              <p className="text-xs text-text-secondary">
                <span className="font-medium text-text-primary">VIN码：</span>
                如 LFW5RXD6L6TAA28788
              </p>
            </div>
          </div>
        </div>

        {/* Quick Tags */}
        <div className="mb-4">
          <p className="text-xs text-text-muted mb-2">你可以试试这样问：</p>
          <div className="flex flex-wrap gap-2">
            {quickTags.map(tag => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className="px-3 py-1.5 bg-[#E6FFFB] text-[#13C2C2] rounded-full text-xs font-medium active:opacity-70 transition-opacity"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border-t border-border-color px-3 py-2.5 safe-bottom">
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-input-bg rounded-full px-4 py-2.5 flex items-center gap-2">
            <svg className="w-4 h-4 text-text-muted flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="请输入零件号"
              className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
            />
          </div>
          <button
            onClick={handleSearch}
            className="w-10 h-10 bg-[#13C2C2] rounded-full flex items-center justify-center active:opacity-80 transition-opacity flex-shrink-0"
          >
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
        </div>
        <p className="text-[10px] text-text-muted text-center mt-1.5">
          数据来源于【知识管理后台】中配置的所有数据
        </p>
      </div>
    </div>
  );
});

export default CircuitDiagramKB;
