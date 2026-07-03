// Display metadata for the 9 agents (system prompts live server-side only).
export const TEAM_COLORS = {
  research: '#4F8EF7',
  analysis: '#A78BFA',
  risk: '#FB923C',
  strategy: '#34D399',
  committee: '#F9A8D4',
  presenter: '#FCD34D',
};

export const AGENTS = {
  pom: { key: 'pom', nickname: 'ป้อม', title: 'CIO · Committee Lead', team: 'committee', avatar: 'pom.jpg', model: 'sonnet' },
  piya: { key: 'piya', nickname: 'ปิยะ', title: 'Macro Researcher', team: 'research', avatar: 'piya.jpg', model: 'haiku' },
  min: { key: 'min', nickname: 'มิน', title: 'Data Researcher', team: 'research', avatar: 'min.jpg', model: 'haiku' },
  nem: { key: 'nem', nickname: 'เนม', title: 'Fundamental Analyst', team: 'analysis', avatar: 'nem.jpg', model: 'haiku' },
  ko: { key: 'ko', nickname: 'โก้', title: 'Technical Analyst', team: 'analysis', avatar: 'ko.jpg', model: 'haiku' },
  rat: { key: 'rat', nickname: 'รัฐ', title: 'Position Risk Analyst', team: 'risk', avatar: 'rat.jpg', model: 'sonnet' },
  lungchai: { key: 'lungchai', nickname: 'ลุงชาย', title: 'Portfolio Risk Manager', team: 'risk', avatar: 'lungchai.jpg', model: 'sonnet' },
  kaew: { key: 'kaew', nickname: 'แก้ว', title: 'Portfolio Strategist', team: 'strategy', avatar: 'kaew.jpg', model: 'sonnet' },
  nat: { key: 'nat', nickname: 'นัท', title: 'Report Presenter', team: 'presenter', avatar: 'nat.jpg', model: 'haiku' },
};

export const PIPELINE_STAGES = {
  full: [['piya', 'min'], ['nem', 'ko'], ['rat'], ['lungchai'], ['kaew'], ['pom'], ['nat']],
  macro: [['piya'], ['pom'], ['nat']],
  risk: [['rat'], ['lungchai'], ['pom'], ['nat']],
};

export const PRESETS = [
  { icon: '📊', label: 'วิเคราะห์หุ้น', pipeline: 'full', needsTicker: true, command: (t) => `วิเคราะห์ ${t} แบบเต็มรูปแบบ ควรซื้อ ถือ หรือเลี่ยง?` },
  { icon: '📰', label: 'ข่าวตลาดวันนี้', pipeline: 'macro', command: () => 'มีข่าวหรือแนวโน้มตลาดอะไรที่น่าห่วงหรือเป็นโอกาสบ้าง สรุปภาพ macro ให้หน่อย' },
  { icon: '⚠️', label: 'ความเสี่ยงพอร์ต', pipeline: 'risk', command: () => 'พอร์ตตอนนี้เป็นยังไง มีความเสี่ยงตรงไหนที่ต้องจัดการบ้าง' },
  { icon: '💡', label: 'น่าลงทุนอะไรบ้าง', pipeline: 'full', command: () => 'ช่วงนี้มีอะไรน่าลงทุนบ้างใน US / SET / Crypto ที่เหมาะกับโปรไฟล์ความเสี่ยงปานกลาง-ต่ำ' },
  { icon: '📅', label: 'Weekly Summary', pipeline: 'full', mode: 'weekly', command: () => 'สรุปรีวิวพอร์ตประจำสัปดาห์ พร้อมแผนสัปดาห์หน้าและ watch list' },
  { icon: '🔍', label: 'เปรียบเทียบหุ้น', pipeline: 'full', needsTicker: true, tickerPrompt: 'ใส่ 2 tickers เช่น NVDA vs AMD', command: (t) => `เปรียบเทียบ ${t} ตัวไหนน่าลงทุนกว่าสำหรับระยะกลาง` },
];
