import { Fragment, memo, useState } from 'react';
import type { KnowledgeAnswer as KnowledgeAnswerData, KnowledgeSource } from '@/types';

function sourceUrl(source: KnowledgeSource): string {
  if (source.document_url || source.file_url) return source.document_url || source.file_url || '';
  if (!source.relative_path) return '';
  const base = `/api/source/file?path=${encodeURIComponent(source.relative_path)}`;
  const page = source.source_locator?.match(/(?:第\s*)?(\d+)\s*页|page\s*(\d+)/i);
  const pageNumber = page?.[1] || page?.[2];
  return pageNumber && source.relative_path.toLowerCase().endsWith('.pdf') ? `${base}#page=${pageNumber}` : base;
}

function renderInline(text: string, sources: KnowledgeSource[]) {
  const parts = text.split(/(\*\*[^*]+\*\*|【资料\s*\d+】|\[资料\s*\d+\])/g);
  return parts.map((part, index) => {
    const strong = part.match(/^\*\*(.+)\*\*$/);
    if (strong) return <strong key={index}>{strong[1]}</strong>;
    const citation = part.match(/[【[]资料\s*(\d+)[】\]]/);
    if (citation) {
      const source = sources[Number(citation[1]) - 1];
      const url = source ? sourceUrl(source) : '';
      return url ? (
        <a
          key={index}
          href={url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex mx-0.5 px-1.5 py-0.5 rounded-full bg-primary-light text-primary text-[11px] font-medium align-middle"
        >
          资料{citation[1]} ↗
        </a>
      ) : <span key={index} className="text-text-muted">{part}</span>;
    }
    return <Fragment key={index}>{part}</Fragment>;
  });
}

function AnswerBody({ answer, sources }: { answer: string; sources: KnowledgeSource[] }) {
  return (
    <div className="text-sm text-text-primary leading-7">
      {answer.split(/\r?\n/).map((raw, index) => {
        const line = raw.trim();
        if (!line) return <div key={index} className="h-2" />;
        const heading = line.match(/^(?:#{1,4}\s*|(?:一|二|三|四|五|六|七|八|九|十)[、.]\s*)(.+)$/);
        if (heading) return <h4 key={index} className="font-bold text-[15px] mt-3 mb-1">{renderInline(heading[1], sources)}</h4>;
        const numbered = line.match(/^(\d+[.、]|[-•])\s*(.+)$/);
        if (numbered) {
          return <div key={index} className="flex items-start gap-2 py-0.5"><span className="text-primary font-semibold">{numbered[1]}</span><span>{renderInline(numbered[2], sources)}</span></div>;
        }
        return <p key={index}>{renderInline(line, sources)}</p>;
      })}
    </div>
  );
}

function SectionTitle({ number, children }: { number: number; children: string }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <span className="w-5 h-5 rounded bg-primary text-white text-[11px] font-bold flex items-center justify-center">{number}</span>
      <h3 className="text-sm font-bold text-text-primary">{children}</h3>
    </div>
  );
}

interface Props {
  data: KnowledgeAnswerData;
  streamingText?: string;
  onQuestion?: (question: string) => void;
}

export const KnowledgeAnswer = memo(function KnowledgeAnswer({ data, streamingText, onQuestion }: Props) {
  const [sourcesExpanded, setSourcesExpanded] = useState(false);
  const answer = streamingText || data.answer;
  // 模型引用编号与完整 sources 一一对应，不能用最多6条的 reference_materials 代替。
  const sources = data.sources?.length ? data.sources : (data.reference_materials || []);
  const diagnosis = data.diagnosis;
  const checklist = diagnosis?.checklist || [];
  const relatedQuestions = Array.from(new Set([
    ...(data.related_questions || []),
    ...(diagnosis?.next_questions || []),
  ].filter(Boolean))).slice(0, 8);
  const hasDiagnosis = Boolean(checklist.length || diagnosis?.pending_question || diagnosis?.title);
  let section = 1;

  return (
    <div className="space-y-4">
      {data.retrieval && (
        <div className="flex flex-wrap gap-1.5 text-[10px] text-text-secondary">
          {data.retrieval.task_type && <span className="rounded-full bg-input-bg px-2 py-1">智能分类：{data.retrieval.task_type}</span>}
          {sources.length > 0 && <span className="rounded-full bg-input-bg px-2 py-1">采用 {sources.length} 条知识资料</span>}
          {Number(data.retrieval.exact_fault_match_count || 0) > 0 && <span className="rounded-full bg-input-bg px-2 py-1">精确命中 {data.retrieval.exact_fault_match_count} 条</span>}
        </div>
      )}

      <section>
        <SectionTitle number={section++}>分析与结论</SectionTitle>
        <AnswerBody answer={answer} sources={sources} />
      </section>

      {data.solution_steps.length > 0 && (
        <section className="rounded-lg bg-primary-light px-3 py-3">
          <SectionTitle number={section++}>检查与处理步骤</SectionTitle>
          <ol className="space-y-2">
            {data.solution_steps.map((step, index) => (
              <li key={`${index}-${step}`} className="flex items-start gap-2 text-xs leading-5 text-text-primary">
                <span className="w-5 h-5 rounded-full bg-white text-primary font-semibold flex items-center justify-center flex-shrink-0">{index + 1}</span>
                <span>{renderInline(step, sources)}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {hasDiagnosis && (
        <section className="rounded-lg border border-purple/20 bg-purple/5 px-3 py-3">
          <SectionTitle number={section++}>引导诊断</SectionTitle>
          {diagnosis?.title && <p className="text-sm font-semibold text-purple mb-1">{diagnosis.title}</p>}
          <div className="flex flex-wrap gap-1.5 mb-2 text-[10px] text-text-secondary">
            {diagnosis?.evidence_status && <span className="rounded-full bg-white px-2 py-1">证据：{diagnosis.evidence_status}</span>}
            {diagnosis?.safety_level && <span className="rounded-full bg-white px-2 py-1">安全等级：{diagnosis.safety_level}</span>}
            {diagnosis?.context_applied && <span className="rounded-full bg-white px-2 py-1 text-purple">已结合上轮回答</span>}
          </div>
          {checklist.length > 0 && (
            <ol className="space-y-1.5 mb-2">
              {checklist.map((item, index) => <li key={`${index}-${item}`} className="text-xs leading-5 text-text-primary">{index + 1}. {renderInline(item, sources)}</li>)}
            </ol>
          )}
          {diagnosis?.pending_question && (
            <div className="mt-2 rounded-lg bg-white px-3 py-2.5">
              <p className="text-[11px] text-text-muted mb-1">下一步请确认</p>
              <p className="text-xs font-medium text-text-primary">{diagnosis.pending_question}</p>
              {diagnosis.reply_options?.length ? (
                <div className="flex flex-wrap gap-2 mt-2">
                  {diagnosis.reply_options.map(option => <button key={option} onClick={() => onQuestion?.(option)} className="rounded-full bg-purple px-3 py-1 text-xs text-white">{option}</button>)}
                </div>
              ) : null}
            </div>
          )}
        </section>
      )}

      {data.safety_notice && !answer.includes(data.safety_notice) && (
        <section className="rounded-lg bg-orange-50 px-3 py-3 text-xs leading-5 text-orange-700">
          <SectionTitle number={section++}>安全提示</SectionTitle>
          {renderInline(data.safety_notice, sources)}
        </section>
      )}

      {relatedQuestions.length > 0 && (
        <section>
          <SectionTitle number={section++}>相关问题</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {relatedQuestions.map(question => (
              <button key={question} onClick={() => onQuestion?.(question)} className="rounded-full bg-primary-light px-2.5 py-1.5 text-xs text-primary active:opacity-70">{question}</button>
            ))}
          </div>
        </section>
      )}

      {sources.length > 0 && (
        <section className="border-t border-border-color pt-3">
          <button
            type="button"
            onClick={() => setSourcesExpanded(value => !value)}
            className="w-full flex items-center gap-2 rounded-lg bg-input-bg px-3 py-2.5 text-left active:opacity-70"
          >
            <span className="w-5 h-5 rounded bg-primary text-white text-[11px] font-bold flex items-center justify-center">{section++}</span>
            <span className="text-sm font-bold text-text-primary flex-1">参考资料</span>
            <span className="text-[11px] text-text-muted">共 {sources.length} 条</span>
            <svg className={`w-4 h-4 text-primary transition-transform ${sourcesExpanded ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {sourcesExpanded && <div className="space-y-2 mt-2">
            {sources.slice(0, 12).map((source, index) => {
              const url = sourceUrl(source);
              const content = (
                <>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-primary-light text-primary text-[10px] font-bold flex items-center justify-center">{index + 1}</span>
                    <span className="text-xs font-medium text-text-primary truncate flex-1">{source.file_name || '知识库资料'}</span>
                    <span className={`text-[11px] ${url ? 'text-primary' : 'text-text-muted'}`}>{url ? '定位原文 ↗' : '暂无原文地址'}</span>
                  </div>
                  {source.source_locator && <p className="ml-7 mt-1 text-[11px] text-text-muted">{source.source_locator}</p>}
                  {source.excerpt && <p className="ml-7 mt-1 text-[11px] text-text-secondary line-clamp-2">{source.excerpt}</p>}
                </>
              );
              return url ? (
                <a key={`${source.file_name}-${source.source_locator}-${index}`} href={url} target="_blank" rel="noreferrer" className="block rounded-lg bg-input-bg px-3 py-2 active:opacity-70">{content}</a>
              ) : (
                <div key={`${source.file_name}-${source.source_locator}-${index}`} className="rounded-lg bg-input-bg px-3 py-2">{content}</div>
              );
            })}
          </div>}
        </section>
      )}
    </div>
  );
});
