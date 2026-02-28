import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NavigatePath from '../../../src/features/ui/components/NavigatePath';
import { LABELS } from '../../../src/features/ui/constants';

const { NAVIGATE_TO_PATH_LABELS } = LABELS;

// Helper functions to get elements
const getInput = () => screen.getByPlaceholderText(NAVIGATE_TO_PATH_LABELS.INPUT_PLACEHOLDER);
const getButton = () => screen.getByRole('button', { name: new RegExp(NAVIGATE_TO_PATH_LABELS.BUTTON_TEXT, 'i') });
const getResponseTextarea = () => screen.getByPlaceholderText(new RegExp(NAVIGATE_TO_PATH_LABELS.RESPONSE_PLACEHOLDER, 'i'));

// Mock useOaf hook
const mockOafNavigatePath = jest.fn();

jest.mock('../../../src/features/oaf/useOaf', () => ({
  useOaf: jest.fn(() => ({
    oafNavigatePath: mockOafNavigatePath,
  })),
}));

describe('NavigatePath', () => {
  beforeEach(() => {
    mockOafNavigatePath.mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders title, input, button, and textarea', () => {
    render(<NavigatePath />);

    expect(screen.getByText(NAVIGATE_TO_PATH_LABELS.HEADER)).toBeInTheDocument();
    expect(getInput()).toBeInTheDocument();
    expect(getButton()).toBeInTheDocument();
    expect(getResponseTextarea()).toBeInTheDocument();
  });

  test('updates input value on change', () => {
    render(<NavigatePath />);

    fireEvent.change(getInput(), { target: { value: '/invoices' } });

    expect(getInput().value).toBe('/invoices');
  });

  test('calls oafNavigatePath with input value and displays response on button click', async () => {
    const mockMessage = 'Navigation successful!';
    mockOafNavigatePath.mockResolvedValue({ message: mockMessage });

    render(<NavigatePath />);

    fireEvent.change(getInput(), { target: { value: '/orders' } });
    fireEvent.click(getButton());

    await waitFor(() => {
      expect(mockOafNavigatePath).toHaveBeenCalledWith('/orders');
      expect(getResponseTextarea().value).toBe(mockMessage);
    });
  });

  test('does not call oafNavigatePath when input is empty', async () => {
    render(<NavigatePath />);

    fireEvent.click(getButton());

    await new Promise(resolve => setTimeout(resolve, 100));
    expect(mockOafNavigatePath).not.toHaveBeenCalled();
  });

  test('handles async navigation response correctly', async () => {
    const mockMessage = 'Page navigated successfully';
    mockOafNavigatePath.mockResolvedValue({ message: mockMessage });

    render(<NavigatePath />);

    fireEvent.change(getInput(), { target: { value: '/suppliers' } });
    fireEvent.click(getButton());

    await waitFor(() => {
      expect(mockOafNavigatePath).toHaveBeenCalledWith('/suppliers');
      expect(getResponseTextarea().value).toBe(mockMessage);
    });
  });

  test('handles navigation error response', async () => {
    const mockError = 'Navigation failed: Invalid path';
    mockOafNavigatePath.mockResolvedValue({ message: mockError });

    render(<NavigatePath />);

    fireEvent.change(getInput(), { target: { value: '/invalid-path' } });
    fireEvent.click(getButton());

    await waitFor(() => {
      expect(mockOafNavigatePath).toHaveBeenCalledWith('/invalid-path');
      expect(getResponseTextarea().value).toBe(mockError);
    });
  });

  test('textarea is readOnly', () => {
    render(<NavigatePath />);

    expect(getResponseTextarea()).toHaveAttribute('readOnly');
  });

  test('elements have correct ids', () => {
    render(<NavigatePath />);

    expect(getButton()).toHaveAttribute('id', NAVIGATE_TO_PATH_LABELS.BUTTON_ID);
    expect(getResponseTextarea()).toHaveAttribute('id', NAVIGATE_TO_PATH_LABELS.RESPONSE_ID);
  });

  test('clears response when new navigation is initiated', async () => {
    const firstResponse = 'First navigation response';
    const secondResponse = 'Second navigation response';

    render(<NavigatePath />);

    // First navigation
    mockOafNavigatePath.mockResolvedValueOnce({ message: firstResponse });
    fireEvent.change(getInput(), { target: { value: '/first-path' } });
    fireEvent.click(getButton());

    await waitFor(() => {
      expect(getResponseTextarea().value).toBe(firstResponse);
    });

    // Second navigation
    mockOafNavigatePath.mockResolvedValueOnce({ message: secondResponse });
    fireEvent.change(getInput(), { target: { value: '/second-path' } });
    fireEvent.click(getButton());

    await waitFor(() => {
      expect(getResponseTextarea().value).toBe(secondResponse);
    });
  });
});
