import { useState, useCallback, useEffect } from "react";

// ============================================================
// Truco App — Visual V0 pixel-perfect
// Mesa verde felt, cartas com naipes, score, IA opponent
// TRUCO/SEIS/NOVE/DOZE | Zero backend
// ============================================================

const SUITS = ["espadas", "copas", "ouros", "paus"];
const SUIT_SYMBOLS = { espadas: "\u2660", copas: "\u2665", ouros: "\u2666", paus: "\u2663" };
const SUIT_COLORS = { espadas: "#333", copas: "#E53935", ouros: "#E53935", paus: "#333" };
const VALUES = ["4", "5", "6", "7", "Q", "J", "K", "A", "2", "3"];

function createDeck() {
  const deck = [];
  const powerMap = { "4": 1, "5": 2, "6": 3, "7": 4, "Q": 5, "J": 6, "K": 7, "A": 8, "2": 9, "3": 10 };
  for (const suit of SUITS) {
    for (const value of VALUES) {
      let power = powerMap[value] || 0;
      if (value === "4" && suit === "paus") power = 14;
      if (value === "7" && suit === "copas") power = 13;
      if (value === "A" && suit === "espadas") power = 12;
      if (value === "7" && suit === "ouros") power = 11;
      deck.push({ value, suit, power });
    }
  }
  return deck;
}

