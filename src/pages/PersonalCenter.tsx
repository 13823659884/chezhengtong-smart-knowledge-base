import { memo } from 'react';
import { Link } from 'react-router-dom';
import { StatusBar } from '@/components/StatusBar';
import { TabBar } from '@/components/TabBar';

const menuItems = [
  { icon: 'M3 21h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18V7H3v2zm0-6v2h18V3H3z', label: '服务站信息管理', color: 'bg-blue-500' },
  { icon: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z', label: '服务技师管理', color: 'bg-green-500' },
  { icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z', label: '我的技术支持', color: 'bg-orange-500' },
  { icon: 'M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z', label: '我的远程指导', color: 'bg-purple-500' },
  { icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z', label: '我的举手记录', color: 'bg-teal-500' },
  { icon: 'M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z', label: '手机诊断仪', color: 'bg-indigo-500' },
  { icon: 'M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z', label: '知识库', color: 'bg-cyan-600', link: '/knowledge' },
  { icon: 'M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z', label: '我的优惠券', color: 'bg-red-500' },
  { icon: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z', label: '市场处置项目', color: 'bg-yellow-500' },
  { icon: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z', label: '工单可视化(中重卡)', color: 'bg-pink-500' },
];

const PersonalCenter = memo(function PersonalCenter() {
  return (
    <div className="min-h-screen bg-bg pb-20">
      <StatusBar />

      {/* Header */}
      <div className="bg-primary text-white px-4 pt-2 pb-4">
        <h1 className="text-center text-[17px] font-semibold tracking-wide">个人中心</h1>
      </div>

      {/* User Card */}
      <div className="mx-3 -mt-2 bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-text-primary">测试</span>
              <div className="flex items-center gap-0.5">
                {[1,2,3,4].map(i => (
                  <svg key={i} className="w-3.5 h-3.5 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                  </svg>
                ))}
                <span className="text-xs text-text-secondary ml-1">4.7</span>
              </div>
            </div>
            <div className="text-xs text-text-secondary mt-0.5">北京测试服务站</div>
            <div className="text-xs text-text-secondary mt-0.5 flex items-center gap-1">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
              </svg>
              138-0000-0000
            </div>
          </div>
        </div>
      </div>

      {/* Menu List */}
      <div className="mx-3 mt-3 bg-white rounded-xl overflow-hidden">
        {menuItems.map((item, idx) => {
          const content = (
            <div className={`flex items-center gap-3 px-4 py-3.5 ${idx < menuItems.length - 1 ? 'border-b border-border-color' : ''} active:bg-gray-50`}>
              <div className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center flex-shrink-0`}>
                <svg className="w-4.5 h-4.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d={item.icon} />
                </svg>
              </div>
              <span className="flex-1 text-[15px] text-text-primary">{item.label}</span>
              <svg className="w-4 h-4 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          );
          return item.link ? (
            <Link key={item.label} to={item.link} className="block">
              {content}
            </Link>
          ) : (
            <div key={item.label} className="cursor-pointer">
              {content}
            </div>
          );
        })}
      </div>

      <TabBar />
    </div>
  );
});

export default PersonalCenter;
