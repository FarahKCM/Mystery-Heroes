const { useState, useEffect, useRef, useMemo, useCallback } = React;

const PLAYERS = ["Calum", "Howie", "Theo", "Andy"];
const ROLES = ["Tank", "DPS", "Support", "Random"];

// ---------- Faction toggle ----------
function FactionToggle({ faction, onChange }) {
  return (
    <div className="faction-toggle" role="tablist" aria-label="Faction">
      <button
        type="button"
        role="tab"
        aria-selected={faction === "overwatch"}
        className={`faction-opt ${faction === "overwatch" ? "is-on" : ""}`}
        onClick={() => onChange("overwatch")}
      >
        OVERWATCH
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={faction === "talon"}
        className={`faction-opt is-talon ${faction === "talon" ? "is-on" : ""}`}
        onClick={() => onChange("talon")}
      >
        TALON
      </button>
    </div>
  );
}

// ---------- Player toggle (top right) ----------
function PlayerToggle({ active, onToggle }) {
  return (
    <div className="player-panel">
      <div className="panel-header">
        <span className="panel-title">SQUAD</span>
        <span className="panel-hint">{active.length}/4 ACTIVE</span>
      </div>
      <div className="player-grid">
        {PLAYERS.map((p) => {
          const on = active.includes(p);
          return (
            <button
              key={p}
              className={`player-tile ${on ? "on" : "off"}`}
              onClick={() => onToggle(p)}
              type="button"
            >
              <div className="checkbox" aria-hidden="true">
                <svg viewBox="0 0 16 16" width="14" height="14">
                  <path
                    d="M3 8.5 L7 12 L13 4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="player-name">{p}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Role selector ----------
function RoleSelect({ value, onChange, disabled }) {
  return (
    <div className={`role-select ${disabled ? "is-disabled" : ""}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>
      <svg className="caret" viewBox="0 0 10 6" width="10" height="6" aria-hidden="true">
        <path d="M0 0 L5 6 L10 0" fill="currentColor" />
      </svg>
    </div>
  );
}

// ---------- Lock button ----------
function LockButton({ locked, onToggle, disabled }) {
  return (
    <button
      type="button"
      className={`lock-btn ${locked ? "is-locked" : ""}`}
      onClick={onToggle}
      disabled={disabled}
      title={locked ? "Locked — won't reroll" : "Unlocked"}
      aria-pressed={locked}
    >
      <svg viewBox="0 0 16 20" width="13" height="16" aria-hidden="true">
        {locked ? (
          <>
            <path d="M3 9 V6 a5 5 0 0 1 10 0 V9" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <rect x="2" y="9" width="12" height="9" rx="1.4" fill="currentColor" />
          </>
        ) : (
          <>
            <path d="M3 9 V6 a5 5 0 0 1 9.5 -2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <rect x="2" y="9" width="12" height="9" rx="1.4" fill="currentColor" />
          </>
        )}
      </svg>
    </button>
  );
}

// ---------- Character card ----------
function CharacterCard({
  player,
  role,
  hero,
  locked,
  rolling,
  reelHero,
  finalSlot,
  onRoleChange,
  onLockToggle,
  index,
}) {
  const showHero = rolling ? reelHero : hero;
  // During a roll, show the icon only once this player has revealed (locked in).
  // Otherwise show the placeholder ? until their slot lands.
  const showPortrait = !rolling
    ? !!hero
    : !!finalSlot && !!reelHero;
  const portraitName = !rolling ? hero : reelHero;
  const displayRole = rolling && !locked
    ? (role === "Random" ? "RANDOM" : role.toUpperCase())
    : (hero ? window.heroRole(hero).toUpperCase() : role.toUpperCase());

  return (
    <div className={`char-card ${rolling && !locked ? "is-rolling" : ""} ${finalSlot ? "is-revealing" : ""}`} style={{ "--idx": index }}>
      <div className="role-row">
        <span className="role-label">ROLE</span>
        <RoleSelect value={role} onChange={onRoleChange} disabled={locked || rolling} />
        <LockButton locked={locked} onToggle={onLockToggle} disabled={rolling} />
      </div>

      <div className="portrait-frame">
        <div className="portrait-corners" aria-hidden="true">
          <span /><span /><span /><span />
        </div>
        <div className="portrait-inner">
          {showPortrait ? (
            <window.HeroPortrait name={portraitName} />
          ) : (
            <div className="portrait-empty">
              <span className="empty-glyph">?</span>
              {!rolling && <span className="empty-text">AWAITING ROLL</span>}
            </div>
          )}
          {rolling && !locked && <div className="reel-flash" aria-hidden="true" />}
          {locked && <div className="locked-stamp">LOCKED</div>}
        </div>
        <div className="role-tag" data-role={hero && !rolling ? window.heroRole(hero) : role}>
          {displayRole}
        </div>
      </div>

      <div className="card-foot">
        <div className="hero-name">{showHero || "—"}</div>
        <div className="player-tag">{player}</div>
      </div>
    </div>
  );
}

// ---------- Main app ----------
function App() {
  const [active, setActive] = useState(["Calum", "Howie", "Theo", "Andy"]);
  const [faction, setFaction] = useState(() => {
    try { return localStorage.getItem("ow_faction") || "overwatch"; } catch (e) { return "overwatch"; }
  });
  useEffect(() => {
    document.documentElement.setAttribute("data-faction", faction);
    try { localStorage.setItem("ow_faction", faction); } catch (e) {}
  }, [faction]);
  // per-player state, keyed by name
  const [state, setState] = useState(() => {
    const o = {};
    PLAYERS.forEach((p) => { o[p] = { role: "Random", hero: null, locked: false }; });
    return o;
  });
  const [rolling, setRolling] = useState(false);
  const [reels, setReels] = useState({}); // player -> hero shown right now
  const [revealed, setRevealed] = useState({}); // player -> bool (for reveal flash)
  const reelTimers = useRef([]);

  const toggleActive = (p) => {
    if (rolling) return;
    setActive((cur) => cur.includes(p) ? cur.filter(x => x !== p) : [...cur, p].sort((a,b) => PLAYERS.indexOf(a) - PLAYERS.indexOf(b)));
  };

  const setPlayer = (p, patch) => {
    setState((s) => ({ ...s, [p]: { ...s[p], ...patch } }));
  };

  const clearTimers = () => {
    reelTimers.current.forEach((t) => clearTimeout(t));
    reelTimers.current = [];
  };

  useEffect(() => () => clearTimers(), []);

  // Compute pool for a role
  const poolFor = (role) => {
    if (role === "Random") return [...HEROES.Tank, ...HEROES.DPS, ...HEROES.Support];
    return [...HEROES[role]];
  };

  const roll = () => {
    if (rolling) return;
    if (active.length === 0) return;

    // Players who will roll vs locked
    const rollingPlayers = active.filter((p) => !state[p].locked);
    if (rollingPlayers.length === 0) return;

    // Reserved heroes (locked players) — exclude from pools
    const reserved = new Set(
      active
        .filter((p) => state[p].locked && state[p].hero)
        .map((p) => state[p].hero)
    );

    // Pick final assignments with global dedup AND a role cap of 2.
    // Count locked players' actual hero roles toward the cap, then assign
    // explicit-role players first (they're the constraint), then Random.
    const ROLE_CAP = 2;
    const roleCount = { Tank: 0, DPS: 0, Support: 0 };
    // Locked players contribute their hero's actual role
    active.filter((p) => state[p].locked && state[p].hero).forEach((p) => {
      const r = window.heroRole(state[p].hero);
      roleCount[r] = (roleCount[r] || 0) + 1;
    });

    const finalAssign = {};
    const used = new Set(reserved);

    // Split rolling players: explicit role first, Random last
    const explicitRolePlayers = rollingPlayers.filter((p) => state[p].role !== "Random");
    const randomPlayers = rollingPlayers.filter((p) => state[p].role === "Random");

    let failed = false;

    // Validate explicit roles don't already overshoot the cap
    for (const p of explicitRolePlayers) {
      const r = state[p].role;
      // We will assign one of role r, so projected count = current + 1
      // We don't pre-reject here (locked + explicit may exceed 2 — user's choice),
      // but we will enforce cap on Random picks below.
      void r;
    }

    // Assign explicit-role players
    const explicitOrder = [...explicitRolePlayers].sort((a, b) => {
      const pa = poolFor(state[a].role).filter((h) => !used.has(h)).length;
      const pb = poolFor(state[b].role).filter((h) => !used.has(h)).length;
      return pa - pb;
    });
    for (const p of explicitOrder) {
      const pool = poolFor(state[p].role).filter((h) => !used.has(h));
      if (pool.length === 0) { failed = true; break; }
      const pick = pool[Math.floor(Math.random() * pool.length)];
      finalAssign[p] = pick;
      used.add(pick);
      const r = window.heroRole(pick);
      roleCount[r] = (roleCount[r] || 0) + 1;
    }

    // Assign Random players, restricted to roles whose count is still under cap
    if (!failed) {
      // Shuffle random players for fairness
      for (let i = randomPlayers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [randomPlayers[i], randomPlayers[j]] = [randomPlayers[j], randomPlayers[i]];
      }
      for (const p of randomPlayers) {
        const allowedRoles = ["Tank", "DPS", "Support"].filter((r) => roleCount[r] < ROLE_CAP);
        let pool = [];
        for (const r of allowedRoles) {
          pool = pool.concat(HEROES[r].filter((h) => !used.has(h)));
        }
        if (pool.length === 0) {
          // Fallback: cap impossible to satisfy — relax cap for this pick
          pool = poolFor("Random").filter((h) => !used.has(h));
          if (pool.length === 0) { failed = true; break; }
        }
        const pick = pool[Math.floor(Math.random() * pool.length)];
        finalAssign[p] = pick;
        used.add(pick);
        const r = window.heroRole(pick);
        roleCount[r] = (roleCount[r] || 0) + 1;
      }
    }

    if (failed) {
      return;
    }

    // Begin animation
    clearTimers();
    setRevealed({});
    setRolling(true);

    const TICK_MS = 80;          // ms per reel frame
    const BASE_DURATION = 1500;  // ms first player rolls
    const STAGGER = 550;         // additional ms per subsequent player
    // Animation ordering: left-to-right by their on-screen position (active order)
    const animOrder = active.filter((p) => !state[p].locked);

    // Build a shuffled cycle pool per player so each card rotates through
    // its own distinct sequence (no duplicates within one player's reel),
    // and cards are visually de-synced from each other.
    const shuffle = (arr) => {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };
    const cycles = {};
    const phase = {}; // per-player tick phase offset so they don't all change in lockstep
    animOrder.forEach((p, i) => {
      cycles[p] = shuffle(poolFor(state[p].role));
      phase[p] = i * 23; // ms offset
    });

    // Initial reel frames — distinct heroes across cards
    const initialReels = {};
    const usedInitial = new Set();
    animOrder.forEach((p) => {
      const pool = cycles[p].filter((h) => !usedInitial.has(h));
      const pick = (pool.length ? pool : cycles[p])[0];
      initialReels[p] = pick;
      usedInitial.add(pick);
    });
    setReels(initialReels);

    animOrder.forEach((p, i) => {
      const stopAt = BASE_DURATION + i * STAGGER;
      const cycle = cycles[p];
      // Start each player a few steps into their cycle so initial frame doesn't repeat
      let idx = 1;
      let k = 1;
      while (true) {
        const at = phase[p] + k * TICK_MS;
        if (at >= stopAt) break;
        const stepIdx = idx;
        const t = setTimeout(() => {
          setReels((r) => ({ ...r, [p]: cycle[stepIdx % cycle.length] }));
        }, at);
        reelTimers.current.push(t);
        idx++;
        k++;
      }
      // Land on final
      const landT = setTimeout(() => {
        setReels((r) => ({ ...r, [p]: finalAssign[p] }));
        setRevealed((rv) => ({ ...rv, [p]: true }));
      }, stopAt);
      reelTimers.current.push(landT);
    });

    // Finish — commit to state
    const totalDuration = BASE_DURATION + (animOrder.length - 1) * STAGGER + 250;
    const endT = setTimeout(() => {
      setState((s) => {
        const next = { ...s };
        for (const p of animOrder) {
          next[p] = { ...next[p], hero: finalAssign[p] };
        }
        return next;
      });
      setRolling(false);
      setReels({});
      // clear reveal flash a bit later
      const cl = setTimeout(() => setRevealed({}), 700);
      reelTimers.current.push(cl);
    }, totalDuration);
    reelTimers.current.push(endT);
  };

  const canRoll = active.length > 0 && !rolling && active.some(p => !state[p].locked);

  return (
    <div className="app">
      <div className="bg-grid" aria-hidden="true" />
      <div className="bg-glow" aria-hidden="true" />

      <header className="topbar">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 28 28" width="28" height="28">
              <circle cx="14" cy="14" r="12" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="14" cy="14" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="14" cy="14" r="1.6" fill="currentColor" />
              <path d="M14 1 V5 M14 23 V27 M1 14 H5 M23 14 H27" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
          <div className="brand-text">
            <div className="brand-title">HERO RANDOMISER</div>
            <FactionToggle faction={faction} onChange={setFaction} />
          </div>
        </div>
        <PlayerToggle active={active} onToggle={toggleActive} />
      </header>

      <main className="stage">
        {active.length === 0 ? (
          <div className="empty-stage">
            <div className="empty-stage-inner">
              <div className="empty-rune">◇</div>
              <div className="empty-title">NO OPERATIVES SELECTED</div>
              <div className="empty-sub">Toggle players in the squad panel to begin.</div>
            </div>
          </div>
        ) : (
          <div className="cards-row" data-count={active.length}>
            {active.map((p, i) => (
              <CharacterCard
                key={p}
                index={i}
                player={p}
                role={state[p].role}
                hero={state[p].hero}
                locked={state[p].locked}
                rolling={rolling && !state[p].locked}
                reelHero={reels[p]}
                finalSlot={revealed[p]}
                onRoleChange={(r) => setPlayer(p, { role: r })}
                onLockToggle={() => setPlayer(p, { locked: !state[p].locked })}
              />
            ))}
          </div>
        )}

        <div className="roll-wrap">
          <button
            type="button"
            className={`roll-btn ${rolling ? "is-rolling" : ""}`}
            onClick={roll}
            disabled={!canRoll}
          >
            <span className="roll-label">{rolling ? "ROLLING…" : "ROLL"}</span>
            <span className="roll-sub">
              {rolling
                ? "INITIALIZING DEPLOYMENT"
                : active.length === 0
                  ? "SELECT SQUAD TO ROLL"
                  : `DEPLOY ${active.filter(p => !state[p].locked).length} / ${active.length}`}
            </span>
            <span className="roll-corner roll-corner-tl" />
            <span className="roll-corner roll-corner-tr" />
            <span className="roll-corner roll-corner-bl" />
            <span className="roll-corner roll-corner-br" />
          </button>
        </div>
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
