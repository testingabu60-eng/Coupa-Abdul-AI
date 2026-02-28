import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EasyForm from '../../../src/features/ui/components/EasyForm';
import { LABELS, MESSAGES } from '../../../src/features/ui/constants';

const { EASY_FORM_LABELS } = LABELS;
const { ERROR_MESSAGES } = MESSAGES;

// Helper functions to get elements
const getInput = () => screen.getByPlaceholderText(EASY_FORM_LABELS.INPUT_PLACEHOLDER);
const getButton = () => screen.getByRole('button', { name: new RegExp(EASY_FORM_LABELS.BUTTON_TEXT, 'i') });
const getResponseTextarea = () => document.getElementById(EASY_FORM_LABELS.RESPONSE_ID);

// Mock useOaf hook
const mockOafOpenEasyForm = jest.fn();

jest.mock('../../../src/features/oaf/useOaf', () => ({
  useOaf: jest.fn(() => ({
    oafOpenEasyForm: mockOafOpenEasyForm,
  })),
}));

describe('EasyForm', () => {
  beforeEach(() => {
    mockOafOpenEasyForm.mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders input, button, and header', () => {
    render(<EasyForm />);

    expect(getInput()).toBeInTheDocument();
    expect(getButton()).toBeInTheDocument();
    expect(screen.getByText(EASY_FORM_LABELS.HEADER)).toBeInTheDocument();
  });

  test('updates input value on change', () => {
    render(<EasyForm />);

    fireEvent.change(getInput(), { target: { value: '123' } });

    expect(getInput().value).toBe('123');
  });

  test('calls oafOpenEasyForm with input value and displays response', async () => {
    mockOafOpenEasyForm.mockResolvedValue({ message: 'Form opened successfully!' });

    render(<EasyForm />);

    fireEvent.change(getInput(), { target: { value: '456' } });
    fireEvent.click(getButton());

    await waitFor(() => {
      expect(mockOafOpenEasyForm).toHaveBeenCalledWith('456');
      expect(getResponseTextarea()).toHaveValue('Form opened successfully!');
    });
  });

  test('textarea is readOnly', () => {
    render(<EasyForm />);

    expect(getResponseTextarea()).toHaveAttribute('readOnly');
  });

  test('input has correct id', () => {
    render(<EasyForm />);

    expect(getInput()).toHaveAttribute('id', EASY_FORM_LABELS.INPUT_ID);
  });

  test('button has correct id', () => {
    render(<EasyForm />);

    expect(getButton()).toHaveAttribute('id', EASY_FORM_LABELS.BUTTON_ID);
  });

  test('response textarea has correct id', () => {
    render(<EasyForm />);

    expect(getResponseTextarea()).toHaveAttribute('id', EASY_FORM_LABELS.RESPONSE_ID);
  });

  test('displays error message when input is empty', async () => {
    render(<EasyForm />);

    fireEvent.click(getButton());

    await waitFor(() => {
      expect(mockOafOpenEasyForm).not.toHaveBeenCalled();
      expect(getResponseTextarea()).toHaveValue(ERROR_MESSAGES.INVALID_EASY_FORM_ID);
    });
  });

  test('displays error message when input is zero', async () => {
    render(<EasyForm />);

    fireEvent.change(getInput(), { target: { value: '0' } });
    fireEvent.click(getButton());

    await waitFor(() => {
      expect(mockOafOpenEasyForm).not.toHaveBeenCalled();
      expect(getResponseTextarea()).toHaveValue(ERROR_MESSAGES.INVALID_EASY_FORM_ID);
    });
  });

  test('displays error message when input is negative', async () => {
    render(<EasyForm />);

    fireEvent.change(getInput(), { target: { value: '-5' } });
    fireEvent.click(getButton());

    await waitFor(() => {
      expect(mockOafOpenEasyForm).not.toHaveBeenCalled();
      expect(getResponseTextarea()).toHaveValue(ERROR_MESSAGES.INVALID_EASY_FORM_ID);
    });
  });

  test('handles error response from oafOpenEasyForm', async () => {
    const errorMessage = 'Easy Form not found';
    mockOafOpenEasyForm.mockResolvedValue({ message: errorMessage });

    render(<EasyForm />);

    fireEvent.change(getInput(), { target: { value: '999' } });
    fireEvent.click(getButton());

    await waitFor(() => {
      expect(mockOafOpenEasyForm).toHaveBeenCalledWith('999');
      expect(getResponseTextarea()).toHaveValue(errorMessage);
    });
  });

  test('preserves response state after input changes', async () => {
    const mockMessage = 'Form opened successfully';
    mockOafOpenEasyForm.mockResolvedValue({ message: mockMessage });

    render(<EasyForm />);

    fireEvent.change(getInput(), { target: { value: '123' } });
    fireEvent.click(getButton());

    await waitFor(() => {
      expect(getResponseTextarea()).toHaveValue(mockMessage);
    });

    // Change input without clicking button
    fireEvent.change(getInput(), { target: { value: '456' } });

    // Response should remain unchanged
    expect(getResponseTextarea()).toHaveValue(mockMessage);
  });
});
