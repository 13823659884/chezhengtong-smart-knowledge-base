import { memo, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { StatusBar } from '@/components/StatusBar';

const mockSubOperations = [
  { name: '检查离合器线圈电阻', prob: 35, reason: '线圈断路', partNumber: '8103010-XX' },
  { name: '检查离合器间隙', prob: 12, reason: '间隙过大', partNumber: '8103011-XX' },
  { name: '检查离合器供电', prob: 8, reason: '供电异常', partNumber: '—' },
];

const DiagnosisPlanDetail = memo(function DiagnosisPlanDetail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const plan = useMemo(() => ({
    title: searchParams.get('title') || '未知方案',
    prob: Number(searchParams.get('prob')) || 0,
    desc: searchParams.get('desc') || '',
    suggestion: searchParams.get('suggestion') || '',
    faultCode: searchParams.get('faultCode') || '',
  }), [searchParams]);

  if (!plan.title || plan.title === '未知方案') {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center text-text-secondary">
          <p>暂无数据，请返回重新查看。</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg pb-6">
      <StatusBar />

      {/* Back Bar */}
      <div
        onClick={() => navigate(-1)}
        className="bg-primary text-white px-4 py-3 flex items-center gap-2 active:opacity-90 cursor-pointer"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path d="M15 18l-6-6 6-6"/>
        </svg>
        <span className="text-sm">返回诊断结果</span>
      </div>

      <div className="px-3 pt-4 space-y-3">
        {/* Title Card */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-2.5 h-2.5 rounded-full bg-warning" />
            <h1 className="text-lg font-bold text-text-primary">{plan.title}</h1>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-secondary">
            <span>DTC 关联码：{plan.faultCode}</span>
            <span>子操作：{mockSubOperations.length}项</span>
            <span>对应故障原因：{plan.title}</span>
          </div>
        </div>

        {/* Sub Operations */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="text-[15px] font-semibold text-text-primary mb-3">子操作列表</h3>
          <div className="space-y-3">
            {mockSubOperations.map((op, i) => (
              <div key={i} className="pb-3 border-b border-border-color last:border-0 last:pb-0">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-sm text-text-primary flex-1">{op.name}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                    op.prob >= 20 ? 'bg-orange-50 text-warning' : 'bg-green-50 text-success'
                  }`}>
                    {op.prob}%
                  </span>
                </div>
                <div className="ml-4 mt-1 text-xs text-text-secondary">
                  故障原因：{op.reason} | 零部件号：{op.partNumber}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Reason */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="text-[15px] font-semibold text-text-primary mb-2">当前原因</h3>
          <p className="text-sm font-medium text-text-primary">{plan.title}</p>
          <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">{plan.desc}</p>
        </div>

        {/* Suggestion */}
        <div className="bg-primary-light rounded-xl p-4">
          <p className="text-sm text-primary leading-relaxed">
            <strong>建议：</strong>{plan.suggestion.replace('建议：', '')}
          </p>
        </div>
      </div>
    </div>
  );
});

export default DiagnosisPlanDetail;
