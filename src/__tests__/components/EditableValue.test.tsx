import { render, screen, fireEvent, act, waitFor, cleanup } from '@testing-library/react';
import { EditableValue } from '@/components/EditableValue';
import { z } from 'zod';

// Mock zod
jest.mock('zod', () => {
  class ZodError extends Error {
    issues: Array<{ code: string; message: string; path: string[] }>;
    name: string;

    constructor(issues: Array<{ code: string; message: string; path: string[] }>) {
      super('Validation error');
      this.name = 'ZodError';
      this.issues = issues;
    }
  }

  const mockNumber = () => {
    const schema = {
      min: jest.fn().mockReturnThis(),
      max: jest.fn().mockReturnThis(),
      step: jest.fn().mockReturnThis(),
      parse: jest.fn().mockImplementation((value) => {
        const numValue = Number(value);
        if (value === 75) {
          throw new Error('Unexpected error');
        }
        if (numValue < 0 || numValue > 100) {
          throw new ZodError([{
            code: 'custom',
            message: 'Number must be between 0 and 100',
            path: []
          }]);
        }
        if (schema._def.step && numValue % schema._def.step !== 0) {
          throw new ZodError([{
            code: 'custom',
            message: `Number must be a multiple of ${schema._def.step}`,
            path: []
          }]);
        }
        return numValue;
      }),
      _def: {
        checks: [
          { kind: 'min', value: 0 },
          { kind: 'max', value: 100 },
          { kind: 'multipleOf', value: 1 }
        ],
        step: 1
      }
    };

    schema.min = jest.fn().mockImplementation((min) => {
      schema._def.checks[0].value = min;
      return schema;
    });

    schema.max = jest.fn().mockImplementation((max) => {
      schema._def.checks[1].value = max;
      return schema;
    });

    schema.step = jest.fn().mockImplementation((step) => {
      schema._def.checks[2].value = step;
      schema._def.step = step;
      return schema;
    });

    return schema;
  };

  return {
    z: {
      number: mockNumber,
      ZodError
    }
  };
});

describe('EditableValue', () => {
  const defaultProps = {
    value: 50,
    min: 0,
    max: 100,
    step: 1,
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders initial value correctly', () => {
    render(<EditableValue {...defaultProps} />);
    expect(screen.getByRole('button')).toHaveTextContent('50');
  });

  it('enters edit mode when clicked', () => {
    render(<EditableValue {...defaultProps} />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('spinbutton')).toBeInTheDocument();
  });

  it('updates value on blur with valid input', async () => {
    render(<EditableValue {...defaultProps} />);
    
    // Enter edit mode
    fireEvent.click(screen.getByRole('button'));
    
    // Change value
    const input = screen.getByRole('spinbutton');
    await act(async () => {
      fireEvent.change(input, { target: { value: '60' } });
      fireEvent.blur(input);
    });
    
    expect(defaultProps.onChange).toHaveBeenCalledWith(60);
  });

  it('reverts to original value on blur with invalid input', async () => {
    render(<EditableValue {...defaultProps} />);
    
    // Enter edit mode
    fireEvent.click(screen.getByRole('button'));
    
    // Change value to invalid number
    const input = screen.getByRole('spinbutton');
    await act(async () => {
      fireEvent.change(input, { target: { value: '150' } });
      fireEvent.blur(input);
    });
    
    expect(defaultProps.onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('button')).toHaveTextContent('50');
  });

  it('handles Enter key correctly', async () => {
    render(<EditableValue {...defaultProps} />);
    
    // Enter edit mode
    fireEvent.click(screen.getByRole('button'));
    
    // Change value
    const input = screen.getByRole('spinbutton');
    await act(async () => {
      fireEvent.change(input, { target: { value: '65' } });
      fireEvent.keyDown(input, { key: 'Enter' });
    });
    
    expect(defaultProps.onChange).toHaveBeenCalledWith(65);
  });

  it('handles Escape key correctly', async () => {
    render(<EditableValue {...defaultProps} />);
    
    // Enter edit mode
    fireEvent.click(screen.getByRole('button'));
    
    // Change value
    const input = screen.getByRole('spinbutton');
    await act(async () => {
      fireEvent.change(input, { target: { value: '75' } });
      fireEvent.keyDown(input, { key: 'Escape' });
    });
    
    expect(defaultProps.onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('button')).toHaveTextContent('50');
  });

  it('respects min and max constraints', async () => {
    render(<EditableValue {...defaultProps} min={10} max={90} />);
    
    // Enter edit mode
    fireEvent.click(screen.getByRole('button'));
    
    // Try to set value below min
    const input = await screen.findByRole('spinbutton');
    await act(async () => {
      fireEvent.change(input, { target: { value: '5' } });
      fireEvent.blur(input);
    });
    
    expect(defaultProps.onChange).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByRole('button')).toHaveTextContent('50');
    });
    
    // Try to set value above max
    fireEvent.click(screen.getByRole('button'));
    const maxInput = await screen.findByRole('spinbutton');
    await act(async () => {
      fireEvent.change(maxInput, { target: { value: '95' } });
      fireEvent.blur(maxInput);
    });
    
    expect(defaultProps.onChange).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByRole('button')).toHaveTextContent('50');
    });
  });

  it('respects step constraint', async () => {
    const onChange = jest.fn();
    const { unmount } = render(<EditableValue {...defaultProps} step={5} onChange={onChange} />);
    
    // Enter edit mode
    fireEvent.click(screen.getByRole('button'));
    
    // Try to set value not divisible by step
    const input = await screen.findByRole('spinbutton');
    await act(async () => {
      fireEvent.change(input, { target: { value: '52' } });
      fireEvent.blur(input);
    });
    
    expect(onChange).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByRole('button')).toHaveTextContent('50');
    });
    
    // Set valid value
    fireEvent.click(screen.getByRole('button'));
    const stepInput = await screen.findByRole('spinbutton');
    await act(async () => {
      fireEvent.change(stepInput, { target: { value: '55' } });
      fireEvent.blur(stepInput);
    });
    
    expect(onChange).toHaveBeenCalledWith(55);
    
    // Clean up first render
    unmount();
    
    // Re-render with new value
    await act(async () => {
      render(<EditableValue {...defaultProps} step={5} value={55} onChange={onChange} />);
    });
    
    await waitFor(() => {
      expect(screen.getByRole('button')).toHaveTextContent('55');
    }, { timeout: 1000 });
  });
}); 