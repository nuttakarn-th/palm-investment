const STYLE = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
`;

let injected = false;

export default function PageTransition({ children }) {
  if (!injected && typeof document !== 'undefined') {
    const tag = document.createElement('style');
    tag.textContent = STYLE;
    document.head.appendChild(tag);
    injected = true;
  }

  return (
    <div style={{ animation: 'fadeIn 0.2s ease-out both' }}>
      {children}
    </div>
  );
}
