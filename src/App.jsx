import { useState, useEffect, useRef } from "react";

const ANTHROPIC_MODEL = "claude-sonnet-4-20250514";

// ─── Mock hidden door data by category ────────────────────────────────────────
const DOOR_CATEGORIES = [
  { id: "speakeasy", label: "Speakeasy", icon: "🥃", color: "#c9a84c" },
  { id: "passage", label: "Hidden Passage", icon: "🚪", color: "#8b6fcb" },
  { id: "entrance", label: "Secret Entrance", icon: "🗝️", color: "#4ca8c9" },
  { id: "rooftop", label: "Roof Access", icon: "🏙️", color: "#c97a4c" },
  { id: "underground", label: "Underground", icon: "⬇️", color: "#4cc98b" },
];

const MOCK_DOORS = [
  {
    id: 1,
    name: "PDT (Please Don't Tell)",
    category: "speakeasy",
    address: "113 St Marks Pl, New York",
    hint: "Enter through the phone booth inside Crif Dogs. Dial for a reservation.",
    distance: "0.3 mi",
    verified: true,
    difficulty: "Medium",
    lat: 40.7276,
    lng: -73.9857,
  },
  {
    id: 2,
    name: "Employees Only",
    category: "speakeasy",
    address: "510 Hudson St, New York",
    hint: "Look for the psychic's storefront. The bar is behind it.",
    distance: "0.7 mi",
    verified: true,
    difficulty: "Easy",
    lat: 40.7312,
    lng: -74.0051,
  },
  {
    id: 3,
    name: "The Innards Passage",
    category: "passage",
    address: "Manhattan Bridge Archway, Brooklyn",
    hint: "Follow the archway on the Brooklyn side — there's a door in the pillar.",
    distance: "1.2 mi",
    verified: false,
    difficulty: "Hard",
    lat: 40.7061,
    lng: -73.9969,
  },
  {
    id: 4,
    name: "Bathtub Gin",
    category: "speakeasy",
    address: "132 9th Ave, New York",
    hint: "Find the coffee shop. Ask for Stone Street Coffee. The back wall opens.",
    distance: "0.9 mi",
    verified: true,
    difficulty: "Easy",
    lat: 40.7453,
    lng: -74.0048,
  },
  {
    id: 5,
    name: "The Campbell",
    category: "entrance",
    address: "Grand Central Terminal, Vanderbilt Ave",
    hint: "The former office of John W. Campbell. Hidden above the main concourse via a stairwell most miss.",
    distance: "1.5 mi",
    verified: true,
    difficulty: "Medium",
    lat: 40.7527,
    lng: -73.9772,
  },
  {
    id: 6,
    name: "Whispering Gallery",
    category: "passage",
    address: "Grand Central Terminal lower level",
    hint: "Stand at diagonal corners of the arched ceiling. Whisper into the wall — acoustic anomaly.",
    distance: "1.5 mi",
    verified: true,
    difficulty: "Easy",
    lat: 40.7526,
    lng: -73.9771,
  },
  {
    id: 7,
    name: "Angel's Share",
    category: "speakeasy",
    address: "8 Stuyvesant St, New York",
    hint: "Enter the Japanese restaurant Village Yokocho. Go through the back. No standing allowed.",
    distance: "0.4 mi",
    verified: true,
    difficulty: "Medium",
    lat: 40.7275,
    lng: -73.9876,
  },
  {
    id: 8,
    name: "Beneath Delmonico's",
    category: "underground",
    address: "56 Beaver St, New York",
    hint: "Old wine cellars from the 19th century. Access is rumored through a marked utility door.",
    distance: "2.1 mi",
    verified: false,
    difficulty: "Hard",
    lat: 40.7048,
    lng: -74.0127,
  },
];

// ─── Pulse ring animation component ───────────────────────────────────────────
function PulseRing({ active }) {
  return (
    <div style={{ position: "relative", width: 48, height: 48, flexShrink: 0 }}>
      {active && (
        <>
          <div className="pulse-ring" style={{ animationDelay: "0s" }} />
          <div className="pulse-ring" style={{ animationDelay: "0.4s" }} />
          <div className="pulse-ring" style={{ animationDelay: "0.8s" }} />
        </>
      )}
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: "radial-gradient(circle, #c9a84c44 0%, #c9a84c11 100%)",
          border: "1.5px solid #c9a84c88",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 2,
          fontSize: 20,
        }}
      >
        🚪
      </div>
    </div>
  );
}

