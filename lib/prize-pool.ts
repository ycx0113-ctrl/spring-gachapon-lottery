export const STORAGE_KEY = 'spring-gachapon-lottery-v1';

export const PRIZES = {
  first: { label: '一等奖', initial: 13, icon: '♕', className: 'first' },
  second: { label: '二等奖', initial: 60, icon: '✿', className: 'second' },
  third: { label: '三等奖', initial: 100, icon: '✦', className: 'third' },
} as const;

export type PrizeKey = keyof typeof PRIZES;

export type HistoryEntry = {
  index: number;
  prize: PrizeKey;
  timestamp: number;
};

export type LotteryState = {
  remaining: Record<PrizeKey, number>;
  drawCount: number;
  history: HistoryEntry[];
};

export const INITIAL_STATE: LotteryState = {
  remaining: { first: 13, second: 60, third: 100 },
  drawCount: 0,
  history: [],
};

export function createInitialState(): LotteryState {
  return {
    remaining: { ...INITIAL_STATE.remaining },
    drawCount: 0,
    history: [],
  };
}

export function getTotalRemaining(state: LotteryState): number {
  return state.remaining.first + state.remaining.second + state.remaining.third;
}

/**
 * Draws one real ticket from the remaining pool.
 * The random index is mapped across the current cumulative counts, so odds always
 * equal remaining count / total remaining. The chosen count is then reduced.
 */
export function drawFromPool(
  state: LotteryState,
  random: () => number = Math.random,
): { prize: PrizeKey; state: LotteryState } | null {
  const total = getTotalRemaining(state);
  if (total <= 0) return null;

  const raw = random();
  const safeRandom = Number.isFinite(raw) ? Math.min(Math.max(raw, 0), 0.9999999999999999) : 0;
  const ticketIndex = Math.floor(safeRandom * total);

  let cursor = state.remaining.first;
  let prize: PrizeKey;
  if (ticketIndex < cursor) {
    prize = 'first';
  } else {
    cursor += state.remaining.second;
    prize = ticketIndex < cursor ? 'second' : 'third';
  }

  const entry: HistoryEntry = {
    index: state.drawCount + 1,
    prize,
    timestamp: Date.now(),
  };

  return {
    prize,
    state: {
      remaining: {
        ...state.remaining,
        [prize]: state.remaining[prize] - 1,
      },
      drawCount: entry.index,
      history: [...state.history, entry],
    },
  };
}

export function isValidLotteryState(value: unknown): value is LotteryState {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<LotteryState>;
  if (!candidate.remaining || typeof candidate.remaining !== 'object' || !Array.isArray(candidate.history)) return false;

  const keys = Object.keys(PRIZES) as PrizeKey[];
  const counts: Record<PrizeKey, number> = { first: 0, second: 0, third: 0 };

  for (let i = 0; i < candidate.history.length; i += 1) {
    const item = candidate.history[i] as Partial<HistoryEntry>;
    if (!item || item.index !== i + 1 || !keys.includes(item.prize as PrizeKey)) return false;
    counts[item.prize as PrizeKey] += 1;
  }

  if (candidate.drawCount !== candidate.history.length) return false;

  return keys.every((key) => {
    const remaining = candidate.remaining?.[key];
    return Number.isInteger(remaining)
      && Number(remaining) >= 0
      && Number(remaining) <= PRIZES[key].initial
      && Number(remaining) === PRIZES[key].initial - counts[key];
  });
}

export function loadLotteryState(): LotteryState {
  if (typeof window === 'undefined') return createInitialState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed: unknown = JSON.parse(raw);
    return isValidLotteryState(parsed) ? parsed : createInitialState();
  } catch {
    return createInitialState();
  }
}

export function saveLotteryState(state: LotteryState): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetStoredLottery(): LotteryState {
  if (typeof window !== 'undefined') window.localStorage.removeItem(STORAGE_KEY);
  return createInitialState();
}
