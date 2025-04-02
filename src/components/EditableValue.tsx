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

  // Debug: Log initial props and state
  console.debug('[EditableValue] Component initialized:', {
    props: { value, min, max, step },
    state: { isEditing, editValue },
    type: {
      value: typeof value,
      editValue: typeof editValue,
      isEditing: typeof isEditing
    }
  });

  // Update editValue when value prop changes
  useEffect(() => {
    console.debug('[EditableValue] Value prop changed:', {
      previous: editValue,
      new: value,
      type: {
        previous: typeof editValue,
        new: typeof value
      }
    });
    setEditValue(value.toString());
  }, [value]);

  const schema = z.number()
    .min(min)
    .max(max)
    .step(step);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      console.debug('[EditableValue] Entering edit mode:', {
        previousState: { isEditing: false },
        newState: { isEditing: true },
        inputRef: {
          exists: !!inputRef.current,
          value: inputRef.current?.value,
          type: inputRef.current?.type
        }
      });
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleBlur = () => {
    console.debug('[EditableValue] Starting blur handling:', {
      currentState: {
        isEditing,
        editValue,
        editValueType: typeof editValue
      },
      constraints: { min, max, step }
    });
    
    try {
      // Debug: Log the numeric conversion process
      const numericValue = Number(editValue);
      console.debug('[EditableValue] Numeric conversion:', {
        input: {
          value: editValue,
          type: typeof editValue
        },
        output: {
          value: numericValue,
          type: typeof numericValue,
          isNaN: isNaN(numericValue),
          isFinite: isFinite(numericValue)
        }
      });

      if (isNaN(numericValue)) {
        throw new Error('Invalid number');
      }

      // Validate constraints before parsing
      if (numericValue < min || numericValue > max) {
        console.debug('[EditableValue] Value outside min/max range:', {
          value: numericValue,
          min,
          max
        });
        setEditValue(value.toString());
        setIsEditing(false);
        return;
      }

      if (step !== 0 && (numericValue % step !== 0)) {
        console.debug('[EditableValue] Value not multiple of step:', {
          value: numericValue,
          step
        });
        setEditValue(value.toString());
        setIsEditing(false);
        return;
      }

      // Debug: Log validation attempt
      console.debug('[EditableValue] Attempting validation:', {
        value: numericValue,
        constraints: { min, max, step },
        schema: {
          min: schema._def?.checks?.find(c => c.kind === 'min')?.value,
          max: schema._def?.checks?.find(c => c.kind === 'max')?.value,
          step: schema._def?.checks?.find(c => c.kind === 'multipleOf')?.value
        }
      });

      // If we get here, the value is valid
      console.debug('[EditableValue] Validation successful:', {
        input: {
          value: numericValue,
          type: typeof numericValue
        },
        output: {
          value: numericValue,
          type: typeof numericValue
        },
        constraints: { min, max, step }
      });

      // Debug: Log state updates
      console.debug('[EditableValue] Updating state:', {
        previous: {
          editValue,
          isEditing
        },
        new: {
          editValue: numericValue.toString(),
          isEditing: false
        }
      });

      setEditValue(numericValue.toString());
      setIsEditing(false);
      onChange(numericValue);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.debug('[EditableValue] Validation failed:', {
          error: {
            name: error.name,
            message: error.message,
            issues: error.issues.map(issue => ({
              code: issue.code,
              message: issue.message,
              path: issue.path
            }))
          },
          input: {
            value: editValue,
            type: typeof editValue,
            numeric: Number(editValue)
          },
          constraints: { min, max, step }
        });
      } else {
        console.error('[EditableValue] Unexpected error:', error);
      }
      setEditValue(value.toString());
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    console.debug('[EditableValue] Key event:', {
      key: e.key,
      currentState: {
        editValue,
        isEditing,
        inputValue: inputRef.current?.value
      }
    });

    if (e.key === 'Enter') {
      e.preventDefault();
      handleBlur();
    } else if (e.key === 'Escape') {
      console.debug('[EditableValue] Escaping edit mode:', {
        previous: {
          editValue,
          isEditing: true
        },
        new: {
          editValue: value.toString(),
          isEditing: false
        }
      });
      setIsEditing(false);
      setEditValue(value.toString());
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    console.debug('[EditableValue] Input change:', {
      previous: {
        value: editValue,
        type: typeof editValue
      },
      new: {
        value: newValue,
        type: typeof newValue
      },
      event: {
        target: {
          value: e.target.value,
          type: e.target.type,
          min: e.target.min,
          max: e.target.max,
          step: e.target.step
        }
      }
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
        console.debug('[EditableValue] Button click:', {
          previousState: {
            isEditing: false,
            editValue
          },
          newState: {
            isEditing: true,
            editValue
          }
        });
        setIsEditing(true);
      }}
    >
      {value}
    </button>
  );
} 