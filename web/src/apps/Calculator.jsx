import { useState, useCallback } from "react";

export function CalculatorApp() {
  const [display, setDisplay] = useState("0");
  const [prev, setPrev] = useState(null);
  const [op, setOp] = useState(null);
  const [fresh, setFresh] = useState(true);

  const handleNumber = useCallback(
    (n) => {
      if (fresh) {
        setDisplay(n === "." ? "0." : n);
        setFresh(false);
      } else {
        if (n === "." && display.includes(".")) return;
        setDisplay((d) => (d === "0" && n !== "." ? n : d + n));
      }
    },
    [fresh, display]
  );

  const handleOp = useCallback(
    (nextOp) => {
      const current = parseFloat(display);
      if (prev !== null && op && !fresh) {
        let result = 0;
        switch (op) {
          case "+": result = prev + current; break;
          case "-": result = prev - current; break;
          case "×": result = prev * current; break;
          case "÷": result = current !== 0 ? prev / current : 0; break;
        }
        setDisplay(String(result));
        setPrev(result);
      } else {
        setPrev(current);
      }
      setOp(nextOp);
      setFresh(true);
    },
    [display, prev, op, fresh]
  );

  const handleEquals = useCallback(() => {
    if (prev === null || !op) return;
    const current = parseFloat(display);
    let result = 0;
    switch (op) {
      case "+": result = prev + current; break;
      case "-": result = prev - current; break;
      case "×": result = prev * current; break;
      case "÷": result = current !== 0 ? prev / current : 0; break;
    }
    setDisplay(String(result));
    setPrev(null);
    setOp(null);
    setFresh(true);
  }, [display, prev, op]);

  const handleClear = useCallback(() => {
    setDisplay("0");
    setPrev(null);
    setOp(null);
    setFresh(true);
  }, []);

  const handlePercent = useCallback(() => {
    setDisplay((d) => String(parseFloat(d) / 100));
  }, []);

  const handleToggleSign = useCallback(() => {
    setDisplay((d) => String(parseFloat(d) * -1));
  }, []);

  const formatDisplay = (val) => {
    const num = parseFloat(val);
    if (isNaN(num)) return "0";
    if (val.endsWith(".")) return val;
    if (val.includes(".") && val.endsWith("0") && !fresh) return val;
    if (Math.abs(num) >= 1e12) return num.toExponential(4);
    return num.toLocaleString("en", { maximumFractionDigits: 8 });
  };

  const buttons = [
    ["C", "±", "%", "÷"],
    ["7", "8", "9", "×"],
    ["4", "5", "6", "-"],
    ["1", "2", "3", "+"],
    ["0", ".", "="],
  ];

  const handlePress = (btn) => {
    if (btn === "C") handleClear();
    else if (btn === "±") handleToggleSign();
    else if (btn === "%") handlePercent();
    else if (btn === "=") handleEquals();
    else if (["+", "-", "×", "÷"].includes(btn)) handleOp(btn);
    else handleNumber(btn);
  };

  const getButtonStyle = (btn) => {
    if (["+", "-", "×", "÷", "="].includes(btn))
      return "bg-[#0A84FF] text-white text-[22px] font-medium active:bg-[#0A84FF]/70";
    if (["C", "±", "%"].includes(btn))
      return "bg-[#3a3a3c] text-white text-[17px] font-medium active:bg-[#4a4a4c]";
    return "bg-[#1c1c1e] text-white text-[22px] font-medium active:bg-[#2c2c2e] border border-white/[0.06]";
  };

  return (
    <div className="flex h-full flex-col bg-black px-3 pb-4 pt-2">
      {/* Display */}
      <div className="flex flex-1 items-end justify-end px-2 pb-3">
        <span
          className="text-right font-extralight tracking-tight text-white"
          style={{
            fontSize: display.length > 9 ? 36 : display.length > 6 ? 46 : 58,
            lineHeight: 1.1,
          }}
        >
          {formatDisplay(display)}
        </span>
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-[10px]">
        {buttons.map((row, ri) => (
          <div key={ri} className="flex gap-[10px]">
            {row.map((btn) => {
              const isZero = btn === "0";
              return (
                <button
                  key={btn}
                  onClick={() => handlePress(btn)}
                  className={`flex items-center justify-center rounded-full transition-colors ${getButtonStyle(btn)} ${
                    isZero ? "flex-[2.15]" : "flex-1"
                  }`}
                  style={{
                    height: 64,
                    paddingLeft: isZero ? 24 : undefined,
                    justifyContent: isZero ? "flex-start" : "center",
                  }}
                >
                  {btn}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
