import { getTotalRemaining, LotteryState, PRIZES, PrizeKey } from '@/lib/prize-pool';

const prizeOrder: PrizeKey[] = ['first', 'second', 'third'];

export function PrizeInventory({ state }: { state: LotteryState }) {
  return (
    <aside className="inventory-card" aria-label="奖品剩余数量">
      <p className="eyebrow">TODAY&apos;S LUCK</p>
      <h1>今天的幸运<br />会是什么呢？</h1>
      <div className="inventory-title"><span>✦</span> 奖品剩余</div>
      {prizeOrder.map((key) => {
        const prize = PRIZES[key];
        return (
          <div className="inventory-row" key={key}>
            <div><b>{prize.label}</b><span>{state.remaining[key]} / {prize.initial}</span></div>
            <progress className={`progress-track ${prize.className}`} max={prize.initial} value={state.remaining[key]} aria-label={`${prize.label}剩余`} />
          </div>
        );
      })}
      <div className="total-left"><span>扭蛋池里还有</span><strong>{getTotalRemaining(state)}</strong><span>颗</span></div>
    </aside>
  );
}
