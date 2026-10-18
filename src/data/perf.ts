import type { Performance, StageEvent } from './types';

// Building blocks for scenes. Each returns a timeline the 3D stage can play.
// beats mark when each written step starts, so captions stay in sync.

const g = (t: number, name: string, dur: number, p?: Record<string, unknown>): StageEvent => ({ t, g: name, dur, p });
const once = (t: number, clip: string): StageEvent => ({ t, clip, once: true });
const loop = (t: number, clip: string): StageEvent => ({ t, clip });

const NOD = 'gestic_listen_accept_01';
const NO = 'gestic_listen_deny_01';

export const P = {
  bow(o: { you?: number; local?: number; hands?: 'front'; youHands?: 'front' } = {}): Performance {
    return {
      duration: 7, gap: 1.25, camera: 'three',
      events: {
        local: [g(0.6, 'bow', 2.8, { deg: o.local ?? 30, hands: o.hands })],
        you: [g(1.0, 'bow', 2.6, { deg: o.you ?? 25, hands: o.youHands })],
      },
      beats: [0, 0.6, 1.6, 3.6],
    };
  },

  handshake(o: { twoHanded?: boolean; youTwoHanded?: boolean; lean?: number; after?: 'heart' | 'nod'; limp?: boolean; lookAway?: boolean; support?: boolean } = {}): Performance {
    const local: StageEvent[] = [g(0.6, 'handshake', 3.0, { twoHanded: o.twoHanded, lean: o.lean })];
    const you: StageEvent[] = [g(0.6, 'handshake', 3.0, { twoHanded: o.youTwoHanded, limp: o.limp, support: o.support, lean: o.support ? 0.2 : undefined })];
    if (o.after === 'heart') local.push(g(3.8, 'handOnHeart', 2.3));
    if (o.after === 'nod') { local.push(g(3.7, 'nod', 1.2)); you.push(g(3.9, 'nod', 1.2)); }
    if (o.lookAway) you.push(g(0.9, 'look', 2.6, { yaw: 0.7, down: 0.15 }));
    return { duration: o.after ? 7 : 6.2, gap: 0.95, camera: 'three', events: { local, you }, beats: [0, 0.6, 1.4, 3.6] };
  },

  cheek(count = 2, first: 'right' | 'left' = 'right'): Performance {
    const dur = 0.6 + 1.15 * count;
    const beats = [0, 0.6];
    for (let i = 0; i < count; i++) beats.push(0.9 + i * 1.15);
    return {
      duration: dur + 2.2, gap: 0.42, camera: 'three',
      events: { local: [g(0.6, 'cheekKiss', dur, { count, first })], you: [g(0.6, 'cheekKiss', dur, { count, first })] },
      beats,
    };
  },

  heart(o: { youToo?: boolean } = {}): Performance {
    return {
      duration: 6.5, gap: 1.15, camera: 'three',
      events: {
        local: [g(0.6, 'handOnHeart', 3.0)],
        you: o.youToo === false ? [g(1.2, 'nod', 1.4, { deg: 16 })] : [g(1.1, 'handOnHeart', 2.7)],
      },
      beats: [0, 0.6, 1.4, 3.7],
    };
  },

  namaste(): Performance {
    return {
      duration: 6.5, gap: 1.2, camera: 'three',
      events: { local: [g(0.6, 'namaste', 3.2)], you: [g(1.0, 'namaste', 2.9)] },
      beats: [0, 0.6, 1.5, 3.8],
    };
  },

  wai(level: 1 | 2 | 3 = 2): Performance {
    return {
      duration: 7, gap: 1.2, camera: 'three',
      events: { you: [g(0.5, 'wai', 3.2, { level })], local: [g(1.2, 'wai', 2.8, { level: Math.max(1, level - 1) })] },
      beats: [0, 0.5, 1.4, 3.8],
    };
  },

  nod(): Performance {
    return {
      duration: 5.5, gap: 1.1, camera: 'three',
      events: { local: [g(0.6, 'nod', 1.6, { deg: 18, times: 1 })], you: [g(1.1, 'nod', 1.6, { deg: 18, times: 1 })] },
      beats: [0, 0.6, 1.2, 2.8],
    };
  },

  // Offering a business card with both hands; the guest receives it and reads it.
  card(o: { oneHand?: boolean } = {}): Performance {
    if (o.oneHand) {
      return {
        duration: 6.5, gap: 1.0, camera: 'three',
        events: {
          you: [g(0.5, 'giveOne', 2.4, { hand: 'R' })],
          local: [g(1.4, 'giveOne', 2.2, { hand: 'R' }), once(3.6, NO)],
        },
        props: [{ id: 'card', kind: 'card', at: [{ t: 0, holder: 'you', facing: 'out' }, { t: 2.05, holder: 'local', facing: 'in' }] }],
        beats: [0, 0.5, 1.6, 3.6],
      };
    }
    return {
      duration: 8.2, gap: 0.95, camera: 'three',
      events: {
        local: [g(0.5, 'offer', 2.4, { item: 'card' }), g(4.4, 'bow', 2.0, { deg: 15 })],
        you: [g(1.5, 'offer', 3.6, { item: 'card', retract: 1.2, lookAtItem: true, facing: 'in' }), g(5.3, 'bow', 2.0, { deg: 15 })],
      },
      props: [{ id: 'card', kind: 'card', at: [{ t: 0, holder: 'local', facing: 'out' }, { t: 2.3, holder: 'you', facing: 'in' }] }],
      beats: [0, 0.5, 1.7, 2.9, 4.5],
    };
  },

  gift(o: { oneHand?: boolean; color?: string } = {}): Performance {
    if (o.oneHand) {
      return {
        duration: 6.5, gap: 1.0, camera: 'three',
        events: { you: [g(0.5, 'giveOne', 2.4, { hand: 'R', item: 'gift' })], local: [once(2.4, NO)] },
        props: [{ id: 'gift', kind: 'gift', color: o.color, at: [{ t: 0, holder: 'you' }] }],
        beats: [0, 0.5, 2.4],
      };
    }
    return {
      duration: 8, gap: 0.95, camera: 'three',
      events: {
        you: [g(0.5, 'offer', 2.5, { item: 'gift', bendDeg: 14 })],
        local: [g(1.5, 'offer', 3.4, { item: 'gift', retract: 1.2, bendDeg: 8 }), g(5.0, 'nod', 1.4, { deg: 16 })],
      },
      props: [{ id: 'gift', kind: 'gift', color: o.color, at: [{ t: 0, holder: 'you' }, { t: 2.35, holder: 'local' }] }],
      beats: [0, 0.5, 1.7, 3.0, 5.0],
    };
  },

  // Handing something over with one specific hand.
  hand(hand: 'R' | 'L'): Performance {
    return {
      duration: 6.5, gap: 1.0, camera: 'three',
      events: {
        you: [g(0.5, 'giveOne', 2.4, { hand })],
        local: hand === 'L' ? [g(1.4, 'giveOne', 2.2, { hand: 'R' }), once(3.4, NO)] : [g(1.4, 'giveOne', 2.2, { hand: 'R' }), g(3.6, 'nod', 1.2)],
      },
      props: [{ id: 'card', kind: 'card', at: [{ t: 0, holder: 'you', facing: 'out' }, { t: 2.05, holder: 'local', facing: 'in' }] }],
      beats: [0, 0.5, 1.6, 3.5],
    };
  },

  point(): Performance {
    return {
      duration: 5.5, gap: 1.4, camera: 'three',
      events: { you: [g(0.6, 'pointFinger', 2.6)], local: [once(1.5, NO)] },
      beats: [0, 0.6, 1.6],
    };
  },

  openHand(): Performance {
    return {
      duration: 5.5, gap: 1.4, camera: 'three',
      events: { you: [g(0.6, 'openHand', 2.8)], local: [g(1.6, 'nod', 1.4, { deg: 14 })] },
      beats: [0, 0.6, 1.6],
    };
  },

  beckon(style: 'finger' | 'palmDown'): Performance {
    return {
      duration: 6, gap: 2.0, camera: 'three',
      events: {
        you: [g(0.6, 'beckon', 3.2, { style })],
        local: style === 'finger' ? [once(2.0, NO)] : [g(2.0, 'nod', 1.4, { deg: 14 })],
      },
      beats: [0, 0.6, 2.0],
    };
  },

  sign(name: 'thumbsUp' | 'okSign' | 'vSign', good: boolean, p?: Record<string, unknown>): Performance {
    return {
      duration: 5.5, gap: 1.5, camera: 'three',
      events: { you: [g(0.6, name, 2.8, p)], local: good ? [g(1.6, 'smile', 2.4), once(1.7, NOD)] : [once(1.7, NO)] },
      beats: [0, 0.6, 1.7],
    };
  },

  touchHead(): Performance {
    return {
      duration: 6, gap: 0.75, camera: 'three',
      events: { you: [g(0.6, 'touchHead', 2.4)], local: [g(1.6, 'look', 2.4, { yaw: -0.5, down: 0.12 }), once(2.6, NO)] },
      beats: [0, 0.6, 1.8],
    };
  },

  phone(loud: boolean): Performance {
    return {
      duration: 8, gap: 1.6, camera: 'three',
      events: loud
        ? { you: [loop(0.3, 'cell_phone_talk_01')], local: [g(1.8, 'look', 3.5, { yaw: 0.35, down: 0.05 }), once(3.6, NO)] }
        : { you: [g(1.0, 'look', 6.0, { yaw: -0.2, down: 0.32 })], local: [] },
      beats: loud ? [0, 0.3, 1.8] : [0, 1.0, 3.0],
    };
  },

  photo(ask: boolean): Performance {
    return ask
      ? {
          duration: 8, gap: 1.8, camera: 'three',
          events: { you: [g(0.5, 'openHand', 1.8), once(3.2, 'take_picture')], local: [g(1.3, 'nod', 1.4, { deg: 16 }), g(3.0, 'smile', 4)] },
          beats: [0, 0.5, 1.3, 3.2],
        }
      : {
          duration: 7, gap: 1.8, camera: 'three',
          events: { you: [once(0.4, 'take_picture')], local: [g(1.4, 'look', 3.5, { yaw: 0.8, down: 0.1 }), once(2.6, NO)] },
          beats: [0, 0.4, 1.6],
        };
  },

  wave(): Performance {
    return {
      duration: 6, gap: 2.4, camera: 'three',
      events: { you: [once(0.5, 'wave_01')], local: [once(1.3, 'wave_01')] },
      beats: [0, 0.5, 1.4],
    };
  },

  invite(): Performance {
    return {
      duration: 7, gap: 1.3, camera: 'three',
      events: { local: [once(0.5, 'invite_sit')], you: [g(2.6, 'handOnHeart', 2.6)] },
      beats: [0, 0.5, 2.6],
    };
  },

  wobble(): Performance {
    return {
      duration: 6, gap: 1.2, camera: 'three',
      events: { local: [g(0.8, 'wobble', 2.6)], you: [g(1.0, 'smile', 3)] },
      beats: [0, 0.8, 2.2],
    };
  },

  talk(): Performance {
    return {
      duration: 9, gap: 1.05, camera: 'three',
      events: { local: [loop(0.2, 'gestic_talk_relaxed_01')], you: [loop(0.2, 'gestic_listen_neutral_01')] },
      beats: [0, 0.2, 3.5],
    };
  },

  tiltNo(): Performance {
    return {
      duration: 5.5, gap: 1.2, camera: 'three',
      events: { you: [g(0.4, 'openHand', 1.6)], local: [g(1.6, 'tiltNo', 1.6)] },
      beats: [0, 0.4, 1.6],
    };
  },

  shrug(): Performance {
    return {
      duration: 5, gap: 1.2, camera: 'three',
      events: { local: [once(0.6, 'gestic_shrug_01')], you: [g(2.0, 'nod', 1.2)] },
      beats: [0, 0.6, 2.0],
    };
  },

  // Greeting meets the wrong greeting: one person bows or does a wai, the other reaches for a hand.
  mismatch(localG: 'bow' | 'wai' | 'namaste' | 'handOnHeart', youG: 'handshake' | 'cheekKiss'): Performance {
    const lp = localG === 'bow' ? { deg: 30 } : localG === 'wai' ? { level: 2 } : {};
    return {
      duration: 6.5, gap: youG === 'cheekKiss' ? 0.6 : 1.0, camera: 'three',
      events: {
        local: [g(0.6, localG, 3.0, lp), g(1.4, 'look', 2.2, { down: 0.06 })],
        you: [g(0.5, youG, 2.8, youG === 'cheekKiss' ? { count: 1 } : {})],
      },
      beats: [0, 0.5, 1.6],
    };
  },
};
