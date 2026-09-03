'use client';

import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, RotateCcw, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  createInitialState,
  drawFromPool,
  getTotalRemaining,
  loadLotteryState,
  LotteryState,
  PrizeKey,
  resetStoredLottery,
  saveLotteryState,
} from '@/lib/prize-pool';
import { playSound } from '@/lib/sounds';
import { AnimationPhase, GachaponMachine } from './GachaponMachine';
import { LotteryHistory } from './LotteryHistory';
import { PrizeInventory } from './PrizeInventory';

const SOUND_PREFERENCE_KEY = 'spring-gachapon-sound-enabled';

export function LotteryApp() {
  const [state, setState] = useState<LotteryState>(createInitialState);
  const stateRef = useRef(state);
  const [phase, setPhase] = useState<AnimationPhase>('idle');
  const [currentPrize, setCurrentPrize] = useState<PrizeKey | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const busyRef = useRef(false);
  const [hydrated, setHydrated] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    const saved = loadLotteryState();
    queueMicrotask(() => {
      stateRef.current = saved;
      setState(saved);
      setSoundEnabled(window.localStorage.getItem(SOUND_PREFERENCE_KEY) === 'true');
      setHydrated(true);
    });
    return () => timersRef.current.forEach(window.clearTimeout);
  }, []);

  const later = (callback: () => void, delay: number) => {
    timersRef.current.push(window.setTimeout(callback, delay));
  };

  const handleDraw = () => {
    if (!hydrated || busyRef.current || getTotalRemaining(stateRef.current) === 0) return;
    busyRef.current = true;
    setIsBusy(true);
    setCurrentPrize(null);
    setPhase('turning');
    playSound('knob', soundEnabled);

    const result = drawFromPool(stateRef.current);
    if (!result) {
      busyRef.current = false;
      setIsBusy(false);
      setPhase('idle');
      return;
    }

    // Commit immediately: even a refresh during animation cannot return the ticket to the pool.
    stateRef.current = result.state;
    saveLotteryState(result.state);
    setState(result.state);

    later(() => {
      setCurrentPrize(result.prize);
      setPhase('dropping');
      playSound('drop', soundEnabled);
    }, 720);
    later(() => {
      setPhase('opening');
      playSound('open', soundEnabled);
    }, 1680);
    later(() => {
      setPhase('revealed');
      playSound('win', soundEnabled);
    }, 2130);
    later(() => {
      busyRef.current = false;
      setIsBusy(false);
    }, 2750);
  };

  const handleReset = () => {
    timersRef.current.forEach(window.clearTimeout);
    timersRef.current = [];
    const fresh = resetStoredLottery();
    stateRef.current = fresh;
    setState(fresh);
    setCurrentPrize(null);
    setPhase('idle');
    busyRef.current = false;
    setIsBusy(false);
  };

  const toggleSound = () => {
    setSoundEnabled((enabled) => {
      const next = !enabled;
      window.localStorage.setItem(SOUND_PREFERENCE_KEY, String(next));
      return next;
    });
  };

  const total = getTotalRemaining(state);
  const soldOut = hydrated && total === 0;

  return (
    <main className="site-shell">
      <header className="topbar">
        <div className="brand-mark"><span>✿</span> 春日扭蛋屋</div>
        <div className="utility-actions">
          <Button type="button" variant="ghost" className="utility-button" onClick={toggleSound} aria-pressed={soundEnabled}>
            {soundEnabled ? <Volume2 /> : <VolumeX />}<span>声音{soundEnabled ? '开' : '关'}</span>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger render={<Button type="button" variant="ghost" className="utility-button reset-button" disabled={isBusy} />}>
              <RotateCcw /><span>重置奖池</span>
            </AlertDialogTrigger>
            <AlertDialogContent className="reset-dialog">
              <AlertDialogHeader>
                <div className="reset-dialog-icon">↻</div>
                <AlertDialogTitle>确定要重置全部抽奖记录吗？</AlertDialogTitle>
                <AlertDialogDescription>
                  重置后一等奖恢复 13 个、二等奖恢复 60 个、三等奖恢复 100 个。已经保存的抽奖记录也会一并清空。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="dialog-cancel">先不重置</AlertDialogCancel>
                <AlertDialogAction className="dialog-confirm" onClick={handleReset}>确认重置</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </header>

      <section className="lottery-stage">
        <PrizeInventory state={state} />

        <div className="machine-zone">
          <GachaponMachine phase={phase} prize={currentPrize} />
          <Button className="draw-button" size="lg" disabled={!hydrated || isBusy || soldOut} onClick={handleDraw}>
            {soldOut ? '奖品已全部抽完' : isBusy ? '幸运正在滚来…' : '开始抽奖'}
            {!soldOut && !isBusy && <ArrowRight aria-hidden />}
          </Button>
          <p className={`draw-hint ${soldOut ? 'sold-out-hint' : ''}`}>
            {soldOut ? '173 份幸运都找到主人啦 ✿' : isBusy ? '请稍等，扭蛋马上打开' : '转动旋钮，把一份小幸运带回家'}
          </p>
        </div>

        <LotteryHistory state={state} />
      </section>

      <div className="decor cloud-one" aria-hidden>☁</div>
      <div className="decor star-one" aria-hidden>✦</div>
      <div className="decor flower-one" aria-hidden>✿</div>
      <div className="decor leaf-one" aria-hidden>⌇</div>
      <p className="fairness-note">每一颗都是真实奖券 · 动态奖池 · 不放回抽取</p>
    </main>
  );
}
