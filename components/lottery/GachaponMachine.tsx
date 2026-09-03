import { PRIZES, PrizeKey } from '@/lib/prize-pool';

export type AnimationPhase = 'idle' | 'turning' | 'dropping' | 'opening' | 'revealed';

const capsules = ['pink', 'blue', 'yellow', 'mint', 'lavender', 'pink', 'mint', 'blue', 'yellow', 'lavender', 'blue', 'pink'];

export function GachaponMachine({ phase, prize }: { phase: AnimationPhase; prize: PrizeKey | null }) {
  const showCapsule = phase === 'dropping' || phase === 'opening' || phase === 'revealed';
  return (
    <>
      <div className="machine-shadow" />
      <div className="machine" data-phase={phase} aria-label="手绘风格扭蛋机">
        <div className="machine-sign">LUCKY<br /><span>CAPSULE</span></div>
        <div className="glass-dome">
          <div className="dome-shine" />
          <div className="capsule-pile">
            {capsules.map((color, index) => <span className={`mini-capsule ${color} c${index + 1}`} key={index} />)}
          </div>
        </div>
        <div className="machine-body">
          <div className="body-stitch left" /><div className="body-stitch right" />
          <div className="knob"><span /><i /></div>
          <div className="coin-slot"><i /><span>TURN</span></div>
          <div className="chute"><span /></div>
        </div>
      </div>
      <div className="result-stage" aria-live="polite" aria-atomic="true">
        {showCapsule && prize && (
          <div className={`drawn-capsule capsule-${prize} phase-${phase}`}>
            <div className="result-spark spark-a">✦</div><div className="result-spark spark-b">✿</div><div className="result-spark spark-c">·</div>
            <div className="capsule-half capsule-top" />
            <div className="prize-note">
              <small>恭喜获得</small>
              <strong>{PRIZES[prize].label}</strong>
              <span>{PRIZES[prize].icon}</span>
            </div>
            <div className="capsule-half capsule-bottom" />
          </div>
        )}
      </div>
    </>
  );
}
