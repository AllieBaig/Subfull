import React, { useState, useEffect, useRef } from 'react';

interface NumericKeypadInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'onBlur' | 'value'> {
  value: number;
  min?: number;
  max?: number;
  onCommit: (value: number) => void;
  className?: string;
  allowFloat?: boolean;
}

export const NumericKeypadInput: React.FC<NumericKeypadInputProps> = ({ 
  value, 
  min = 1, 
  max = 1900, 
  onCommit, 
  className,
  allowFloat = false,
  ...props 
}) => {
  // Use a local string state for immediate visual feedback
  const [localValue, setLocalValue] = useState(value.toString());
  const inputRef = useRef<HTMLInputElement>(null);
  const isTyping = useRef(false);

  // Sync with external value only when not typing
  useEffect(() => {
    if (!isTyping.current) {
      setLocalValue(value.toString());
    }
  }, [value]);

  const commitValue = () => {
    isTyping.current = false;
    let num = allowFloat ? parseFloat(localValue) : parseInt(localValue, 10);
    if (isNaN(num)) num = min;
    
    const clamped = Math.max(min, Math.min(max, num));
    setLocalValue(clamped.toString());
    onCommit(clamped);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
      commitValue();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    isTyping.current = true;
    let val = e.target.value;
    
    if (allowFloat) {
      val = val.replace(/[^0-9.]/g, '');
      const parts = val.split('.');
      if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
    } else {
      val = val.replace(/[^0-9]/g, '');
    }

    setLocalValue(val);
    // DO NOT commit here to prevent parent re-renders while typing
  };

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      enterKeyHint="done"
      pattern={allowFloat ? "[0-9.]*" : "[0-9]*"}
      autoComplete="off"
      autoCorrect="off"
      spellCheck="false"
      value={localValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onBlur={commitValue}
      onFocus={(e) => {
        isTyping.current = true;
        e.currentTarget.select();
      }}
      className={className}
      {...props}
    />
  );
};
