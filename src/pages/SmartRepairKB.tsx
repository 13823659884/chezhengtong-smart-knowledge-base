import { memo, useCallback, useRef, useState } from 'react';
import { StatusBar } from '@/components/StatusBar';
import { NavBar } from '@/components/NavBar';
import { KnowledgeAnswer } from '@/components/KnowledgeAnswer';
import { searchKnowledgeBase } from '@/api';
import type { KnowledgeQueryContext } from '@/api';
import type { KnowledgeAnswer as KnowledgeAnswerData } from '@/types';
import { createSmoothTextRenderer, formatCompleteStreamingAnswer } from '@/utils/smoothStream';

const quickTags = [
  'SPN647是什么故障，如何处理？',
  'P0087故障码怎么维修？',
  '车辆动力不足怎么排查？',
  '制动不灵敏怎么处理？',
  '空调不制冷怎么检查？',
  '车辆电耗高怎么处理？',
];

const vehicleSeriesOptions = ['', 'J7', 'J6', 'J6P', 'J6L', 'JH6', 'JK6', 'J6F', 'J5', '虎6G', '领途', '鹰途', 'V卡'];
const intentOptions = [
  { value: 'fault', label: '故障码查询' },
  { value: 'symptom', label: '故障现象诊断' },
  { value: 'usage', label: '用车知识' },
  { value: 'maintenance', label: '保养知识' },
  { value: 'warranty', label: '保用知识' },
];
const targetOptions = [
  { value: 'overview', label: '含义与标准' },
  { value: 'cause', label: '可能原因' },
  { value: 'solution', label: '排查处理' },
  { value: 'safety', label: '注意事项' },
  { value: 'full', label: '完整诊断' },
];

function inferContext(question: string): KnowledgeQueryContext {
  const text = question.toLowerCase();
  const intent = /\b(?:spn|fmi)\s*[:#-]?\s*\d+|\bp[0-9a-f]{4,7}\b|故障码|报码/.test(text) ? 'fault'
    : /保用|保修|质保|三包|索赔|在保/.test(text) ? 'warranty'
      : /保养|更换周期|维护周期|多久换|润滑|油液|机油/.test(text) ? 'maintenance'
        : /怎么用|如何使用|如何操作|操作方法|驾驶|设置|驻车再生|功能/.test(text) ? 'usage'
          : 'symptom';
  const vehicleSeries = [...vehicleSeriesOptions]
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)
    .find(item => text.includes(item.toLowerCase())) || '';
  const energyType = /新能源|纯电|电动车|电驱|动力电池|高压系统/.test(text) ? '新能源'
    : /传统|燃油|柴油|天然气|燃气/.test(text) ? '传统' : '';
  // 深度模式默认给出完整诊断；只有用户明确说“只看某一项”时才收窄回答。
  const answerTarget = /(?:只|仅).*(?:原因|为什么)/.test(text) ? 'cause'
    : /(?:只|仅).*(?:步骤|处理|维修|排查)/.test(text) ? 'solution'
      : /(?:只|仅).*(?:注意|风险|安全)/.test(text) ? 'safety'
        : /(?:只|仅).*(?:含义|定义|标准)/.test(text) ? 'overview' : 'full';
  return { intent, vehicleSeries, energyType, answerTarget };
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  result?: KnowledgeAnswerData;
  status?: string;
  loading?: boolean;
  error?: string;
}

