import { render, screen, fireEvent, act, waitFor, cleanup } from '@testing-library/react';
import { EditableValue } from '@/components/EditableValue';

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
      fireEvent.change(input, { target: { value: '75' } });
      fireEvent.blur(input);
    });
    
    expect(defaultProps.onChange).toHaveBeenCalledWith(75);
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
      fireEvent.change(input, { target: { value: '75' } });
      fireEvent.keyDown(input, { key: 'Enter' });
    });
    
    expect(defaultProps.onChange).toHaveBeenCalledWith(75);
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