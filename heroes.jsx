// Hero roster organized by role.
// Portraits are procedurally generated SVG placeholders (gradient + initials)
// — replace with real artwork by swapping the `portrait` field.

const HEROES = {
  Tank: [
    "D.Va", "Domina", "Doomfist", "Hazard", "Junker Queen", "Mauga", "Orisa",
    "Ramattra", "Reinhardt", "Roadhog", "Sigma", "Winston", "Wrecking Ball",
    "Zarya"
  ],
  DPS: [
    "Anran", "Ashe", "Bastion", "Cassidy", "Echo", "Emre", "Freja", "Genji",
    "Hanzo", "Junkrat", "Mei", "Pharah", "Reaper", "Sierra", "Sojourn",
    "Soldier: 76", "Sombra", "Symmetra", "Torbjörn", "Tracer", "Vendetta",
    "Venture", "Widowmaker"
  ],
  Support: [
    "Ana", "Baptiste", "Brigitte", "Illari", "Jetpack Cat", "Juno", "Kiriko",
    "Lifeweaver", "Lúcio", "Mercy", "Mizuki", "Moira", "Wuyang", "Zenyatta"
  ],
};

const ROLE_TINTS = {
  Tank:    { a: "#2a4a7a", b: "#0a1424", accent: "#8ab4ff" }, // blue
  DPS:     { a: "#7a2a3a", b: "#240a10", accent: "#ff8a9a" }, // red
  Support: { a: "#1f5a3a", b: "#0a1f14", accent: "#7adfa3" }, // green
};

function initials(name) {
  // strip punctuation, take first letters of up to 2 words
  const cleaned = name.replace(/[.:]/g, "").trim();
  const parts = cleaned.split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function heroRole(name) {
  for (const r of ["Tank", "DPS", "Support"]) {
    if (HEROES[r].includes(name)) return r;
  }
  return "DPS";
}

// Deterministic hue per hero for a hint of variety on placeholders
function hashHue(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h % 360;
}

// Map hero name -> icon filename (only those with available artwork).
const HERO_ICONS = {
  "D.Va": "icons/Icon-DVa.webp",
  "Doomfist": "icons/Icon-Doomfist.webp",
  "Junker Queen": "icons/Icon-JunkerQueen.webp",
  "Mauga": "icons/Icon-Mauga.webp",
  "Orisa": "icons/Icon-Orisa.webp",
  "Ramattra": "icons/Icon-Ramattra.webp",
  "Reinhardt": "icons/Icon-Reinhardt.webp",
  "Roadhog": "icons/Icon-Roadhog.webp",
  "Sigma": "icons/Icon-Sigma.webp",
  "Winston": "icons/Icon-Winston.webp",
  "Wrecking Ball": "icons/Icon-WreckingBall.webp",
  "Zarya": "icons/Icon-Zarya.webp",
  "Ashe": "icons/Icon-Ashe.webp",
  "Cassidy": "icons/Icon-Cassidy.webp",
  "Genji": "icons/Icon-Genji.webp",
  "Hanzo": "icons/Icon-Hanzo.webp",
  "Junkrat": "icons/Icon-Junkrat.webp",
  "Mei": "icons/Icon-Mei.webp",
  "Pharah": "icons/Icon-Pharah.webp",
  "Reaper": "icons/Icon-Reaper.webp",
  "Sojourn": "icons/Icon-Sojourn.webp",
  "Soldier: 76": "icons/Icon-Soldier76.webp",
  "Sombra": "icons/Icon-Sombra.webp",
  "Symmetra": "icons/Icon-Symmetra.webp",
  "Torbjörn": "icons/Icon-Torbjorn.webp",
  "Tracer": "icons/Icon-Tracer.webp",
  "Venture": "icons/Icon-Venture.webp",
  "Widowmaker": "icons/Icon-Widowmaker.webp",
  "Ana": "icons/Icon-Ana.webp",
  "Baptiste": "icons/Icon-Baptiste.webp",
  "Brigitte": "icons/Icon-Brigitte.webp",
  "Illari": "icons/Icon-Illari.webp",
  "Kiriko": "icons/Icon-Kiriko.webp",
  "Lifeweaver": "icons/Icon-Lifeweaver.webp",
  "Lúcio": "icons/Icon-Lucio.webp",
  "Mercy": "icons/Icon-Mercy.webp",
  "Moira": "icons/Icon-Moira.webp",
  "Zenyatta": "icons/Icon-Zenyatta.webp",
  "Anran": "icons/Icon-Anran.webp",
  "Domina": "icons/Icon-Domina.webp",
  "Sierra": "icons/Icon-Sierra.webp",
  "Hazard": "icons/Icon-Hazard.webp",
  "Mizuki": "icons/Icon-Mizuki.webp",
  "Juno": "icons/Icon-Juno.webp",
  "Jetpack Cat": "icons/Icon-JetpackCat.webp",
  "Emre": "icons/Icon-Emre.webp",
  "Vendetta": "icons/Icon-Vendetta.webp",
  "Wuyang": "icons/Icon-Wuyang.webp",
  "Freja": "icons/Icon-Freja.webp",
  "Echo": "icons/Icon-Echo.webp",
  "Bastion": "icons/Icon-Bastion.webp",
};

function HeroPortrait({ name }) {
  if (!name) return null;
  const role = heroRole(name);
  const tint = ROLE_TINTS[role];
  const ini = initials(name);
  const icon = HERO_ICONS[name];

  if (icon) {
    return (
      <div className={`hero-img-wrap role-bg-${role}`} style={{
        background: `linear-gradient(160deg, ${tint.a}, ${tint.b})`
      }}>
        <img src={icon} alt={name} className="hero-img" loading="lazy" />
      </div>
    );
  }

  // Fallback: gradient + initials placeholder
  const id = `g_${name.replace(/[^a-z0-9]/gi, "")}_${role}`;
  return (
    <svg viewBox="0 0 220 260" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" style={{ display: "block" }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={tint.a} />
          <stop offset="100%" stopColor={tint.b} />
        </linearGradient>
      </defs>
      <rect width="220" height="260" fill={`url(#${id})`} />
      <g opacity="0.35" fill="rgba(0,0,0,0.55)">
        <circle cx="110" cy="95" r="34" />
        <path d="M40 260 C 50 175, 170 175, 180 260 Z" />
      </g>
      <text
        x="110" y="155"
        textAnchor="middle"
        fontFamily="'JetBrains Mono', ui-monospace, monospace"
        fontSize="64"
        fontWeight="700"
        fill="rgba(255,255,255,0.92)"
        style={{ letterSpacing: "2px" }}
      >
        {ini}
      </text>
      <text
        x="110" y="200"
        textAnchor="middle"
        fontFamily="'JetBrains Mono', ui-monospace, monospace"
        fontSize="11"
        fill="rgba(255,255,255,0.5)"
        style={{ letterSpacing: "2px" }}
      >
        NO ICON
      </text>
    </svg>
  );
}

window.HEROES = HEROES;
window.ROLE_TINTS = ROLE_TINTS;
window.HeroPortrait = HeroPortrait;
window.heroRole = heroRole;
