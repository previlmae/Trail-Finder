const express = require("express");
const trails = require("./trails");

const app = express();
const PORT = 3000;

// Serve static files
app.use(express.static("public"));

// Helper: render stars
function renderStars(count) {
  return "★".repeat(count) + "☆".repeat(5 - count);
}

// Helper: difficulty badge color
function difficultyColor(difficulty) {
  const map = {
    Easy: "#4ade80",
    Moderate: "#facc15",
    Hard: "#f97316",
    Expert: "#ef4444",
  };
  return map[difficulty] || "#aaa";
}

// ─── Shared styles ───────────────────────────────────────────────────────────
const sharedCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500&display=swap');
  @import url('https://cdn.jsdelivr.net/npm/@picocss/pico@1/css/pico.min.css');

  :root {
    --forest: #1a2e1a;
    --moss: #3d5c2e;
    --sage: #7a9e68;
    --stone: #c4b89a;
    --cream: #f5f0e8;
    --sky: #6ba3be;
    --danger: #c0392b;
  }

  *, *::before, *::after { box-sizing: border-box; }

  body {
    background-color: var(--forest);
    color: var(--cream);
    font-family: 'DM Sans', sans-serif;
    font-weight: 300;
    margin: 0;
    min-height: 100vh;
  }

  a { color: var(--sage); text-decoration: none; }
  a:hover { color: var(--stone); }

  nav.site-nav {
    background: rgba(10, 20, 10, 0.85);
    backdrop-filter: blur(12px);
    padding: 1rem 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 100;
    border-bottom: 1px solid rgba(122, 158, 104, 0.2);
  }

  .nav-logo {
    font-family: 'Playfair Display', serif;
    font-size: 1.4rem;
    font-weight: 900;
    color: var(--cream);
    letter-spacing: -0.5px;
  }

  .nav-logo span { color: var(--sage); }

  .badge {
    display: inline-block;
    padding: 0.2rem 0.7rem;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.5px;
    color: #111;
  }

  footer {
    text-align: center;
    padding: 3rem 1rem;
    color: rgba(196, 184, 154, 0.4);
    font-size: 0.85rem;
    border-top: 1px solid rgba(122, 158, 104, 0.1);
    margin-top: 4rem;
  }
