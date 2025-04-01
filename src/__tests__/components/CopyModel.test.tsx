// ollama-ui/src/__tests__/components/CopyModel.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { toast } from 'sonner';

import CopyModel from '@/app/copy-model/page';
import { api } from '@/lib/api';

// Mock the api and toast
jest.mock('@/lib/api');
jest.mock('sonner');

describe('CopyModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form inputs', () => {
    render(<CopyModel />);
    expect(screen.getByPlaceholderText('Source model')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Destination model')).toBeInTheDocument();
  });

  it('handles successful model copy', async () => {
    // Mock the copyModel API call
    jest.mocked(api.copyModel).mockResolvedValueOnce({} as Response);

    render(<CopyModel />);

    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText('Source model'), {
      target: { value: 'source-model' }
    });
    fireEvent.change(screen.getByPlaceholderText('Destination model'), {
      target: { value: 'destination-model' }
    });

    // Submit the form
    fireEvent.click(screen.getByText('Copy Model'));

    await waitFor(() => {
      // Verify API was called with correct parameters
      expect(api.copyModel).toHaveBeenCalledWith({
        source: 'source-model',
        destination: 'destination-model'
      });
      // Verify success toast was shown
      expect(toast.success).toHaveBeenCalledWith('Model copied successfully');
    });
  });

  it('handles model copy error', async () => {
    // Mock the copyModel API call to fail
    const error = new Error('Failed to copy model');
    jest.mocked(api.copyModel).mockRejectedValueOnce(error);

    render(<CopyModel />);

    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText('Source model'), {
      target: { value: 'source-model' }
    });
    fireEvent.change(screen.getByPlaceholderText('Destination model'), {
      target: { value: 'destination-model' }
    });

    // Submit the form
    fireEvent.click(screen.getByText('Copy Model'));

    await waitFor(() => {
      // Verify error toast was shown
      expect(toast.error).toHaveBeenCalledWith('Failed to copy model');
    });
  });
}); 