const SmartRepairKB = memo(function SmartRepairKB() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [pendingQuestion, setPendingQuestion] = useState('');
  const [queryContext, setQueryContext] = useState<KnowledgeQueryContext | null>(null);
  const [activeContext, setActiveContext] = useState<KnowledgeQueryContext | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }));
  }, []);

  const runQuery = useCallback(async (question: string, context: KnowledgeQueryContext) => {
    const text = question.trim();
    if (!text || isLoading) return;

    const assistantId = `assistant-${Date.now()}`;
    setQuery('');
    setIsLoading(true);
    setMessages(previous => [
      ...previous,
      { id: `user-${Date.now()}`, role: 'user', text },
      { id: assistantId, role: 'assistant', text: '', status: '正在连接知识库', loading: true },
    ]);
    scrollToBottom();

    const renderer = createSmoothTextRenderer(streamedText => {
      setMessages(previous => previous.map(message => (
        message.id === assistantId ? { ...message, text: streamedText } : message
      )));
      scrollToBottom();
    });

    try {
      const result = await searchKnowledgeBase(text, conversationId, {
        onStatus: status => {
          setMessages(previous => previous.map(message => (
            message.id === assistantId ? { ...message, status: status.text } : message
          )));
          scrollToBottom();
        },
        onDelta: delta => {
          renderer.push(delta);
        },
      }, context);
      setMessages(previous => previous.map(message => (
        message.id === assistantId ? { ...message, status: '正在整理处理步骤、引导诊断和相关问题' } : message
      )));
      await renderer.finish(formatCompleteStreamingAnswer(result));
      setConversationId(result.conversation_id || conversationId);
      setMessages(previous => previous.map(message => (
        message.id === assistantId
          ? { ...message, text: result.answer, result, loading: false, status: '' }
          : message
      )));
    } catch (error) {
      renderer.stop();
      const message = error instanceof Error ? error.message : '知识库请求失败';
      setMessages(previous => previous.map(item => (
        item.id === assistantId ? { ...item, loading: false, error: message, status: '' } : item
      )));
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  }, [conversationId, isLoading, scrollToBottom]);

  const prepareQuestion = useCallback((question: string) => {
    const text = question.trim();
    if (!text || isLoading) return;
    setQuery('');
    setPendingQuestion(text);
    setQueryContext(inferContext(text));
    scrollToBottom();
  }, [isLoading, scrollToBottom]);

  const confirmClassification = useCallback(() => {
    if (!pendingQuestion || !queryContext?.answerTarget) return;
    const question = pendingQuestion;
    const context = queryContext;
    setPendingQuestion('');
    setQueryContext(null);
    setActiveContext(context);
    void runQuery(question, context);
  }, [pendingQuestion, queryContext, runQuery]);

  const askFollowUp = useCallback((question: string) => {
    if (activeContext) void runQuery(question, activeContext);
    else prepareQuestion(question);
  }, [activeContext, prepareQuestion, runQuery]);

  const handleSearch = useCallback(() => prepareQuestion(query), [prepareQuestion, query]);

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <StatusBar />
      <NavBar
        title="智能维修知识库"
        subtitle="车辆维修知识检索与深度问答"
        showBack
        backTo="/knowledge"
      />

      <div className="flex-1 px-3 pt-4 pb-4 overflow-y-auto">
        <div className="flex gap-3 mb-5">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M12 2a10 10 0 0 1 10 10"/>
              <circle cx="12" cy="12" r="3" fill="#fff" stroke="none"/>
            </svg>
          </div>
          <div className="bg-white rounded-xl rounded-tl-none p-3.5 shadow-sm max-w-[88%]">
            <p className="text-sm text-text-primary leading-relaxed">
              请输入故障码、故障现象或维修问题。我会检索现有车辆知识库，并使用深度模型给出有资料依据的维修建议。
            </p>
          </div>
        </div>

        {messages.length === 0 && (
          <div className="mb-4">
            <p className="text-xs text-text-muted mb-2">你可以这样问：</p>
            <div className="flex flex-wrap gap-2">
              {quickTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => prepareQuestion(tag)}
                  className="px-3 py-1.5 bg-blue-tag text-blue-text rounded-full text-xs font-medium active:opacity-70"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {pendingQuestion && queryContext && (
          <div className="mb-4 rounded-xl bg-white p-4 shadow-sm border-l-4 border-primary">
            <div className="flex items-center justify-between gap-2 mb-2">
              <h3 className="text-sm font-bold text-text-primary">请先确认查询分类</h3>
              <span className="text-[11px] text-primary bg-primary-light rounded-full px-2 py-0.5">第一轮</span>
            </div>
            <p className="text-xs leading-5 text-text-secondary mb-3">已识别问题：{pendingQuestion}</p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <label className="text-[11px] text-text-muted">
                问题分类
                <select
                  value={queryContext.intent}
                  onChange={event => setQueryContext(previous => previous ? { ...previous, intent: event.target.value } : previous)}
                  className="mt-1 w-full rounded-lg bg-input-bg px-2.5 py-2 text-xs text-text-primary outline-none"
                >
                  {intentOptions.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </label>
              <label className="text-[11px] text-text-muted">
                车辆系列
                <select
                  value={queryContext.vehicleSeries}
                  onChange={event => setQueryContext(previous => previous ? { ...previous, vehicleSeries: event.target.value } : previous)}
                  className="mt-1 w-full rounded-lg bg-input-bg px-2.5 py-2 text-xs text-text-primary outline-none"
                >
                  {vehicleSeriesOptions.map(item => <option key={item || 'unknown'} value={item}>{item || '暂不确定'}</option>)}
                </select>
              </label>
              <label className="text-[11px] text-text-muted col-span-2">
                能源类型
                <select
                  value={queryContext.energyType}
                  onChange={event => setQueryContext(previous => previous ? { ...previous, energyType: event.target.value } : previous)}
                  className="mt-1 w-full rounded-lg bg-input-bg px-2.5 py-2 text-xs text-text-primary outline-none"
                >
                  <option value="">暂不确定</option><option value="传统">传统 / 燃油</option><option value="新能源">新能源</option>
                </select>
              </label>
            </div>
            <p className="text-xs font-medium text-text-primary mb-2">这次主要想了解什么？</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {targetOptions.map(item => (
                <button
                  key={item.value}
                  onClick={() => setQueryContext(previous => previous ? { ...previous, answerTarget: item.value } : previous)}
                  className={`px-2.5 py-1.5 rounded-full text-xs ${queryContext.answerTarget === item.value ? 'bg-primary text-white' : 'bg-input-bg text-text-secondary'}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <button
              onClick={confirmClassification}
              disabled={!queryContext.answerTarget}
              className="w-full rounded-lg bg-primary disabled:bg-gray-300 py-2.5 text-sm font-medium text-white"
            >
              确认并开始查询
            </button>
          </div>
        )}

        <div className="space-y-4">
          {messages.map(message => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={message.role === 'user'
                ? 'max-w-[86%] rounded-xl rounded-tr-none bg-primary px-3.5 py-2.5 text-sm text-white'
                : 'w-full rounded-xl bg-white p-4 shadow-sm'}
              >
                {message.role === 'user' ? (
                  <p className="leading-relaxed">{message.text}</p>
                ) : (
                  <>
                    {message.loading && message.status && (
                      <div className="mb-3 flex items-center gap-2 text-xs text-primary">
                        <span className="w-3.5 h-3.5 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                        {message.status}
                      </div>
                    )}
                    {message.result ? (
                      <KnowledgeAnswer data={message.result} onQuestion={askFollowUp} />
                    ) : message.text ? (
                      <p className="text-sm leading-7 whitespace-pre-wrap text-text-primary">{message.text}</p>
                    ) : null}
                    {message.error && (
                      <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-danger">{message.error}</div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
        <div ref={bottomRef} />
      </div>

      <div className="bg-white border-t border-border-color px-3 py-2.5 safe-bottom">
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0 bg-input-bg rounded-full px-4 py-2.5 flex items-center gap-2">
            <input
              type="text"
              value={query}
              onChange={event => setQuery(event.target.value)}
              onKeyDown={event => event.key === 'Enter' && handleSearch()}
              placeholder="请输入故障码、故障现象或维修问题"
              className="min-w-0 flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={!query.trim() || isLoading}
            className="w-10 h-10 bg-primary disabled:bg-gray-300 rounded-full flex items-center justify-center active:opacity-80 flex-shrink-0"
            aria-label="发送"
          >
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
          </button>
        </div>
        <p className="text-[10px] text-text-muted text-center mt-1.5">回答由车辆知识库检索与深度模型生成</p>
      </div>
    </div>
  );
});

export default SmartRepairKB;
