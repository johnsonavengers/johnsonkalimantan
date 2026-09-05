"use client";

import { useState, type CSSProperties } from "react";

// Fixed positions keep server and browser rendering identical.
const leaves = [
  [3, 17, -5, 24], [13, 23, -14, 18], [25, 20, -2, 22],
  [38, 26, -19, 16], [49, 22, -9, 20], [61, 25, -3, 18],
  [73, 19, -12, 24], [83, 24, -7, 17], [94, 21, -17, 22],
];

export default function FallingLeaves() {
  const [paused, setPaused] = useState(false);
  return (
    <>
      <div className={`leaf-atmosphere${paused ? " is-paused" : ""}`} aria-hidden="true">
        {leaves.map(([left, duration, delay, size], index) => (
          <div key={left} className={`falling-leaf${index % 3 === 0 ? " burning-leaf" : ""}`}
            style={{ left: `${left}%`, "--fall-duration": `${duration}s`, "--fall-delay": `${delay}s`, "--leaf-size": `${size}px`, "--drift": `${index % 2 ? -55 : 55}px` } as CSSProperties}>
            <div className="leaf-tumble">
              <span className="leaf-blade" />
              {index % 3 === 0 && Array.from({ length: 6 }, (_, shard) => (
                <i key={shard} className="leaf-fragment" style={{ "--shard-x": `${(shard - 2.5) * 15}px`, "--shard-y": `${18 + (shard % 3) * 20}px`, "--shard-turn": `${shard * 73}deg` } as CSSProperties} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <button className="leaf-motion-toggle" type="button" aria-pressed={paused}
        onClick={() => setPaused(!paused)} aria-label={paused ? "Lanjutkan animasi daun" : "Jeda animasi daun"}>
        <span aria-hidden="true">{paused ? "▶" : "Ⅱ"}</span> {paused ? "Lanjutkan efek" : "Jeda efek"}
      </button>
    </>
  );
}