`;

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  const cards = trails
    .map(
      (t) => `
    <a href="/trails/${t.id}" class="trail-card">
      <div class="card-img" style="background-image: url('${t.image}')">
        <span class="badge difficulty-badge" style="background:${difficultyColor(t.difficulty)}">${t.difficulty}</span>
      </div>
      <div class="card-body">
        <h2>${t.name}</h2>
        <p class="location">📍 ${t.location}</p>
        <div class="card-stats">
          <span>🥾 ${t.length} mi</span>
          <span>⏱ ${t.estimatedTime}</span>
          <span class="stars" title="${t.views}/5 views">${renderStars(t.views)}</span>
        </div>
        <p class="desc-preview">${t.description.slice(0, 100)}…</p>
        <div class="tags">
          ${t.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
        </div>
      </div>
    </a>
  `
    )
    .join("");

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Trail Finder 🏔️</title>
  <style>
    ${sharedCSS}

    .hero {
      position: relative;
      height: 420px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      overflow: hidden;
      padding: 2rem;
    }

    .hero::before {
      content: '';
      position: absolute;
      inset: 0;
      background: url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1400&q=60') center/cover;
      filter: brightness(0.3) saturate(0.7);
      z-index: 0;
    }

    .hero-content { position: relative; z-index: 1; }

    .hero h1 {
      font-family: 'Playfair Display', serif;
      font-size: clamp(2.5rem, 6vw, 4.5rem);
      font-weight: 900;
      color: var(--cream);
      margin: 0 0 0.5rem;
      line-height: 1.05;
      letter-spacing: -1px;
    }

    .hero h1 em {
      font-style: normal;
      color: var(--sage);
    }

    .hero p {
      color: var(--stone);
      font-size: 1.1rem;
      max-width: 480px;
      margin: 0 auto;
    }

    .trail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
      padding: 3rem 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .trail-card {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(122, 158, 104, 0.15);
      border-radius: 12px;
      overflow: hidden;
      transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
      display: block;
      color: var(--cream);
    }

    .trail-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 20px 50px rgba(0,0,0,0.5);
      border-color: rgba(122, 158, 104, 0.4);
      color: var(--cream);
    }

    .card-img {
      height: 200px;
      background-size: cover;
      background-position: center;
      position: relative;
      display: flex;
      align-items: flex-start;
      padding: 0.75rem;
    }

    .difficulty-badge { font-size: 0.7rem; }

    .card-body {
      padding: 1.25rem;
    }

    .card-body h2 {
      font-family: 'Playfair Display', serif;
      font-size: 1.3rem;
      margin: 0 0 0.3rem;
      color: var(--cream);
    }

    .location {
      font-size: 0.8rem;
      color: var(--stone);
      margin: 0 0 0.75rem;
    }

    .card-stats {
      display: flex;
      gap: 1rem;
      font-size: 0.82rem;
      color: var(--sage);
      margin-bottom: 0.75rem;
      flex-wrap: wrap;
    }

    .stars { color: var(--stone); letter-spacing: 1px; }

    .desc-preview {
      font-size: 0.85rem;
      color: rgba(196, 184, 154, 0.7);
      margin-bottom: 0.75rem;
      line-height: 1.6;
    }

    .tags { display: flex; flex-wrap: wrap; gap: 0.4rem; }

    .tag {
      font-size: 0.7rem;
      background: rgba(122, 158, 104, 0.15);
      border: 1px solid rgba(122, 158, 104, 0.3);
      color: var(--sage);
      padding: 0.2rem 0.55rem;
      border-radius: 999px;
    }

    .section-label {
      text-align: center;
      font-size: 0.75rem;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: var(--sage);
      padding-top: 2.5rem;
    }
  </style>
</head>
<body>
  <nav class="site-nav">
    <span class="nav-logo">Trail<span>Finder</span></span>
    <span style="font-size:0.8rem; color: var(--stone)">🏔️ 6 Trails</span>
  </nav>

  <div class="hero">
    <div class="hero-content">
      <h1>Find Your Next<br/><em>Adventure</em></h1>
      <p>Curated hiking trails from easy strolls to epic multi-day expeditions.</p>
    </div>
  </div>

  <p class="section-label">All Trails</p>
  <div class="trail-grid">
    ${cards}
  </div>

  <footer>TrailFinder &copy; 2025 &mdash; Always check conditions before you hike.</footer>
</body>
</html>`);
});

// ─── DETAIL PAGE ──────────────────────────────────────────────────────────────
app.get("/trails/:id", (req, res) => {
  const trail = trails.find((t) => t.id === req.params.id);

  if (!trail) {
    return res.status(404).send(render404());
  }

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${trail.name} — TrailFinder</title>
  <style>
    ${sharedCSS}

    .trail-hero {
      height: 500px;
      background: url('${trail.image}') center/cover;
      position: relative;
      display: flex;
      align-items: flex-end;
    }

    .trail-hero::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(10,20,10,0.95) 0%, transparent 60%);
    }

    .hero-info {
      position: relative;
      padding: 2.5rem 3rem;
      z-index: 1;
      max-width: 900px;
    }

    .hero-info h1 {
      font-family: 'Playfair Display', serif;
      font-size: clamp(2rem, 5vw, 3.5rem);
      font-weight: 900;
      margin: 0 0 0.5rem;
      line-height: 1.05;
      color: var(--cream);
    }

    .hero-location {
      color: var(--stone);
      font-size: 1rem;
      margin-bottom: 1rem;
    }

    .hero-meta {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      align-items: center;
    }

    .main-content {
      max-width: 860px;
      margin: 0 auto;
      padding: 3rem 2rem;
    }

    .stat-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 1rem;
      margin: 2.5rem 0;
    }

    .stat-box {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(122, 158, 104, 0.2);
      border-radius: 10px;
      padding: 1.2rem 1rem;
      text-align: center;
    }

    .stat-box .stat-value {
      font-family: 'Playfair Display', serif;
      font-size: 1.6rem;
      font-weight: 700;
      color: var(--sage);
      display: block;
    }

    .stat-box .stat-label {
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: var(--stone);
      margin-top: 0.2rem;
      display: block;
    }

    .section-title {
      font-family: 'Playfair Display', serif;
      font-size: 1.3rem;
      color: var(--cream);
      border-left: 3px solid var(--sage);
      padding-left: 0.75rem;
      margin: 2.5rem 0 1rem;
    }

    .description {
      line-height: 1.8;
      color: rgba(196, 184, 154, 0.85);
      font-size: 1rem;
    }

    .tips-box {
      background: rgba(122, 158, 104, 0.08);
      border: 1px solid rgba(122, 158, 104, 0.25);
      border-radius: 10px;
      padding: 1.5rem 1.75rem;
      line-height: 1.8;
      color: rgba(196, 184, 154, 0.85);
    }

    .tips-box::before {
      content: '💡 ';
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--sage);
      font-size: 0.9rem;
      margin-bottom: 2rem;
      transition: gap 0.2s;
    }

    .back-link:hover { gap: 0.75rem; color: var(--stone); }

    .views-display {
      font-size: 1.1rem;
      color: var(--stone);
      letter-spacing: 2px;
    }
  </style>
