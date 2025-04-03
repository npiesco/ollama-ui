import { render, screen, waitFor, act, fireEvent, within } from '@testing-library/react'
import ModelsPage from '@/app/models/page'
import { toast } from 'sonner'

// Mock the sonner toast library
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}))

// Mock fetch with a simple implementation
global.fetch = jest.fn()

// Mock UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, variant, 'aria-label': ariaLabel, ...props }: any) => (
    <button data-variant={variant} aria-label={ariaLabel} {...props}>{children}</button>
  )
}))

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className, ...props }: any) => <div className={className} {...props}>{children}</div>,
  CardHeader: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardFooter: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardTitle: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardDescription: ({ children, ...props }: any) => <div {...props}>{children}</div>
}))

jest.mock('@/components/ui/label', () => ({
  Label: ({ children }: any) => <label>{children}</label>
}))

jest.mock('@/components/ui/switch', () => ({
  Switch: ({ checked, onCheckedChange }: any) => (
    <button role="switch" aria-checked={checked} onClick={() => onCheckedChange(!checked)} />
  )
}))

jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: any) => <div>{children}</div>,
  TabsList: ({ children }: any) => <div role="tablist">{children}</div>,
  TabsTrigger: ({ children }: any) => <button role="tab">{children}</button>,
  TabsContent: ({ children }: any) => <div role="tabpanel">{children}</div>
}))

jest.mock('@/components/ui/scroll-area', () => ({
  ScrollArea: ({ children }: any) => <div>{children}</div>
}))

jest.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className, ...props }: any) => <div data-testid="skeleton" className={className} {...props} />
}))

jest.mock('@/components/ui/alert', () => ({
  Alert: ({ children }: any) => <div role="alert">{children}</div>,
  AlertTitle: ({ children }: any) => <div>{children}</div>,
  AlertDescription: ({ children }: any) => <div>{children}</div>
}))

jest.mock('@/components/ui/separator', () => ({
  Separator: () => <hr />
}))

jest.mock('@/components/ui/textarea', () => ({
  Textarea: ({ value, onChange, ...props }: any) => (
    <textarea value={value} onChange={onChange} {...props} />
  )
}))

jest.mock('@/components/ui/select', () => ({
  Select: ({ children }: any) => <div>{children}</div>,
  SelectTrigger: ({ children }: any) => <button>{children}</button>,
  SelectValue: ({ children }: any) => <span>{children}</span>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => <div data-value={value}>{children}</div>
}))

// Mock the model download store
jest.mock('@/store/model-download', () => ({
  useModelDownload: jest.fn(() => ({
    isDownloading: false,
    currentModel: null,
    progress: 0,
    status: 'idle',
    startDownload: jest.fn(),
    updateProgress: jest.fn(),
    setError: jest.fn(),
    reset: jest.fn()
  }))
}))

jest.mock('lucide-react', () => ({
  CheckCircle2: () => <div data-testid="check-circle-icon" />,
  RefreshCw: () => <div data-testid="refresh-icon" />,
  Trash2: () => <div data-testid="trash2-icon" />,
  Download: () => <div data-testid="download-icon" />,
  Settings: () => <div data-testid="settings-icon" />,
  ChevronDown: () => <div data-testid="chevron-down-icon" />,
  ChevronUp: () => <div data-testid="chevron-up-icon" />,
  Loader2: () => <div data-testid="loader-icon" />,
  Copy: () => <div data-testid="copy-icon" />,
  Check: () => <div data-testid="check-icon" />,
  Upload: () => <div data-testid="upload-icon" />,
  ImageIcon: () => <div data-testid="image-icon" />,
  Maximize2: () => <div data-testid="maximize-icon" />,
  MessageSquare: () => <div data-testid="message-square-icon" />,
  Send: () => <div data-testid="send-icon" />,
  Image: () => <div data-testid="image-icon" />,
  X: () => <div data-testid="x-icon" />,
  Settings2: () => <div data-testid="settings2-icon" />,
  AlertCircle: () => <div data-testid="alert-circle-icon" />
}))