// ─── Door card ─────────────────────────────────────────────────────────────────
function DoorCard({ door, onInvestigate, isLoading }) {
  const [expanded, setExpanded] = useState(false);
  const cat = DOOR_CATEGORIES.find((c) => c.id === door.category);

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #0d0d0f 0%, #111116 100%)",
        border: `1px solid ${expanded ? "#c9a84c55" : "#1e1e26"}`,
        borderRadius: 12,
        padding: "16px 20px",
        marginBottom: 12,
        cursor: "pointer",
        transition: "all 0.25s ease",
        boxShadow: expanded ? "0 0 24px #c9a84c0a" : "none",
      }}
      onClick={() => setExpanded(!expanded)}
    >
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            background: `${cat?.color}15`,
            border: `1px solid ${cat?.color}44`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            flexShrink: 0,
          }}
        >
          {cat?.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 13,
                fontWeight: 600,
                color: "#e8d5a0",
                letterSpacing: "0.05em",
              }}
            >
              {door.name}
            </span>
            {door.verified && (
              <span
                style={{
                  fontSize: 9,
                  padding: "2px 6px",
                  borderRadius: 20,
                  background: "#4cc98b18",
                  border: "1px solid #4cc98b44",
                  color: "#4cc98b",
                  fontFamily: "'DM Mono', monospace",
                  letterSpacing: "0.08em",
                }}
              >
                VERIFIED
              </span>
            )}
          </div>
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 10,
              color: "#555566",
              marginTop: 3,
            }}
          >
            {door.address}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              color: "#c9a84c",
            }}
          >
            {door.distance}
          </div>
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 9,
              color:
                door.difficulty === "Easy"
                  ? "#4cc98b"
                  : door.difficulty === "Medium"
                  ? "#c9a84c"
                  : "#c94c4c",
              marginTop: 2,
            }}
          >
            {door.difficulty.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div
          style={{
            marginTop: 16,
            paddingTop: 16,
            borderTop: "1px solid #1e1e26",
            animation: "fadeIn 0.2s ease",
          }}
        >
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              color: "#8888aa",
              lineHeight: 1.7,
              marginBottom: 14,
              padding: "10px 14px",
              background: "#ffffff04",
              borderRadius: 8,
              borderLeft: `2px solid ${cat?.color}66`,
            }}
          >
            🗝 {door.hint}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onInvestigate(door);
            }}
            disabled={isLoading}
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              letterSpacing: "0.1em",
              color: "#c9a84c",
              background: "#c9a84c0d",
              border: "1px solid #c9a84c44",
              borderRadius: 6,
              padding: "8px 16px",
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.5 : 1,
              transition: "all 0.2s ease",
            }}
          >
            {isLoading ? "SCANNING..." : "⚡ INVESTIGATE WITH AI"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── AI Investigation panel ────────────────────────────────────────────────────
function InvestigationPanel({ door, response, onClose }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#000000cc",
        backdropFilter: "blur(8px)",
        zIndex: 100,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        padding: "0 0 0 0",
        animation: "fadeIn 0.2s ease",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "linear-gradient(180deg, #0a0a0e 0%, #0d0d12 100%)",
          border: "1px solid #c9a84c33",
          borderRadius: "20px 20px 0 0",
          padding: "28px 24px 48px",
          width: "100%",
          maxWidth: 600,
          maxHeight: "78vh",
          overflowY: "auto",
          boxShadow: "0 -8px 60px #c9a84c0a",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div
          style={{
            width: 36,
            height: 3,
            background: "#333344",
            borderRadius: 99,
            margin: "0 auto 24px",
          }}
        />

        <div
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 11,
            letterSpacing: "0.25em",
            color: "#c9a84c88",
            marginBottom: 6,
          }}
        >
          INTELLIGENCE REPORT
        </div>
        <div
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 16,
            color: "#e8d5a0",
            marginBottom: 20,
            letterSpacing: "0.04em",
          }}
        >
          {door.name}
        </div>

        <div
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 12,
            color: "#9999bb",
            lineHeight: 1.9,
            whiteSpace: "pre-wrap",
          }}
        >
          {response || (
            <span style={{ color: "#444455" }}>
              {"Scanning encrypted channels".split("").map((c, i) => (
                <span
                  key={i}
                  style={{
                    animation: `blink 1.2s ${i * 0.04}s infinite`,
                    display: "inline-block",
                  }}
                >
                  {c}
                </span>
              ))}
              <span style={{ animation: "blink 0.8s infinite" }}>█</span>
            </span>
          )}
        </div>

        <button
          onClick={onClose}
          style={{
            marginTop: 24,
            fontFamily: "'DM Mono', monospace",
            fontSize: 10,
            letterSpacing: "0.15em",
            color: "#555566",
            background: "transparent",
            border: "1px solid #222233",
            borderRadius: 6,
            padding: "8px 20px",
            cursor: "pointer",
            width: "100%",
          }}
        >
          CLOSE DOSSIER
        </button>
      </div>
    </div>
  );
}

