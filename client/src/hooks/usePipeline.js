import { useCallback, useEffect, useRef, useState } from 'react';
import { PIPELINE_STAGES } from '../agents.js';

const IDLE_AGENT = { status: 'pending', text: '', usage: null, lastSearch: null };

function buildAgentsFromRun(run) {
  const stages = PIPELINE_STAGES[run.pipeline || 'full'] || PIPELINE_STAGES.full;
  const agents = {};
  stages.flat().forEach((k) => (agents[k] = { ...IDLE_AGENT }));
  if (run.agents) {
    for (const [k, v] of Object.entries(run.agents)) {
      if (agents[k]) agents[k] = { ...agents[k], status: v.status || 'pending', usage: v.usage || null };
    }
  }
  return agents;
}

export function usePipeline() {
  const [status, setStatus]   = useState('idle');
  const [pipeline, setPipeline] = useState('full');
  const [agents, setAgents]   = useState({});
  const [totals, setTotals]   = useState({ input: 0, output: 0, cost: 0 });
  const [report, setReport]   = useState(null);
  const [notified, setNotified] = useState(null);
  const [error, setError]     = useState(null);

  const abortRef = useRef(null); // aborts the SSE fetch reader
  const hasSse   = useRef(false); // true while this tab owns the live SSE stream

  // ── On mount: reconnect to any active run (handles refresh + multi-device) ──
  useEffect(() => {
    fetch('/api/pipeline/state', { credentials: 'include' })
      .then((r) => r.json())
      .then((run) => {
        if (!run || run.status === 'idle' || run.status === 'cancelled') return;
        setPipeline(run.pipeline || 'full');
        setAgents(buildAgentsFromRun(run));
        setTotals(run.totals || { input: 0, output: 0, cost: 0 });
        if (run.report) setReport(run.report);
        if (run.error)  setError(run.error);
        // Map server status to client status
        setStatus(run.status === 'running' ? 'running' : run.status === 'done' ? 'done' : 'error');
      })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Poll while running WITHOUT owning the SSE stream (post-refresh / other device) ──
  useEffect(() => {
    if (status !== 'running' || hasSse.current) return;
    const id = setInterval(() => {
      fetch('/api/pipeline/state', { credentials: 'include' })
        .then((r) => r.json())
        .then((run) => {
          if (!run) return;
          setAgents(buildAgentsFromRun(run));
          setTotals(run.totals || { input: 0, output: 0, cost: 0 });
          if (run.report) setReport(run.report);
          if (run.error)  setError(run.error);
          if (run.status === 'done')      setStatus('done');
          else if (run.status === 'error')     setStatus('error');
          else if (run.status === 'cancelled') setStatus('idle');
        })
        .catch(() => {});
    }, 2000);
    return () => clearInterval(id);
  }, [status]);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    hasSse.current = false;
    setStatus('idle');
    setAgents({});
    setTotals({ input: 0, output: 0, cost: 0 });
    setReport(null);
    setNotified(null);
    setError(null);
  }, []);

  const cancel = useCallback(async () => {
    fetch('/api/pipeline/cancel', { method: 'POST', credentials: 'include' }).catch(() => {});
    reset();
  }, [reset]);

  const run = useCallback(async ({ command, portfolio, pipeline: p = 'full', mode = 'manual' }) => {
    // Abort previous SSE reader (server-side cancellation is handled by POST /api/pipeline/run)
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    hasSse.current = true;

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
        credentials: 'include',
        body: JSON.stringify({ command, portfolio, pipeline: p, mode }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      const handle = (event) => {
        switch (event.type) {
          case 'run_id':
            break; // server confirms run started
          case 'agent_start':
            setAgents((a) => ({ ...a, [event.agent]: { ...a[event.agent], status: 'active' } }));
            break;
          case 'agent_delta':
            setAgents((a) => ({
              ...a,
              [event.agent]: { ...a[event.agent], text: (a[event.agent]?.text || '') + event.text },
            }));
            break;
          case 'agent_search':
            setAgents((a) => ({
              ...a,
              [event.agent]: { ...a[event.agent], lastSearch: event.query },
            }));
            break;
          case 'agent_done':
            setAgents((a) => ({
              ...a,
              [event.agent]: { ...a[event.agent], status: 'done', usage: event.usage, lastSearch: null },
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
            hasSse.current = false;
            break;
          case 'pipeline_cancelled':
            setStatus('idle');
            setAgents({});
            hasSse.current = false;
            break;
          case 'notified':
            setNotified({ email: event.email, telegram: event.telegram });
            break;
          case 'error':
            setError(event.message);
            setStatus('error');
            hasSse.current = false;
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
      if (e.name === 'AbortError') return; // new run() call replaced us — don't touch state
      setError(e.message);
      setStatus('error');
      hasSse.current = false;
    }
  }, []);

  return { status, pipeline, agents, totals, report, notified, error, run, reset, cancel };
}
