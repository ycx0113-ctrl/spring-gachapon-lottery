import { LotteryState, PRIZES } from '@/lib/prize-pool';

export function LotteryHistory({ state }: { state: LotteryState }) {
  const recentFirst = [...state.history].reverse();
  return (
    <details className="history-card" open={state.history.length > 0}>
      <summary>
        <span className="history-icon">⌇</span>
        <span className="history-heading"><b>抽奖记录</b><small>{state.drawCount > 0 ? `已完成 ${state.drawCount} 抽` : '点击展开'}</small></span>
        <span className="history-chevron">⌄</span>
      </summary>
      <p>每一次幸运都会记在这里</p>
      {state.history.length === 0 ? (
        <div className="empty-history"><span>☆</span><b>还没有抽奖记录</b><small>快去扭一颗吧！</small></div>
      ) : (
        <ol className="history-list">
          {recentFirst.map((entry) => (
            <li key={entry.index} className={`history-${entry.prize}`}>
              <span>第 {entry.index} 抽</span>
              <b>{PRIZES[entry.prize].icon} {PRIZES[entry.prize].label}</b>
            </li>
          ))}
        </ol>
      )}
    </details>
  );
}
