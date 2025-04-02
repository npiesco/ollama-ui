import { render, screen, fireEvent } from '@testing-library/react';
import { MultimodalInput } from '../../components/MultimodalInput';

// Mock UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, className, disabled, variant, size }: any) => (
    <button onClick={onClick} className={className} disabled={disabled} data-variant={variant} data-size={size}>
      {children}
    </button>
  )
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ type, onChange, className, disabled, ref }: any) => (
    <input type={type} onChange={onChange} className={className} disabled={disabled} ref={ref} />
  )
}));

jest.mock('@/components/ui/context-menu', () => ({
  ContextMenu: ({ children }: any) => <div>{children}</div>,
  ContextMenuTrigger: ({ children }: any) => <div>{children}</div>,
  ContextMenuContent: ({ children }: any) => <div>{children}</div>,
  ContextMenuItem: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>{children}</button>
  )
}));

jest.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: any) => <div>{children}</div>,
  TooltipTrigger: ({ children, asChild }: any) => <div>{children}</div>,
  TooltipContent: ({ children }: any) => <div>{children}</div>,
  TooltipProvider: ({ children }: any) => <div>{children}</div>
}));

// Mock next/image since it's required for the component
jest.mock('next/image', () => {
  return function Image({ src, alt, ...props }: any) {
    return <img src={src} alt={alt} {...props} />;
  };
});

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ImageIcon: () => <div data-testid="image-icon" />,
  Upload: () => <div data-testid="upload-icon" />,
  X: () => <div data-testid="x-icon" />
}));

describe('MultimodalInput', () => {
  const mockOnImageSelect = jest.fn();

  beforeEach(() => {
    mockOnImageSelect.mockClear();
  });

  it('handles file selection', () => {
    const { container } = render(
      <MultimodalInput 
        onImageSelect={mockOnImageSelect}
        imagePreview={null}
        images={[]}
      />
    );
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const input = container.querySelector('input[type="file"]');
    expect(input).toBeInTheDocument();
    
    if (input) {
      fireEvent.change(input, { target: { files: [file] } });
      expect(mockOnImageSelect).toHaveBeenCalledWith(file);
    }
  });

  it('handles empty file selection', () => {
    const { container } = render(
      <MultimodalInput 
        onImageSelect={mockOnImageSelect}
        imagePreview={null}
        images={[]}
      />
    );
    const input = container.querySelector('input[type="file"]');
    expect(input).toBeInTheDocument();
    
    if (input) {
      fireEvent.change(input, { target: { files: [] } });
      expect(mockOnImageSelect).not.toHaveBeenCalled();
    }
  });

  it('displays correct number of images', () => {
    const testImages = [
      'data:image/png;base64,test1',
      'data:image/png;base64,test2'
    ];
    const { container } = render(
      <MultimodalInput 
        onImageSelect={mockOnImageSelect}
        imagePreview={null}
        images={testImages}
      />
    );
    const images = container.querySelectorAll('img');
    expect(images).toHaveLength(2);
  });

  it('allows removing images', () => {
    const testImage = 'data:image/png;base64,test';
    const { container } = render(
      <MultimodalInput 
        onImageSelect={mockOnImageSelect}
        imagePreview={testImage}
        images={[testImage]}
      />
    );
    const removeButton = container.querySelector('button[data-variant="destructive"][data-size="icon"]');
    expect(removeButton).toBeInTheDocument();
    if (removeButton) {
      fireEvent.click(removeButton);
      expect(mockOnImageSelect).toHaveBeenCalledWith(null, 0);
    }
  });

  it('enforces maximum image limit', () => {
    const testImage = 'data:image/png;base64,test';
    const maxImages = 4;
    const { container } = render(
      <MultimodalInput 
        onImageSelect={mockOnImageSelect}
        imagePreview={testImage}
        images={Array(maxImages).fill(testImage)}
        maxImages={maxImages}
      />
    );
    const input = container.querySelector('input[type="file"]');
    expect(input).toBeDisabled();
  });

  it('handles drag and drop', () => {
    const { container } = render(
      <MultimodalInput 
        onImageSelect={mockOnImageSelect}
        imagePreview={null}
        images={[]}
      />
    );
    
    const dropZone = container.querySelector('div[class*="relative"]');
    expect(dropZone).toBeInTheDocument();
    
    if (dropZone) {
      const file = new File(['test'], 'test.png', { type: 'image/png' });
      const dataTransfer = {
        files: [file],
        items: [{ kind: 'file', type: 'image/png', getAsFile: () => file }]
      };

      fireEvent.dragOver(dropZone, {
        dataTransfer
      });
      
      fireEvent.drop(dropZone, {
        dataTransfer
      });
      
      expect(mockOnImageSelect).toHaveBeenCalledWith(file);
    }
  });

  it('handles paste events', () => {
    render(
      <MultimodalInput 
        onImageSelect={mockOnImageSelect}
        imagePreview={null}
        images={[]}
      />
    );

    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const clipboardData = {
      items: [{ kind: 'file', type: 'image/png', getAsFile: () => file }]
    };

    fireEvent.paste(document, { clipboardData });
    expect(mockOnImageSelect).toHaveBeenCalledWith(file);
  });
}); 