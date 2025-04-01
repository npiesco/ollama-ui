// ollama-ui/src/__tests__/components/CreateModel.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { toast } from 'sonner';

import CreateModel from '@/app/create-model/page';
import { api } from '@/lib/api';

// Mock the api and toast
jest.mock('@/lib/api');
jest.mock('sonner');

describe('CreateModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form inputs', () => {
    render(<CreateModel />);
    expect(screen.getByPlaceholderText('Model name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Model file content')).toBeInTheDocument();
  });

  it('handles successful model creation', async () => {
    // Mock the createModel API call
    jest.mocked(api.createModel).mockResolvedValueOnce({} as Response);

    render(<CreateModel />);

    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText('Model name'), {
      target: { value: 'test-model' }
    });
    fireEvent.change(screen.getByPlaceholderText('Model file content'), {
      target: { value: 'FROM llama2' }
    });

    // Submit the form
    fireEvent.click(screen.getByText('Create Model'));

    await waitFor(() => {
      // Verify API was called with correct parameters
      expect(api.createModel).toHaveBeenCalledWith({
        name: 'test-model',
        modelfile: 'FROM llama2'
      });
      // Verify success toast was shown
      expect(toast.success).toHaveBeenCalledWith('Model created successfully');
    });
  });

  it('handles model creation error', async () => {
    // Mock the createModel API call to fail
    const error = new Error('Failed to create model');
    jest.mocked(api.createModel).mockRejectedValueOnce(error);

    render(<CreateModel />);

    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText('Model name'), {
      target: { value: 'test-model' }
    });
    fireEvent.change(screen.getByPlaceholderText('Model file content'), {
      target: { value: 'FROM llama2' }
    });

    // Submit the form
    fireEvent.click(screen.getByText('Create Model'));

    await waitFor(() => {
      // Verify error toast was shown
      expect(toast.error).toHaveBeenCalledWith('Failed to create model');
    });
  });
}); 