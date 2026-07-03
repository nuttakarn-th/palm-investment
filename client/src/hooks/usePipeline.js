import { useCallback, useRef, useState } from 'react';
import { PIPELINE_STAGES } from '../agents.js';

const IDLE_AGENT = { status: 'pending', text: '', usage: null };

export function usePipeline() {
  const [status, setStatus] = useState('idle'); // idle | running | done | error
  const [pipeline, setPipeline] = useState('full');
  const [agents, setAgents] = useState({});     // key -> {status, text, usage}
  const [totals, setTotals] = useState({ input: 0, output: 0, cost: 0 });
  const [report, setReport] = useState(null);
  const [notified, setNotified] = useState(null);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setStatus('idle');
    setAgents({});
    setTotals({ input: 0, output: 0, cost: 0 });
    setReport(null);
    setNotified(null);
    setError(null);
  }, []);

  const run = useCallback(async ({ command, portfolio, pipeline: p = 'full', mode = 'manual' }) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const stages = PIPELINE_STAGES[p] || PIPELINE_STAGES.full;
    const initial = {};
    stages.flat().forEach((k) => (initial[k] = { ...IDLE_AGENT }));

    setPipeline(p);
    setAgents(initial);
    setTotals({ input: 0, output: 0, cost: 0 });
    setReport(null);
    setNotified(null);
    setError(null);
    setStatus('running');

    try {
      const res = await fetch('/api/pipeline/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, portfolio, pipeline: p, mode }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      const handle = (event) => {
        switch (event.type) {
          case 'agent_start':
            setAgents((a) => ({ ...a, [event.agent]: { ...a[event.agent], status: 'active' } }));
            break;
          case 'agent_delta':
            setAgents((a) => ({
              ...a,
              [event.agent]: { ...a[event.agent], text: (a[event.agent]?.text || '') + event.text },
            }));
            break;
          case 'agent_done':
            setAgents((a) => ({
              ...a,
              [event.agent]: { ...a[event.agent], status: 'done', usage: event.usage },
            }));
            setTotals((t) => ({
              input: t.input + event.usage.input,
              output: t.output + event.usage.output,
              cost: t.cost + event.cost,
            }));
            break;
          case 'pipeline_done':
            setReport(event.report);
            setStatus('done');
            break;
          case 'notified':
            setNotified({ email: event.email, telegram: event.telegram });
            break;
          case 'error':
            setError(event.message);
            setStatus('error');
            setAgents((a) => {
              const next = { ...a };
              for (const k of Object.keys(next)) {
                if (next[k].status === 'active') next[k] = { ...next[k], status: 'error' };
              }
              return next;
            });
            break;
          default:
            break;
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop();
        for (const part of parts) {
          const line = part.split('\n').find((l) => l.startsWith('data: '));
          if (line) handle(JSON.parse(line.slice(6)));
        }
      }
    } catch (e) {
      if (e.name !== 'AbortError') {
        setError(e.message);
        setStatus('error');
      }
    }
  }, []);

  return { status, pipeline, agents, totals, report, notified, error, run, reset };
}