</head>
<body>
  <nav class="site-nav">
    <span class="nav-logo">Trail<span>Finder</span></span>
    <a href="/" style="font-size:0.85rem">← All Trails</a>
  </nav>

  <div class="trail-hero">
    <div class="hero-info">
      <h1>${trail.name}</h1>
      <p class="hero-location">📍 ${trail.location}</p>
      <div class="hero-meta">
        <span class="badge" style="background:${difficultyColor(trail.difficulty)}">${trail.difficulty}</span>
        ${trail.tags.map((tag) => `<span class="tag" style="background:rgba(122,158,104,0.2);border:1px solid rgba(122,158,104,0.4);color:var(--sage);padding:0.2rem 0.6rem;border-radius:999px;font-size:0.75rem">${tag}</span>`).join("")}
      </div>
    </div>
  </div>

  <div class="main-content">
    <a href="/" class="back-link">← Back to all trails</a>

    <div class="stat-grid">
      <div class="stat-box">
        <span class="stat-value">${trail.length}</span>
        <span class="stat-label">Miles</span>
      </div>
      <div class="stat-box">
        <span class="stat-value">${trail.elevationGain.toLocaleString()}</span>
        <span class="stat-label">Elevation Gain (ft)</span>
      </div>
      <div class="stat-box">
        <span class="stat-value" style="font-size:1.1rem">${trail.estimatedTime}</span>
        <span class="stat-label">Est. Time</span>
      </div>
      <div class="stat-box">
        <span class="stat-value">
          <span class="views-display">${renderStars(trail.views)}</span>
        </span>
        <span class="stat-label">Scenery Rating</span>
      </div>
    </div>

    <h2 class="section-title">About This Trail</h2>
    <p class="description">${trail.description}</p>

    <h2 class="section-title">Hiker Tips</h2>
    <p class="tips-box">${trail.tips}</p>
  </div>

  <footer>TrailFinder &copy; 2025 &mdash; Always check conditions before you hike.</footer>
</body>
</html>`);
});

// ─── 404 ──────────────────────────────────────────────────────────────────────
function render404() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>404 — Trail Not Found</title>
  <style>
    ${sharedCSS}
    .lost {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 80vh;
      text-align: center;
      padding: 2rem;
    }
    .lost h1 {
      font-family: 'Playfair Display', serif;
      font-size: 6rem;
      color: var(--sage);
      margin: 0;
      line-height: 1;
    }
    .lost h2 {
      font-family: 'Playfair Display', serif;
      font-size: 1.8rem;
      color: var(--cream);
      margin: 0.5rem 0 1rem;
    }
    .lost p { color: var(--stone); max-width: 400px; line-height: 1.7; }
    .home-btn {
      display: inline-block;
      margin-top: 2rem;
      padding: 0.75rem 2rem;
      background: var(--sage);
      color: #111;
      border-radius: 999px;
      font-weight: 500;
      transition: background 0.2s;
    }
    .home-btn:hover { background: var(--stone); color: #111; }
  </style>
</head>
<body>
  <nav class="site-nav">
    <span class="nav-logo">Trail<span>Finder</span></span>
  </nav>
  <div class="lost">
    <h1>404</h1>
    <h2>Trail Not Found</h2>
    <p>Looks like you've wandered off the marked path. This trail doesn't exist — let's get you back to the trailhead.</p>
    <a href="/" class="home-btn">← Back to Trails</a>
  </div>
  <footer>TrailFinder &copy; 2025</footer>
</body>
</html>`;
}

app.use((req, res) => {
  res.status(404).send(render404());
});

// ─── START ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`TrailFinder running at http://localhost:${PORT}`);
});