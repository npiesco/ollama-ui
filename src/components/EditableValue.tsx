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

  // Debug: Log initial props
  console.debug('[EditableValue] Initialized with:', { value, min, max, step });

  // Update editValue when value prop changes
  useEffect(() => {
    console.debug('[EditableValue] Value prop changed:', value);
    setEditValue(value.toString());
  }, [value]);

  const schema = z.number()
    .min(min)
    .max(max)
    .step(step);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      console.debug('[EditableValue] Entering edit mode, focusing input');
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleBlur = () => {
    console.debug('[EditableValue] Handling blur. Current editValue:', editValue);
    
    try {
      // Debug: Log the numeric conversion before validation
      const numericValue = Number(editValue);
      console.debug('[EditableValue] Converted to number:', { 
        raw: editValue,
        numeric: numericValue,
        isNaN: isNaN(numericValue)
      });

      const parsed = schema.parse(numericValue);
      console.debug('[EditableValue] Validation successful:', {
        input: numericValue,
        validated: parsed,
        constraints: { min, max, step }
      });

      onChange(parsed);
      setEditValue(parsed.toString());
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.debug('[EditableValue] Validation failed:', {
          error: error.errors,
          input: editValue,
          constraints: { min, max, step }
        });
      } else {
        console.error('[EditableValue] Unexpected error:', error);
      }
      setEditValue(value.toString());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    console.debug('[EditableValue] Key pressed:', {
      key: e.key,
      currentValue: editValue
    });

    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      console.debug('[EditableValue] Escaping edit mode, reverting to:', value);
      setIsEditing(false);
      setEditValue(value.toString());
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    console.debug('[EditableValue] Input changed:', {
      from: editValue,
      to: newValue
    });
    setEditValue(newValue);
  };

  if (isEditing) {
    return (
      <input
        className="w-16 text-sm text-right bg-transparent border rounded px-1"
        max={max}
        min={min}
        ref={inputRef}
        role="spinbutton"
        step={step}
        type="number"
        value={editValue}
        onBlur={handleBlur}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
    );
  }

  return (
    <button
      className="w-16 text-sm text-right border border-input rounded px-1 hover:bg-accent transition-colors"
      onClick={() => {
        console.debug('[EditableValue] Entering edit mode');
        setIsEditing(true);
      }}
    >
      {value}
    </button>
  );
} 