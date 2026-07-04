import AgentCard from './AgentCard.jsx';
import { AGENTS, TEAM_COLORS, PIPELINE_STAGES } from '../agents.js';

function Connector({ active, color }) {
  return (
    <div className="flex justify-center py-1">
      <div className="relative w-0.5 h-8 bg-[#1e1e1e] overflow-hidden rounded">
        {active && (
          <div className="arrow-fill absolute top-0 left-0 w-full" style={{ background: color }} />
        )}
      </div>
    </div>
  );
}

export default function PipelineView({ pipeline, agents, status }) {
  const stages = PIPELINE_STAGES[pipeline] || PIPELINE_STAGES.full;

  const stageDone = (stage) => stage.every((k) => agents[k]?.status === 'done');

  return (
    <div className="flex flex-col items-center py-4">
      {status === 'idle' && (
        <div className="text-center text-neutral-600 py-16">
          <div className="text-5xl mb-4">🎯</div>
          <div className="text-sm font-semibold text-neutral-500">พร้อมวิเคราะห์พอร์ตของคุณ</div>
          <div className="text-xs mt-2 text-neutral-700">พิมพ์คำสั่งให้ป้อม (CIO) หรือเลือก preset เพื่อเริ่ม pipeline</div>
          <div className="text-xs mt-1 text-neutral-800">9 agents standby · 7 pipeline stages · 3 ตลาด</div>
        </div>
      )}

      {status === 'running' && Object.values(agents).every((a) => a?.status === 'pending') && (
        <div className="w-full max-w-xl mx-auto flex flex-col gap-4 py-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl bg-[#1a1a1a] h-20"
              style={{ opacity: 1 - i * 0.15 }}
            />
          ))}
          <div className="text-center text-xs text-neutral-700 mt-2">กำลังเริ่ม pipeline...</div>
        </div>
      )}

      {status !== 'idle' && !(status === 'running' && Object.values(agents).every((a) => a?.status === 'pending')) &&
        stages.map((stage, i) => {
          const nextColor = TEAM_COLORS[AGENTS[stage[0]].team];
          return (
            <div key={i} className="flex flex-col items-center">
              {i > 0 && <Connector active={stageDone(stages[i - 1])} color={nextColor} />}
              <div className="flex gap-4">
                {stage.map((k) => (
                  <AgentCard key={k} agentKey={k} state={agents[k]} />
                ))}
              </div>
            </div>
          );
        })}
    </div>
  );
}
