import { useState, useRef, useEffect } from 'react';
import { z } from 'zod';

interface EditableValueProps {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}

export function EditableValue({ value, min, max, step, onChange }: EditableValueProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  const schema = z.number()
    .min(min)
    .max(max)
    .step(step);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleBlur = () => {
    try {
      const parsed = schema.parse(Number(editValue));
      onChange(parsed);
      setEditValue(parsed.toString());
    } catch (error) {
      console.error('Validation error:', error);
      setEditValue(value.toString());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(value.toString());
    }
  };

  if (isEditing) {
    return (
      <input
        className="w-16 text-sm text-right bg-transparent border rounded px-1"
        max={max}
        min={min}
        ref={inputRef}
        step={step}
        type="number"
        value={editValue}
        onBlur={handleBlur}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    );
  }

  return (
    <button
      className="w-16 text-sm text-right border border-input rounded px-1 hover:bg-accent transition-colors"
      onClick={() => setIsEditing(true)}
    >
      {value}
    </button>
  );
} 