import { memo } from 'react';
import { Link } from 'react-router-dom';
import { StatusBar } from '@/components/StatusBar';
import { NavBar } from '@/components/NavBar';
import { TabBar } from '@/components/TabBar';

const cards = [
  {
    title: '智能维修知识库',
    subtitle: '故障码/其他（保养、系统、用车、修车）',
    to: '/smart-repair',
    gradient: 'from-card-blue-from to-card-blue-to',
    icon: (
      <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>
        <circle cx="11" cy="11" r="2" fill="#fff" stroke="none"/>
      </svg>
    ),
  },
  {
    title: '电路图知识库',
    subtitle: '零件号 / 底盘号 / VIN 检索　线束细节定位',
    to: '/circuit-diagram',
    gradient: 'from-card-green-from to-card-green-to',
    icon: (
      <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <rect x="3" y="3" width="18" height="18" rx="3" ry="3"/>
        <circle cx="8.5" cy="8.5" r="1.5" fill="#fff" stroke="none"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
    ),
  },
  {
    title: '智能诊断',
    subtitle: 'VIN/底盘号/故障现象/故障码，智能诊断',
    to: '/smart-diagnosis',
    gradient: 'from-card-purple-from to-card-purple-to',
    icon: (
      <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M12 2a10 10 0 1 0 10 10H12V2z"/>
        <path d="M12 2a10 10 0 0 1 10 10"/>
        <path d="M12 12L2.1 11" opacity=".5"/>
        <circle cx="12" cy="12" r="3" fill="#fff" stroke="none"/>
      </svg>
    ),
  },
];

const infoItems = [
  '维修知识库：支持故障码（UDS P码 / DM1 SPN+FMI）与文件名称的模糊搜索',
  '电路图知识库：支持零件号、底盘号、VIN智能搜索',
  '回答附参考文献与引用页码，文献支持在线查看并定位到具体页',
];

const KnowledgeBase = memo(function KnowledgeBase() {
  return (
    <div className="min-h-screen bg-bg pb-20">
      <StatusBar />
      <NavBar
        title="知识库"
        subtitle="智能问答 | 精电检索、文献在线查看"
        showBack
        backTo="/personal"
        rightAction={
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
        }
      />

      <div className="px-3 pt-3">
        {/* Cards */}
        {cards.map(card => (
          <Link
            key={card.title}
            to={card.to}
            className={`block bg-gradient-to-r ${card.gradient} rounded-xl p-4 mb-3 text-white relative overflow-hidden active:scale-[0.98] transition-transform`}
          >
            <div className="flex items-center gap-3.5 relative z-10">
              <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                {card.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[17px] font-semibold tracking-wide">{card.title}</div>
                <div className="text-xs opacity-80 mt-0.5">{card.subtitle}</div>
              </div>
              <button className="flex items-center gap-1 bg-white/25 rounded-full px-3 py-1.5 text-[13px] font-medium flex-shrink-0">
                进入问答
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </button>
            </div>
          </Link>
        ))}

        {/* Info Section */}
        <div className="bg-white rounded-xl p-4 mt-1">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            <span className="text-[15px] font-semibold text-text-primary">检索能力说明</span>
          </div>
          <ul className="space-y-2">
            {infoItems.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] text-text-secondary leading-relaxed">
                <span className="text-text-secondary mt-1.5 w-1 h-1 rounded-full bg-text-secondary flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>

          {/* Data Source Notice */}
          <div className="mt-3 bg-primary-light rounded-lg p-3 flex items-start gap-2">
            <svg className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M12 2a10 10 0 1 0 10 10H12V2z"/>
              <path d="M12 2a10 10 0 0 1 10 10"/>
            </svg>
            <p className="text-xs text-primary leading-relaxed">
              数据源说明：智能维修知识库与电路图知识库问答对话中的数据，均来源于【知识库管理后台】中配置的所有数据
            </p>
          </div>
        </div>
      </div>

      <TabBar />
    </div>
  );
});

export default KnowledgeBase;