describe('ModelsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock fetch for /api/models and /api/models/library
    global.fetch = jest.fn().mockImplementation((url) => {
      if (url === '/api/models') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            models: [{ name: 'test-model:7b', installed: true }]
          })
        });
      }
      if (url === '/api/models/library') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            models: [{
              name: 'test-model',
              capabilities: ['chat'],
              parameterSizes: ['7b']
            }]
          })
        });
      }
      return Promise.reject(new Error('Not found'));
    });

    // Mock fetch responses
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url === '/api/models') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            models: [
              { name: 'test-model-1' },
              { name: 'test-model-2' }
            ]
          })
        });
      }
      if (url === '/api/models/library') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            models: [
              {
                name: 'test-model-1',
                capabilities: ['chat', 'tools'],
                description: 'Test model 1',
                parameterSizes: ['7b'],
                pullCount: 100,
                tagCount: 5,
                lastUpdated: '2024-03-20'
              },
              {
                name: 'test-model-2',
                capabilities: ['vision'],
                description: 'Test model 2',
                parameterSizes: ['13b'],
                pullCount: 50,
                tagCount: 3,
                lastUpdated: '2024-03-19'
              }
            ]
          })
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ status: 'success' })
      });
    });
  });

  it('renders loading state initially', () => {
    render(<ModelsPage />);
    expect(screen.getAllByTestId('skeleton')).toHaveLength(6);
  });

  it('fetches and displays models successfully', async () => {
    // Mock fetch responses
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url === '/api/models') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            models: [
              { name: 'test-model-1' },
              { name: 'test-model-2' }
            ]
          })
        });
      }
      if (url === '/api/models/library') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            models: [
              {
                name: 'test-model-1',
                capabilities: ['chat', 'tools'],
                description: 'Test model 1',
                parameterSizes: ['7b'],
                pullCount: 100,
                tagCount: 5,
                lastUpdated: '2024-03-20'
              },
              {
                name: 'test-model-2',
                capabilities: ['vision'],
                description: 'Test model 2',
                parameterSizes: ['13b'],
                pullCount: 50,
                tagCount: 3,
                lastUpdated: '2024-03-19'
              }
            ]
          })
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ status: 'success' })
      });
    });

    await act(async () => {
      render(<ModelsPage />);
    });

    // Wait for loading state to disappear
    await waitFor(() => {
      expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument();
    });

    // Verify models are displayed
    expect(screen.getByText('test-model-1')).toBeInTheDocument();
    expect(screen.getByText('test-model-2')).toBeInTheDocument();
    
    // Verify model details are displayed
    expect(screen.getByText('Test model 1')).toBeInTheDocument();
    expect(screen.getByText('Test model 2')).toBeInTheDocument();

    // Verify model capabilities are displayed
    expect(screen.getByText('chat')).toBeInTheDocument();
    expect(screen.getByText('tools')).toBeInTheDocument();
    expect(screen.getByText('vision')).toBeInTheDocument();

    // Verify model sizes are displayed
    expect(screen.getByText('7b')).toBeInTheDocument();
    expect(screen.getByText('13b')).toBeInTheDocument();

    // Verify model stats using more specific selectors
    const model1Stats = screen.getByText('👥 100');
    const model1Tags = screen.getByText('🏷️ 5');
    const model2Stats = screen.getByText('👥 50');
    const model2Tags = screen.getByText('🏷️ 3');

    expect(model1Stats).toBeInTheDocument();
    expect(model1Tags).toBeInTheDocument();
    expect(model2Stats).toBeInTheDocument();
    expect(model2Tags).toBeInTheDocument();
  });

  it('handles model installation status correctly', async () => {
    // Mock the fetch response for /api/models
    global.fetch = jest.fn().mockImplementation((url) => {
      if (url === '/api/models') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            models: [{
              name: 'test-model:7b',
              description: 'Test model description',
              capabilities: ['chat'],
              parameter_size: '7b',
              pull_count: 100,
              tag_count: 5
            }]
          })
        });
      }
      if (url === '/api/models/library') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            models: [{
              name: 'test-model',
              description: 'Test model description',
              capabilities: ['chat'],
              parameterSizes: ['7b'],
              pullCount: 100,
              tagCount: 5,
              lastUpdated: '2024-03-20'
            }]
          })
        });
      }
      return Promise.reject(new Error('Not found'));
    });

    render(<ModelsPage />);

    // Wait for the model to appear
    const modelCard = await screen.findByTestId('model-card-test-model:7b');
    expect(modelCard).toBeInTheDocument();

    // Log the model card structure
    console.log('[Test] Model card structure before deletion:', {
      fullContent: modelCard.textContent,
      children: Array.from(modelCard.children).map(child => ({
        tag: child.tagName,
        text: child.textContent,
        testid: child.getAttribute('data-testid'),
        className: child.className
      }))
    });

    // Find delete button by aria-label and variant
    const deleteButton = within(modelCard).getByRole('button', { name: 'Delete' });
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toHaveAttribute('data-variant', 'destructive');
    expect(within(deleteButton).getByTestId('trash2-icon')).toBeInTheDocument();
  });

  it('handles model deletion correctly', async () => {
    // Mock fetch to return a test model with parameter size
    global.fetch = jest.fn().mockImplementation((url) => {
      console.log('[Test] Fetch request to:', url);
      
      if (url === '/api/models') {
        const response = {
          models: [{
            name: 'test-model:7b',
            description: 'Test model description',
            capabilities: ['chat'],
            parameter_size: '7b',
            pull_count: 100,
            tag_count: 5
          }]
        };
        console.log('[Test] /api/models response:', JSON.stringify(response, null, 2));
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(response)
        });
      }
      if (url === '/api/models/library') {
        const response = {
          models: [{
            name: 'test-model',
            description: 'Test model description',
            capabilities: ['chat'],
            parameterSizes: ['7b'],
            pullCount: 100,
            tagCount: 5,
            lastUpdated: '2024-03-20'
          }]
        };
        console.log('[Test] /api/models/library response:', JSON.stringify(response, null, 2));
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(response)
        });
      }
      if (url === '/api/delete-model') {
        const response = { status: 'success' };
        console.log('[Test] /api/delete-model response:', response);
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(response)
        });
      }
      return Promise.reject(new Error('Not found'));
    });

    render(<ModelsPage />);

    // Log initial render state
    console.log('[Test] Initial document state:', {
      buttons: screen.queryAllByRole('button').map(b => ({
        text: b.textContent,
        role: b.getAttribute('role'),
        testid: b.getAttribute('data-testid')
      })),
      text: screen.queryAllByText(/.*/).map(t => t.textContent)
    });

    // Wait for models to load and log state
    await waitFor(() => {
      const modelElements = screen.queryAllByText(/test-model:7b/);
      console.log('[Test] Model elements found:', modelElements.map(el => ({
        text: el.textContent,
        parent: el.parentElement?.textContent,
        testid: el.getAttribute('data-testid')
      })));
      
      expect(screen.getByTestId('model-card-test-model:7b')).toBeInTheDocument();
    });

    // Log model card state before deletion
    const modelCard = screen.getByTestId('model-card-test-model:7b');
    console.log('[Test] Model card structure before deletion:', {
      fullContent: modelCard.textContent,
      children: Array.from(modelCard.children).map(child => ({
        tag: child.tagName,
        text: child.textContent,
        testid: child.getAttribute('data-testid'),
        className: child.className
      }))
    });

    // Find and click delete button
    const deleteButton = screen.getByRole('button', { name: 'Delete' });
    console.log('[Test] Delete button found:', {
      text: deleteButton.textContent,
      testid: deleteButton.getAttribute('data-testid'),
      ariaLabel: deleteButton.getAttribute('aria-label'),
      variant: deleteButton.getAttribute('data-variant')
    });

    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toHaveAttribute('data-variant', 'destructive');
    expect(within(deleteButton).getByTestId('trash2-icon')).toBeInTheDocument();
    
    // Log state before clicking delete button
    console.log('[Test] State before deletion:', {
      modelCardExists: screen.queryByTestId('model-card-test-model:7b') !== null,
      deleteButtonExists: deleteButton !== null,
      toastCalls: {
        success: (toast.success as jest.Mock).mock.calls,
        error: (toast.error as jest.Mock).mock.calls
      }
    });

    // Click delete button
    fireEvent.click(deleteButton);

    // Log state immediately after clicking delete
    console.log('[Test] State after clicking delete:', {
      modelCardExists: screen.queryByTestId('model-card-test-model:7b') !== null,
      deleteButtonExists: screen.queryByRole('button', { name: /delete/i }) !== null,
      toastCalls: {
        success: (toast.success as jest.Mock).mock.calls,
        error: (toast.error as jest.Mock).mock.calls
      }
    });

    // Verify success toast was called
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Model deleted successfully', {
        position: 'top-right',
        duration: 3000,
        dismissible: true
      });
    });

    // Log final state after deletion
    console.log('[Test] Final state after deletion:', {
      modelCardExists: screen.queryByTestId('model-card-test-model:7b') !== null,
      deleteButtonExists: screen.queryByRole('button', { name: /delete/i }) !== null,
      toastCalls: {
        success: (toast.success as jest.Mock).mock.calls,
        error: (toast.error as jest.Mock).mock.calls
      }
    });
  });

  it('handles model deletion errors correctly', async () => {
    // Mock fetch to return a test model with parameter size
    global.fetch = jest.fn().mockImplementation((url) => {
      console.log('[Test] Fetch request to:', url);
      
      if (url === '/api/models') {
        const response = {
          models: [{
            name: 'test-model:7b',
            description: 'Test model description',
            capabilities: ['chat'],
            parameter_size: '7b',
            pull_count: 100,
            tag_count: 5
          }]
        };
        console.log('[Test] /api/models response:', JSON.stringify(response, null, 2));
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(response)
        });
      }
      if (url === '/api/models/library') {
        const response = {
          models: [{
            name: 'test-model',
            description: 'Test model description',
            capabilities: ['chat'],
            parameterSizes: ['7b'],
            pullCount: 100,
            tagCount: 5,
            lastUpdated: '2024-03-20'
          }]
        };
        console.log('[Test] /api/models/library response:', JSON.stringify(response, null, 2));
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(response)
        });
      }
      if (url === '/api/delete-model') {
        console.log('[Test] /api/delete-model error response');
        return Promise.reject(new Error('Failed to delete model'));
      }
      return Promise.reject(new Error('Not found'));
    });

    render(<ModelsPage />);

    // Log initial render state
    console.log('[Test] Initial document state:', {
      buttons: screen.queryAllByRole('button').map(b => ({
        text: b.textContent,
        role: b.getAttribute('role'),
        testid: b.getAttribute('data-testid')
      })),
      text: screen.queryAllByText(/.*/).map(t => t.textContent)
    });

    // Wait for models to load and log state
    await waitFor(() => {
      const modelElements = screen.queryAllByText(/test-model:7b/);
      console.log('[Test] Model elements found:', modelElements.map(el => ({
        text: el.textContent,
        parent: el.parentElement?.textContent,
        testid: el.getAttribute('data-testid')
      })));
      
      expect(screen.getByTestId('model-card-test-model:7b')).toBeInTheDocument();
    });

    // Log model card state before deletion
    const modelCard = screen.getByTestId('model-card-test-model:7b');
    console.log('[Test] Model card structure before deletion:', {
      fullContent: modelCard.textContent,
      children: Array.from(modelCard.children).map(child => ({
        tag: child.tagName,
        text: child.textContent,
        testid: child.getAttribute('data-testid'),
        className: child.className
      }))
    });

    // Find and click delete button
    const deleteButton = screen.getByRole('button', { name: 'Delete' });
    console.log('[Test] Delete button found:', {
      text: deleteButton.textContent,
      testid: deleteButton.getAttribute('data-testid'),
      ariaLabel: deleteButton.getAttribute('aria-label'),
      variant: deleteButton.getAttribute('data-variant')
    });

    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toHaveAttribute('data-variant', 'destructive');
    expect(within(deleteButton).getByTestId('trash2-icon')).toBeInTheDocument();
    
    // Log state before clicking delete button
    console.log('[Test] State before deletion:', {
      modelCardExists: screen.queryByTestId('model-card-test-model:7b') !== null,
      deleteButtonExists: deleteButton !== null,
      toastCalls: {
        success: (toast.success as jest.Mock).mock.calls,
        error: (toast.error as jest.Mock).mock.calls
      }
    });

    // Click delete button
    fireEvent.click(deleteButton);

    // Log state immediately after clicking delete
    console.log('[Test] State after clicking delete:', {
      modelCardExists: screen.queryByTestId('model-card-test-model:7b') !== null,
      deleteButtonExists: screen.queryByRole('button', { name: /delete/i }) !== null,
      toastCalls: {
        success: (toast.success as jest.Mock).mock.calls,
        error: (toast.error as jest.Mock).mock.calls
      }
    });

    // Verify error toast was called
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to delete model', {
        position: 'top-right',
        duration: 3000,
        dismissible: true
      });
    });

    // Log final state after deletion attempt
    console.log('[Test] Final state after deletion attempt:', {
      modelCardExists: screen.queryByTestId('model-card-test-model:7b') !== null,
      deleteButtonExists: screen.queryByRole('button', { name: /delete/i }) !== null,
      toastCalls: {
        success: (toast.success as jest.Mock).mock.calls,
        error: (toast.error as jest.Mock).mock.calls
      }
    });
  });

  it('shows delete button for installed model', async () => {
    // Mock fetch responses
    global.fetch = jest.fn().mockImplementation((url) => {
      if (url === '/api/models') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            models: [{ name: 'test-model:7b', installed: true }]
          })
        });
      }
      if (url === '/api/models/library') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            models: [{
              name: 'test-model',
              capabilities: ['chat'],
              parameterSizes: ['7b']
            }]
          })
        });
      }
      return Promise.reject(new Error('Not found'));
    });

    render(<ModelsPage />);

    // Wait for the model card
    const modelCard = await screen.findByTestId('model-card-test-model:7b');
    expect(modelCard).toBeInTheDocument();

    // Find delete button by aria-label and variant
    const deleteButton = within(modelCard).getByRole('button', { name: 'Delete' });
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toHaveAttribute('data-variant', 'destructive');
    expect(within(deleteButton).getByTestId('trash2-icon')).toBeInTheDocument();
  });

  it('shows delete button', async () => {
    // Mock fetch responses
    global.fetch = jest.fn().mockImplementation((url) => {
      if (url === '/api/models') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            models: [{
              name: 'test-model:7b'
            }]
          })
        });
      }
      if (url === '/api/models/library') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            models: [{
              name: 'test-model',
              parameterSizes: ['7b']
            }]
          })
        });
      }
      return Promise.reject(new Error('Not found'));
    });

    render(<ModelsPage />);

    // Find delete button
    const deleteButton = await screen.findByRole('button', { name: 'Delete' });
    expect(deleteButton).toBeInTheDocument();
  });
});