// ─── Main App ──────────────────────────────────────────────────────────────────
export default function LiminalApp() {
  const [activeFilter, setActiveFilter] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [investigation, setInvestigation] = useState(null); // { door, response }
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDoorId, setAiDoorId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = MOCK_DOORS.filter((d) => {
    const matchCat = !activeFilter || d.category === activeFilter;
    const matchSearch =
      !searchQuery ||
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setScanned(true);
    }, 2200);
  };

  const handleInvestigate = async (door) => {
    setAiDoorId(door.id);
    setAiLoading(true);
    setInvestigation({ door, response: null });

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: ANTHROPIC_MODEL,
          max_tokens: 1000,
          system:
            "You are LIMINAL — a classified intelligence terminal specializing in hidden places, secret bars, concealed passages, and architectural mysteries. You write in a sophisticated, atmospheric style. Output is structured as an intelligence dossier. Use short punchy paragraphs. Include: historical context, practical access tips, what to expect inside, lore or notable patrons if applicable, and one 'insider signal' (a detail that marks you as someone who knows). Never use emojis. Keep it under 280 words.",
          messages: [
            {
              role: "user",
              content: `Generate an intelligence dossier for: ${door.name} at ${door.address}. Known hint: ${door.hint}. Category: ${door.category}. Difficulty: ${door.difficulty}.`,
            },
          ],
        }),
      });

      const data = await res.json();
      const text = data.content?.[0]?.text || "Signal lost. No intelligence retrieved.";
      setInvestigation({ door, response: text });
    } catch {
      setInvestigation({
        door,
        response: "SIGNAL LOST.\n\nEncrypted channel unavailable. Try again.",
      });
    } finally {
      setAiLoading(false);
      setAiDoorId(null);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=DM+Mono:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #080808;
          color: #ccccdd;
          min-height: 100vh;
          font-family: 'DM Mono', monospace;
        }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #c9a84c33; border-radius: 99px; }

        .pulse-ring {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 48px; height: 48px;
          border-radius: 50%;
          border: 1.5px solid #c9a84c55;
          animation: pulseOut 1.6s ease-out infinite;
          z-index: 1;
        }

        @keyframes pulseOut {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
          100% { transform: translate(-50%, -50%) scale(3); opacity: 0; }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes blink {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }

        @keyframes scanLine {
          0% { transform: translateY(-100%); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translateY(100vh); opacity: 0; }
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .filter-btn {
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .filter-btn:hover {
          transform: translateY(-1px);
        }

        input:focus { outline: none; }
      `}</style>

      {/* Scan overlay */}
      {scanning && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            background: "#000000ee",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 2,
              background: "linear-gradient(90deg, transparent, #c9a84c, transparent)",
              animation: "scanLine 2.2s ease-in-out",
            }}
          />
          <div style={{ fontSize: 36 }}>🔍</div>
          <div
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 12,
              letterSpacing: "0.3em",
              color: "#c9a84c",
            }}
          >
            SCANNING AREA
          </div>
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 10,
              color: "#555566",
              letterSpacing: "0.1em",
            }}
          >
            LOCATING HIDDEN ENTRANCES...
          </div>
        </div>
      )}

      {/* Investigation modal */}
      {investigation && (
        <InvestigationPanel
          door={investigation.door}
          response={investigation.response}
          onClose={() => setInvestigation(null)}
        />
      )}

      <div style={{ maxWidth: 600, margin: "0 auto", minHeight: "100vh" }}>
        {/* Header */}
        <div
          style={{
            padding: "40px 24px 24px",
            borderBottom: "1px solid #111118",
          }}
        >
          <div
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 9,
              letterSpacing: "0.35em",
              color: "#c9a84c66",
              marginBottom: 8,
            }}
          >
            LIMINAL INTELLIGENCE SYSTEM
          </div>
          <div
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 26,
              fontWeight: 700,
              color: "#e8d5a0",
              letterSpacing: "0.04em",
              lineHeight: 1.2,
            }}
          >
            Hidden Doors
          </div>
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              color: "#44445a",
              marginTop: 6,
            }}
          >
            Secret bars · concealed passages · forbidden access
          </div>
        </div>

        {/* Scan CTA or results header */}
        <div style={{ padding: "24px 24px 0" }}>
          {!scanned ? (
            <button
              onClick={handleScan}
              disabled={scanning}
              style={{
                width: "100%",
                padding: "18px",
                background: "linear-gradient(135deg, #c9a84c14 0%, #c9a84c08 100%)",
                border: "1px solid #c9a84c44",
                borderRadius: 12,
                cursor: scanning ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 14,
                transition: "all 0.3s ease",
              }}
            >
              <PulseRing active={!scanning} />
              <div style={{ textAlign: "left" }}>
                <div
                  style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: 13,
                    color: "#c9a84c",
                    letterSpacing: "0.1em",
                    marginBottom: 4,
                  }}
                >
                  INITIATE AREA SCAN
                </div>
                <div
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 10,
                    color: "#555566",
                  }}
                >
                  Detect hidden entrances within 2 miles
                </div>
              </div>
            </button>
          ) : (
            <div>
              {/* Status bar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 16,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#4cc98b",
                      boxShadow: "0 0 6px #4cc98b",
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 10,
                      color: "#4cc98b",
                      letterSpacing: "0.1em",
                    }}
                  >
                    {filtered.length} SIGNALS DETECTED
                  </span>
                </div>
                <button
                  onClick={() => setScanned(false)}
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 9,
                    color: "#444455",
                    background: "transparent",
                    border: "1px solid #1a1a22",
                    borderRadius: 6,
                    padding: "4px 10px",
                    cursor: "pointer",
                    letterSpacing: "0.1em",
                  }}
                >
                  RESCAN
                </button>
              </div>

              {/* Search */}
              <div
                style={{
                  position: "relative",
                  marginBottom: 14,
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: 13,
                    opacity: 0.4,
                  }}
                >
                  🔍
                </span>
                <input
                  type="text"
                  placeholder="Search locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "11px 14px 11px 38px",
                    background: "#0d0d12",
                    border: "1px solid #1a1a22",
                    borderRadius: 10,
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 11,
                    color: "#aaaacc",
                    letterSpacing: "0.04em",
                  }}
                />
              </div>

              {/* Category filters */}
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  overflowX: "auto",
                  paddingBottom: 4,
                  scrollbarWidth: "none",
                  marginBottom: 20,
                }}
              >
                <button
                  className="filter-btn"
                  onClick={() => setActiveFilter(null)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 99,
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 10,
                    letterSpacing: "0.08em",
                    background: !activeFilter ? "#c9a84c" : "transparent",
                    border: `1px solid ${!activeFilter ? "#c9a84c" : "#1e1e26"}`,
                    color: !activeFilter ? "#000" : "#555566",
                  }}
                >
                  ALL
                </button>
                {DOOR_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    className="filter-btn"
                    onClick={() => setActiveFilter(activeFilter === cat.id ? null : cat.id)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 99,
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 10,
                      letterSpacing: "0.06em",
                      background: activeFilter === cat.id ? `${cat.color}22` : "transparent",
                      border: `1px solid ${activeFilter === cat.id ? cat.color + "66" : "#1e1e26"}`,
                      color: activeFilter === cat.id ? cat.color : "#555566",
                    }}
                  >
                    {cat.icon} {cat.label.split(" ")[0].toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Door list */}
        {scanned && (
          <div style={{ padding: "0 24px 100px" }}>
            {filtered.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 0",
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 11,
                  color: "#333344",
                }}
              >
                No signals match this query.
              </div>
            ) : (
              filtered.map((door) => (
                <DoorCard
                  key={door.id}
                  door={door}
                  onInvestigate={handleInvestigate}
                  isLoading={aiLoading && aiDoorId === door.id}
                />
              ))
            )}
          </div>
        )}

        {/* Bottom legend */}
        {scanned && (
          <div
            style={{
              position: "fixed",
              bottom: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: "100%",
              maxWidth: 600,
              padding: "14px 24px",
              background: "linear-gradient(0deg, #080808 80%, transparent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 20,
            }}
          >
            {[
              { color: "#4cc98b", label: "Verified" },
              { color: "#c9a84c", label: "Medium" },
              { color: "#c94c4c", label: "Hard Access" },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 9,
                  color: "#444455",
                  letterSpacing: "0.08em",
                }}
              >
                <div
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: item.color,
                  }}
                />
                {item.label.toUpperCase()}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