function shuffleDeck(deck) {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function Truco() {
  const [playerHand, setPlayerHand] = useState([]);
  const [aiHand, setAiHand] = useState([]);
  const [playerPlayed, setPlayerPlayed] = useState(null);
  const [aiPlayed, setAiPlayed] = useState(null);
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [roundWins, setRoundWins] = useState([]);
  const [stakes, setStakes] = useState(1);
  const [trucoState, setTrucoState] = useState("none");
  const [trucoAsker, setTrucoAsker] = useState(null);
  const [message, setMessage] = useState("");
  const [gamePhase, setGamePhase] = useState("deal");

  const dealCards = useCallback(() => {
    const deck = shuffleDeck(createDeck());
    setPlayerHand(deck.slice(0, 3));
    setAiHand(deck.slice(3, 6));
    setPlayerPlayed(null);
    setAiPlayed(null);
    setRoundWins([]);
    setStakes(1);
    setTrucoState("none");
    setTrucoAsker(null);
    setMessage("");
    setGamePhase("play");
  }, []);

  useEffect(() => {
    if (gamePhase === "deal") dealCards();
  }, [gamePhase, dealCards]);

  const playCard = useCallback((card) => {
    if (gamePhase !== "play" || playerPlayed) return;
    setPlayerPlayed(card);
    setPlayerHand((prev) => prev.filter((c) => c !== card));

    setTimeout(() => {
      setAiHand((prev) => {
        if (prev.length === 0) return prev;
        const sorted = [...prev].sort((a, b) => a.power - b.power);
        const beater = sorted.find((c) => c.power > card.power);
        const chosen = beater || sorted[0];
        setAiPlayed(chosen);
        return prev.filter((c) => c !== chosen);
      });
      setTimeout(() => setGamePhase("resolve"), 800);
    }, 600);
  }, [gamePhase, playerPlayed]);

  useEffect(() => {
    if (gamePhase !== "resolve" || !playerPlayed || !aiPlayed) return;

    let winner = "draw";
    if (playerPlayed.power > aiPlayed.power) winner = "player";
    else if (aiPlayed.power > playerPlayed.power) winner = "ai";

    const newWins = [...roundWins, winner];
    setRoundWins(newWins);

    const playerWins = newWins.filter((w) => w === "player").length;
    const aiWins = newWins.filter((w) => w === "ai").length;

    if (playerWins >= 2 || aiWins >= 2 || newWins.length >= 3) {
      setTimeout(() => {
        let handWinner;
        if (playerWins > aiWins) handWinner = "player";
        else if (aiWins > playerWins) handWinner = "ai";
        else handWinner = newWins[0] === "draw" ? "player" : newWins[0];

        if (handWinner === "player") {
          const newScore = playerScore + stakes;
          setPlayerScore(newScore);
          setMessage(`Voce ganhou ${stakes} ponto${stakes > 1 ? "s" : ""}!`);
          if (newScore >= 12) { setGamePhase("gameOver"); return; }
        } else {
          const newScore = aiScore + stakes;
          setAiScore(newScore);
          setMessage(`IA ganhou ${stakes} ponto${stakes > 1 ? "s" : ""}!`);
          if (newScore >= 12) { setGamePhase("gameOver"); return; }
        }
        setGamePhase("roundEnd");
      }, 1000);
    } else {
      setTimeout(() => {
        setPlayerPlayed(null);
        setAiPlayed(null);
        setGamePhase("play");
      }, 1000);
    }
  }, [gamePhase, playerPlayed, aiPlayed, roundWins, playerScore, aiScore, stakes]);

  const callTruco = useCallback(() => {
    if (trucoState !== "none") return;
    const nextStakes = stakes === 1 ? 3 : stakes === 3 ? 6 : stakes === 6 ? 9 : 12;
    setTrucoState("asked");
    setTrucoAsker("player");
    setMessage(stakes === 1 ? "TRUCO!" : stakes === 3 ? "SEIS!" : stakes === 6 ? "NOVE!" : "DOZE!");

    setTimeout(() => {
      if (Math.random() > 0.4) {
        setStakes(nextStakes);
        setTrucoState("accepted");
        setMessage("IA aceitou!");
        setTimeout(() => setMessage(""), 1500);
      } else {
        setPlayerScore((prev) => prev + stakes);
        setMessage("IA correu!");
        setGamePhase("roundEnd");
      }
    }, 1500);
  }, [stakes, trucoState]);

  const renderCard = (card, faceDown, small) => {
    if (!card) return null;
    const w = small ? 50 : 65;
    const h = small ? 72 : 95;

    if (faceDown) {
      return (
        <div style={{
          width: w, height: h, borderRadius: 6,
          background: "linear-gradient(135deg, #1a237e, #0d47a1)",
          border: "2px solid #fff",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            width: w - 12, height: h - 12, borderRadius: 4,
            border: "1px solid rgba(255,255,255,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="rgba(255,255,255,0.4)">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
        </div>
      );
    }

    return (
      <div style={{
        width: w, height: h, borderRadius: 6, background: "#fff",
        border: "2px solid #ddd", padding: 4,
        display: "flex", flexDirection: "column", position: "relative",
        boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
      }}>
        <div style={{ color: SUIT_COLORS[card.suit], fontSize: small ? 13 : 16, fontWeight: 800, lineHeight: 1 }}>
          {card.value}
        </div>
        <div style={{ color: SUIT_COLORS[card.suit], fontSize: small ? 10 : 12, lineHeight: 1 }}>
          {SUIT_SYMBOLS[card.suit]}
        </div>
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          color: SUIT_COLORS[card.suit], fontSize: small ? 22 : 28, opacity: 0.3,
        }}>
          {SUIT_SYMBOLS[card.suit]}
        </div>
      </div>
    );
  };

  const trucoLabel = stakes === 1 ? "TRUCO!" : stakes === 3 ? "SEIS!" : stakes === 6 ? "NOVE!" : stakes === 9 ? "DOZE!" : "";

  return (
    <div style={{
      width: "100%", height: "100%",
      background: "linear-gradient(180deg, #1a472a 0%, #2d5a3f 50%, #1a472a 100%)",
      display: "flex", flexDirection: "column", overflow: "hidden",
    }}>
      {/* Score header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "8px 16px", background: "rgba(0,0,0,0.3)", flexShrink: 0,
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ color: "#8BC34A", fontSize: 10, fontWeight: 600 }}>VOCE</div>
          <div style={{ color: "#fff", fontSize: 22, fontWeight: 800 }}>{playerScore}</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ color: "#FFD600", fontSize: 11, fontWeight: 700 }}>TRUCO</div>
          <div style={{ display: "flex", gap: 4, marginTop: 2 }}>
            {roundWins.map((w, i) => (
              <div key={i} style={{
                width: 10, height: 10, borderRadius: "50%",
                background: w === "player" ? "#8BC34A" : w === "ai" ? "#F44336" : "#FFD600",
              }} />
            ))}
            {Array.from({ length: 3 - roundWins.length }, (_, i) => (
              <div key={`e${i}`} style={{
                width: 10, height: 10, borderRadius: "50%",
                background: "rgba(255,255,255,0.2)",
              }} />
            ))}
          </div>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, marginTop: 2 }}>
            Vale: {stakes} pts
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ color: "#F44336", fontSize: 10, fontWeight: 600 }}>IA</div>
          <div style={{ color: "#fff", fontSize: 22, fontWeight: 800 }}>{aiScore}</div>
        </div>
      </div>

      {/* AI hand */}
      <div style={{
        display: "flex", justifyContent: "center", gap: 4,
        padding: "8px 0", flexShrink: 0,
      }}>
        {aiHand.map((_, i) => (
          <div key={i}>{renderCard({ value: "?", suit: "paus", power: 0 }, true, true)}</div>
        ))}
      </div>

      {/* Table center */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        position: "relative", minHeight: 0,
      }}>
        <div style={{
          position: "absolute", inset: 16,
          borderRadius: 20, border: "2px solid rgba(255,255,255,0.1)",
          background: "rgba(0,0,0,0.1)",
        }} />

        {message && (
          <div style={{
            position: "absolute", top: 8,
            padding: "6px 20px", borderRadius: 20,
            background: "rgba(0,0,0,0.7)",
            color: "#FFD600", fontSize: 16, fontWeight: 800,
            zIndex: 5,
          }}>
            {message}
          </div>
        )}

        <div style={{ marginBottom: 16, minHeight: 95, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
          {aiPlayed && renderCard(aiPlayed)}
        </div>

        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: "rgba(0,0,0,0.4)", border: "2px solid rgba(255,255,255,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontSize: 11, fontWeight: 800, zIndex: 2,
          marginBottom: 16,
        }}>
          VS
        </div>

        <div style={{ minHeight: 95, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
          {playerPlayed && renderCard(playerPlayed)}
        </div>
      </div>

      {/* Truco button */}
      {gamePhase === "play" && stakes < 12 && trucoState === "none" && (
        <div style={{
          display: "flex", justifyContent: "center", padding: "4px 0", flexShrink: 0,
        }}>
          <button onClick={callTruco} style={{
            padding: "8px 32px", borderRadius: 20,
            background: "linear-gradient(135deg, #F44336, #D32F2F)",
            border: "2px solid #FFCDD2",
            color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer",
            letterSpacing: 1,
          }}>
            {trucoLabel}
          </button>
        </div>
      )}

      {/* Player hand */}
      <div style={{
        display: "flex", justifyContent: "center", gap: 6,
        padding: "8px 16px 12px", flexShrink: 0,
      }}>
        {gamePhase === "play" && playerHand.map((card, i) => (
          <button
            key={i}
            onClick={() => playCard(card)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              padding: 0, transition: "transform 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-8px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            {renderCard(card)}
          </button>
        ))}
        {(gamePhase === "roundEnd" || gamePhase === "gameOver") && (
          <button onClick={() => {
            if (gamePhase === "gameOver") {
              setPlayerScore(0);
              setAiScore(0);
            }
            setGamePhase("deal");
          }} style={{
            padding: "12px 32px", borderRadius: 20,
            background: "linear-gradient(135deg, #FFD600, #FFA000)",
            border: "none", color: "#000", fontSize: 15, fontWeight: 800,
            cursor: "pointer",
          }}>
            {gamePhase === "gameOver" ? "Novo Jogo" : "Proxima Mao"}
          </button>
        )}
      </div>
    </div>
  );
}
