import { useEffect, useRef } from "react";

const LENGTH = 6;

/** Six single-digit boxes with paste, backspace and arrow-key support. */
export default function OtpInput({ value, onChange, disabled, autoFocus = true, onComplete }) {
  const refs = useRef([]);
  const digits = Array.from({ length: LENGTH }, (_, index) => value[index] || "");

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus();
  }, [autoFocus]);

  const emit = (next) => {
    const clean = next.slice(0, LENGTH);
    onChange(clean);
    if (clean.length === LENGTH && !clean.includes(" ")) onComplete?.(clean);
  };

  const update = (index, char) => {
    const next = digits.slice();
    next[index] = char;
    emit(next.join(""));
  };

  return (
    <div
      className="grid grid-cols-6 gap-2"
      onPaste={(event) => {
        const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, LENGTH);
        if (pasted) {
          event.preventDefault();
          emit(pasted);
          refs.current[Math.min(pasted.length, LENGTH - 1)]?.focus();
        }
      }}
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(node) => (refs.current[index] = node)}
          value={digit}
          disabled={disabled}
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          aria-label={`Digit ${index + 1}`}
          onChange={(event) => {
            const char = event.target.value.replace(/\D/g, "").slice(-1);
            update(index, char);
            if (char) refs.current[index + 1]?.focus();
          }}
          onKeyDown={(event) => {
            if (event.key === "Backspace" && !digits[index]) refs.current[index - 1]?.focus();
            if (event.key === "ArrowLeft") refs.current[index - 1]?.focus();
            if (event.key === "ArrowRight") refs.current[index + 1]?.focus();
          }}
          className="input h-12 w-full px-0 text-center text-lg font-bold"
        />
      ))}
    </div>
  );
}
