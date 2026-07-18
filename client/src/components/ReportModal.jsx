import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AGENTS } from '../agents.js';

const MD = {
  h1: ({ children }) => <h1 className="text-base font-bold text-[#FCD34D] mt-3 mb-1">{children}</h1>,
  h2: ({ children }) => <h2 className="text-sm font-semibold text-neutral-200 mt-3 mb-1">{children}</h2>,
  h3: ({ children }) => <h3 className="text-sm font-semibold text-neutral-400 mt-2 mb-0.5">{children}</h3>,
  p: ({ children }) => <p className="text-sm text-neutral-300 mb-2 leading-relaxed">{children}</p>,
  ul: ({ children }) => <ul className="mb-2 space-y-0.5">{children}</ul>,
  ol: ({ children }) => <ol className="mb-2 list-decimal ml-4">{children}</ol>,
  li: ({ children }) => <li className="text-sm text-neutral-300 ml-3 list-disc">{children}</li>,
  strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
  em: ({ children }) => <em className="text-neutral-500 not-italic text-[13px]">{children}</em>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-[#F59E0B] pl-3 text-neutral-500 text-sm mb-2">{children}</blockquote>
  ),
  pre: ({ children }) => (
    <pre className="mb-3 overflow-x-auto rounded bg-[#111] border border-[#1e1e1e] p-3">{children}</pre>
  ),
  code: ({ className, children }) => {
    const isBlock = /language-/.test(className || '');
    return isBlock ? (
      <code className="text-[13px] font-mono text-neutral-300">{children}</code>
    ) : (
      <code className="bg-[#1a1a1a] rounded px-1 py-0.5 text-[13px] font-mono text-neutral-300">{children}</code>
    );
  },
  table: ({ children }) => (
    <div className="overflow-x-auto mb-3">
      <table className="w-full text-[13px] border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead>{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr>{children}</tr>,
  th: ({ children }) => (
    <th className="text-left text-neutral-400 border-b border-[#242424] pb-1.5 pr-4 font-semibold">{children}</th>
  ),
  td: ({ children }) => (
    <td className="text-neutral-300 border-b border-[#1a1a1a] py-1.5 pr-4">{children}</td>
  ),
  hr: () => <hr className="border-[#1e1e1e] my-3" />,
};

export default function ReportModal({ report, onClose }) {
  useEffect(() => {
    if (!report) return;
    document.body.style.overflow = 'hidden';
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handler);
    };
  }, [report, onClose]);

  if (!report) return null;

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        background: 'rgba(0,0,0,0.78)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90dvh',
          overflowY: 'auto',
          borderRadius: '20px',
          border: '1px solid #2a2a2a',
          background: '#0d0d0d',
          padding: '24px',
          boxSizing: 'border-box',
        }}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="text-sm font-semibold">{report.command}</div>
            <div className="text-[11px] text-neutral-600 mt-0.5">
              {new Date(report.createdAt).toLocaleString('th-TH')} · {report.type} ·{' '}
              {(report.totals?.input || 0) + (report.totals?.output || 0)} tokens
            </div>
          </div>
          <button onClick={onClose} className="text-neutral-500 hover:text-white shrink-0 text-xl">✕</button>
        </div>

        <div className="border border-[#1e1e1e] rounded-lg p-4 bg-[#0a0a0a]">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={MD}>
            {report.summary}
          </ReactMarkdown>
        </div>

        {report.outputs && (
          <details className="mt-4">
            <summary className="text-[11px] text-neutral-500 cursor-pointer uppercase tracking-wider">
              ผลวิเคราะห์รายคน ({Object.keys(report.outputs).length} agents)
            </summary>
            <div className="mt-2 space-y-3">
              {Object.entries(report.outputs).map(([k, text]) => (
                <div key={k} className="border border-[#1e1e1e] rounded-lg p-3">
                  <div className="text-xs font-semibold mb-1.5">
                    {AGENTS[k]?.nickname || k}{' '}
                    <span className="text-neutral-600 font-normal">— {AGENTS[k]?.title}</span>
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={MD}>
                      {text}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>
    </div>,
    document.body
  );
}
