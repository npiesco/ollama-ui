import { render, screen, fireEvent } from '@testing-library/react';
import { MultimodalInput } from '../../components/MultimodalInput';

// Mock lucide-react
jest.mock('lucide-react', () => ({
  Trash2: () => <div data-testid="trash-icon">Trash2</div>
}));

// Mock next/image
jest.mock('next/image', () => {
  return function Image({ src, alt, fill, className, style, ...props }: any) {
    return (
      <img
        data-testid="next-image"
        src={src}
        alt={alt}
        className={className}
        style={{
          ...(fill ? {
            position: 'absolute',
            height: '100%',
            width: '100%',
            top: 0,
            left: 0,
            objectFit: 'contain'
          } : {}),
          ...style
        }}
        {...props}
      />
    );
  };
});

// Mock UI components
jest.mock('../../components/ui/button', () => ({
  Button: ({ children, onClick, variant }: any) => (
    <button onClick={onClick} data-variant={variant}>{children}</button>
  )
}));

jest.mock('../../components/ui/input', () => ({
  Input: ({ ...props }: any) => <input {...props} />
}));

describe('MultimodalInput', () => {
  const defaultProps = {
    onImageSelect: jest.fn(),
    imagePreview: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders upload button', () => {
    render(<MultimodalInput {...defaultProps} />);
    expect(screen.getByRole('button', { name: /upload image/i })).toBeInTheDocument();
  });

  it('renders file input', () => {
    render(<MultimodalInput {...defaultProps} />);
    const fileInput = screen.getByTestId('file-input');
    expect(fileInput).toHaveAttribute('type', 'file');
    expect(fileInput).toHaveAttribute('accept', 'image/*');
    expect(fileInput).toHaveClass('hidden');
  });

  it('opens file dialog when button is clicked', () => {
    render(<MultimodalInput {...defaultProps} />);
    const button = screen.getByRole('button', { name: /upload image/i });
    const fileInput = screen.getByTestId('file-input');
    
    // Mock click event
    fireEvent.click(button);
    
    // Verify file input was triggered
    expect(fileInput).toHaveAttribute('type', 'file');
  });

  it('handles file selection', () => {
    render(<MultimodalInput {...defaultProps} />);
    const fileInput = screen.getByTestId('file-input');
    
    // Create a mock file
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    
    // Simulate file selection
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    expect(defaultProps.onImageSelect).toHaveBeenCalledWith(file);
  });

  it('handles empty file selection', () => {
    render(<MultimodalInput {...defaultProps} />);
    const fileInput = screen.getByTestId('file-input');
    
    // Simulate empty file selection
    fireEvent.change(fileInput, { target: { files: [] } });
    
    expect(defaultProps.onImageSelect).not.toHaveBeenCalled();
  });

  it('displays image preview when provided', () => {
    const imagePreview = 'data:image/png;base64,test';
    render(<MultimodalInput {...defaultProps} imagePreview={imagePreview} />);
    
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', imagePreview);
    expect(image).toHaveAttribute('alt', 'Selected image');
  });

  it('does not display image preview when not provided', () => {
    render(<MultimodalInput {...defaultProps} />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('allows removing selected image', () => {
    const imagePreview = 'data:image/png;base64,test';
    render(<MultimodalInput {...defaultProps} imagePreview={imagePreview} />);
    
    const removeButton = screen.getByRole('button', { name: /remove/i });
    fireEvent.click(removeButton);
    
    expect(defaultProps.onImageSelect).toHaveBeenCalledWith(null);
  });
}); 