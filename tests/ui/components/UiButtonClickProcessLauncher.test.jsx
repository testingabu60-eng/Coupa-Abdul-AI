import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UiButtonClickProcessLauncher from '../../../src/features/ui/components/UiButtonClickProcessLauncher';
import { ERROR_MESSAGES } from '../../../src/features/ui/constants/messages';
import EXAMPLES  from '../../../src/features/ui/constants/examples';
import { UI_BUTTON_CLICK_PROCESS_LABELS } from '../../../src/features/ui/constants/labels';

// Mock useOaf hook
const mockOafLaunchUiButtonClickProcess = jest.fn();

jest.mock('../../../src/features/oaf/useOaf', () => ({
  useOaf: jest.fn(() => ({
    oafLaunchUiButtonClickProcess: mockOafLaunchUiButtonClickProcess,
  })),
}));

describe('UiButtonClickProcessLauncher', () => {
  beforeEach(() => {
    mockOafLaunchUiButtonClickProcess.mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders all UI elements with correct attributes', () => {
    render(<UiButtonClickProcessLauncher />);
    const input = screen.getByPlaceholderText(UI_BUTTON_CLICK_PROCESS_LABELS.INPUT_PLACEHOLDER);
    const button = screen.getByRole('button', { name: UI_BUTTON_CLICK_PROCESS_LABELS.BUTTON_TEXT });
    const textarea = screen.getByPlaceholderText(UI_BUTTON_CLICK_PROCESS_LABELS.RESPONSE_PLACEHOLDER);

    expect(screen.getByRole('heading', { name: UI_BUTTON_CLICK_PROCESS_LABELS.HEADER })).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'number');
    expect(input).toHaveAttribute('min', '1');
    expect(input).toHaveAttribute('id', UI_BUTTON_CLICK_PROCESS_LABELS.INPUT_ID);
    expect(button).toHaveAttribute('id', UI_BUTTON_CLICK_PROCESS_LABELS.BUTTON_ID);
    expect(textarea).toHaveAttribute('readOnly');
    expect(textarea).toHaveAttribute('rows', '6');
    expect(textarea.value).toBe(EXAMPLES.UI_BUTTON_CLICK_PROCESS_EXAMPLES.DESCRIPTION);
  });

  test('updates input value on change', () => {
    render(<UiButtonClickProcessLauncher />);
    const input = screen.getByPlaceholderText(UI_BUTTON_CLICK_PROCESS_LABELS.INPUT_PLACEHOLDER);

    fireEvent.change(input, { target: { value: '123' } });

    expect(input.value).toBe('123');
  });

  test('successfully launches process with valid ID and displays response', async () => {
    const mockResponse = { success: true, processId: 42, status: 'launched' };
    mockOafLaunchUiButtonClickProcess.mockResolvedValue(mockResponse);

    render(<UiButtonClickProcessLauncher />);
    const input = screen.getByPlaceholderText(UI_BUTTON_CLICK_PROCESS_LABELS.INPUT_PLACEHOLDER);
    const button = screen.getByRole('button', { name: UI_BUTTON_CLICK_PROCESS_LABELS.BUTTON_TEXT });
    const textarea = screen.getByPlaceholderText(UI_BUTTON_CLICK_PROCESS_LABELS.RESPONSE_PLACEHOLDER);

    fireEvent.change(input, { target: { value: '42' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockOafLaunchUiButtonClickProcess).toHaveBeenCalledWith(42);
      expect(textarea.value).toBe(JSON.stringify(mockResponse, null, 2));
    });
  });

  test('displays rawResponse when available', async () => {
    const rawResponse = { data: 'raw response data' };
    const mockResponse = { rawResponse, otherData: 'ignored' };
    mockOafLaunchUiButtonClickProcess.mockResolvedValue(mockResponse);

    render(<UiButtonClickProcessLauncher />);
    const input = screen.getByPlaceholderText(UI_BUTTON_CLICK_PROCESS_LABELS.INPUT_PLACEHOLDER);
    const button = screen.getByRole('button', { name: UI_BUTTON_CLICK_PROCESS_LABELS.BUTTON_TEXT });
    const textarea = screen.getByPlaceholderText(UI_BUTTON_CLICK_PROCESS_LABELS.RESPONSE_PLACEHOLDER);

    fireEvent.change(input, { target: { value: '99' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(textarea.value).toBe(JSON.stringify(rawResponse, null, 2));
    });
  });

  test('validates invalid process IDs (empty, zero, negative, non-numeric)', async () => {
    render(<UiButtonClickProcessLauncher />);
    const input = screen.getByPlaceholderText(UI_BUTTON_CLICK_PROCESS_LABELS.INPUT_PLACEHOLDER);
    const button = screen.getByRole('button', { name: UI_BUTTON_CLICK_PROCESS_LABELS.BUTTON_TEXT });
    const textarea = screen.getByPlaceholderText(UI_BUTTON_CLICK_PROCESS_LABELS.RESPONSE_PLACEHOLDER);

    const invalidInputs = ['', '0', '-5', 'abc'];

    for (const value of invalidInputs) {
      mockOafLaunchUiButtonClickProcess.mockClear();
      fireEvent.change(input, { target: { value } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(textarea.value).toBe(ERROR_MESSAGES.INVALID_UI_BUTTON_CLICK_PROCESS_ID);
        expect(mockOafLaunchUiButtonClickProcess).not.toHaveBeenCalled();
      });
    }
  });

  test('handles errors with and without rawResponse', async () => {
    render(<UiButtonClickProcessLauncher />);
    const input = screen.getByPlaceholderText(UI_BUTTON_CLICK_PROCESS_LABELS.INPUT_PLACEHOLDER);
    const button = screen.getByRole('button', { name: UI_BUTTON_CLICK_PROCESS_LABELS.BUTTON_TEXT });
    const textarea = screen.getByPlaceholderText(UI_BUTTON_CLICK_PROCESS_LABELS.RESPONSE_PLACEHOLDER);

    // Error with rawResponse
    const rawError = { error: 'Process not found' };
    mockOafLaunchUiButtonClickProcess.mockRejectedValueOnce({ rawResponse: rawError });
    fireEvent.change(input, { target: { value: '999' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(textarea.value).toBe(JSON.stringify(rawError, null, 2));
    });

    // Error without rawResponse
    const mockError = { message: 'Network error' };
    mockOafLaunchUiButtonClickProcess.mockRejectedValueOnce(mockError);
    fireEvent.change(input, { target: { value: '100' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(textarea.value).toBe(JSON.stringify(mockError, null, 2));
    });
  });

  test('shows error when oafLaunchUiButtonClickProcess is not available', async () => {
    const { useOaf } = require('../../../src/features/oaf/useOaf');
    useOaf.mockReturnValue({
      oafLaunchUiButtonClickProcess: undefined,
    });

    render(<UiButtonClickProcessLauncher />);
    const input = screen.getByPlaceholderText(UI_BUTTON_CLICK_PROCESS_LABELS.INPUT_PLACEHOLDER);
    const button = screen.getByRole('button', { name: UI_BUTTON_CLICK_PROCESS_LABELS.BUTTON_TEXT });
    const textarea = screen.getByPlaceholderText(UI_BUTTON_CLICK_PROCESS_LABELS.RESPONSE_PLACEHOLDER);

    fireEvent.change(input, { target: { value: '1' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(textarea.value).toBe(ERROR_MESSAGES.UI_BUTTON_CLICK_PROCESS_NOT_AVAILABLE);
    });
  });
});
