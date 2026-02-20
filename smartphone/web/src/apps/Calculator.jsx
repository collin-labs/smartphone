import { useState, useCallback } from "react";

// ============================================================
// Calculator App — Visual V0 pixel-perfect (iOS-style dark mode)
// Display + numpad + operadores coloridos | Zero backend
// ============================================================

export function CalculatorApp() {
  const [display, setDisplay] = useState("0");
  const [prevValue, setPrevValue] = useState(null);
  const [operator, setOperator] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [history, setHistory] = useState("");

  const inputDigit = useCallback((digit) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === "0" ? digit : display + digit);
    }
  }, [display, waitingForOperand]);

  const inputDecimal = useCallback(() => {
    if (waitingForOperand) {
      setDisplay("0.");
      setWaitingForOperand(false);
      return;
    }
    if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  }, [display, waitingForOperand]);

  const clear = useCallback(() => {
    setDisplay("0");
    setPrevValue(null);
    setOperator(null);
    setWaitingForOperand(false);
    setHistory("");
  }, []);

  const toggleSign = useCallback(() => {
    const val = parseFloat(display);
    setDisplay(String(val * -1));
  }, [display]);

  const percentage = useCallback(() => {
    const val = parseFloat(display);
    setDisplay(String(val / 100));
  }, [display]);

  const performOperation = useCallback((nextOperator) => {
    const inputValue = parseFloat(display);

    if (prevValue === null) {
      setPrevValue(inputValue);
      setHistory(`${inputValue} ${nextOperator}`);
    } else if (operator) {
      let result = prevValue;
      switch (operator) {
        case "+": result = prevValue + inputValue; break;
        case "-": result = prevValue - inputValue; break;
        case "x": result = prevValue * inputValue; break;
        case "/": result = inputValue !== 0 ? prevValue / inputValue : 0; break;
      }
      const formatted = parseFloat(result.toFixed(10));
      setDisplay(String(formatted));
      setPrevValue(formatted);
      setHistory(`${formatted} ${nextOperator}`);
    }
    setWaitingForOperand(true);
    setOperator(nextOperator);
  }, [display, operator, prevValue]);

  const calculate = useCallback(() => {
    if (operator === null || prevValue === null) return;
    const inputValue = parseFloat(display);
    let result = prevValue;
    switch (operator) {
      case "+": result = prevValue + inputValue; break;
      case "-": result = prevValue - inputValue; break;
      case "x": result = prevValue * inputValue; break;
      case "/": result = inputValue !== 0 ? prevValue / inputValue : 0; break;
    }
    const formatted = parseFloat(result.toFixed(10));
    setDisplay(String(formatted));
    setPrevValue(null);
    setOperator(null);
    setWaitingForOperand(true);
    setHistory("");
  }, [display, operator, prevValue]);

  const formatDisplay = (val) => {
    if (val.includes(".") && val.endsWith(".")) return val;
    const num = parseFloat(val);
    if (isNaN(num)) return "0";
    if (val.includes(".")) {
      const parts = val.split(".");
      return parseFloat(parts[0]).toLocaleString("pt-BR") + "," + parts[1];
    }
    if (Math.abs(num) > 999999999) return num.toExponential(4);
    return num.toLocaleString("pt-BR");
  };

  const displayFormatted = formatDisplay(display);
  const displaySize = displayFormatted.length > 9 ? 32 : displayFormatted.length > 6 ? 42 : 56;

  const buttonStyle = (bg, color, isWide) => ({
    width: isWide ? "calc(50% - 4px)" : "calc(25% - 6px)",
    aspectRatio: isWide ? "2.15/1" : "1/1",
    borderRadius: isWide ? 40 : "50%",
    background: bg,
    border: "none",
    color,
    fontSize: 28,
    fontWeight: 400,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: isWide ? "flex-start" : "center",
    paddingLeft: isWide ? 28 : 0,
  });

  return (
    <div style={{
      width: "100%", height: "100%", background: "#000",
      display: "flex", flexDirection: "column",
    }}>
      {/* Display */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        justifyContent: "flex-end", padding: "0 20px 8px",
      }}>
        {history && (
          <div style={{ color: "#666", fontSize: 16, textAlign: "right", marginBottom: 4 }}>
            {history}
          </div>
        )}
        <div style={{
          color: "#fff", fontSize: displaySize, fontWeight: 300,
          textAlign: "right", lineHeight: 1.1,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {displayFormatted}
        </div>
      </div>

      {/* Buttons */}
      <div style={{
        display: "flex", flexWrap: "wrap", gap: 8,
        padding: "8px 12px 20px",
      }}>
        {/* Row 1: AC, +/-, %, / */}
        <button onClick={clear} style={buttonStyle("#A5A5A5", "#000")}>
          {display === "0" && !prevValue ? "AC" : "C"}
        </button>
        <button onClick={toggleSign} style={buttonStyle("#A5A5A5", "#000")}>
          <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><line x1="12" y1="5" x2="12" y2="19"/><line x1="2" y1="22" x2="22" y2="2"/></svg>
        </button>
        <button onClick={percentage} style={buttonStyle("#A5A5A5", "#000")}>%</button>
        <button onClick={() => performOperation("/")} style={buttonStyle(operator === "/" && waitingForOperand ? "#fff" : "#FF9F0A", operator === "/" && waitingForOperand ? "#FF9F0A" : "#fff")}>
          <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><circle cx="12" cy="6" r="1.5" fill="currentColor"/><circle cx="12" cy="18" r="1.5" fill="currentColor"/></svg>
        </button>

        {/* Row 2: 7, 8, 9, x */}
        {["7", "8", "9"].map((d) => (
          <button key={d} onClick={() => inputDigit(d)} style={buttonStyle("#333333", "#fff")}>{d}</button>
        ))}
        <button onClick={() => performOperation("x")} style={buttonStyle(operator === "x" && waitingForOperand ? "#fff" : "#FF9F0A", operator === "x" && waitingForOperand ? "#FF9F0A" : "#fff")}>
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="6" y1="6" x2="18" y2="18"/><line x1="6" y1="18" x2="18" y2="6"/></svg>
        </button>

        {/* Row 3: 4, 5, 6, - */}
        {["4", "5", "6"].map((d) => (
          <button key={d} onClick={() => inputDigit(d)} style={buttonStyle("#333333", "#fff")}>{d}</button>
        ))}
        <button onClick={() => performOperation("-")} style={buttonStyle(operator === "-" && waitingForOperand ? "#fff" : "#FF9F0A", operator === "-" && waitingForOperand ? "#FF9F0A" : "#fff")}>
          <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>

        {/* Row 4: 1, 2, 3, + */}
        {["1", "2", "3"].map((d) => (
          <button key={d} onClick={() => inputDigit(d)} style={buttonStyle("#333333", "#fff")}>{d}</button>
        ))}
        <button onClick={() => performOperation("+")} style={buttonStyle(operator === "+" && waitingForOperand ? "#fff" : "#FF9F0A", operator === "+" && waitingForOperand ? "#FF9F0A" : "#fff")}>
          <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><line x1="12" y1="5" x2="12" y2="19"/></svg>
        </button>

        {/* Row 5: 0 (wide), ., = */}
        <button onClick={() => inputDigit("0")} style={buttonStyle("#333333", "#fff", true)}>0</button>
        <button onClick={inputDecimal} style={buttonStyle("#333333", "#fff")}>,</button>
        <button onClick={calculate} style={buttonStyle("#FF9F0A", "#fff")}>=</button>
      </div>
    </div>
  );
}
