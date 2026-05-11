import { useApp } from '../../context/AppContext';

export default function Toast() {
  const { toast } = useApp();
  return (
    <div className={`toast${toast ? ' show' : ''}`}>
      <span>{toast ? toast.match(/^([\u{1F300}-\u{1FFFF}⚠✅❌🔥🎉👻🔗🔖💬❤️📅🏠🎭😂📊🛡️])/u)?.[0] || '✅' : '✅'}</span>
      <span>{(toast || '').replace(/^[\u{1F300}-\u{1FFFF}⚠✅❌🔥🎉👻🔗🔖💬❤️📅🏠🎭😂📊🛡️]\s*/u, '')}</span>
    </div>
  );
}
