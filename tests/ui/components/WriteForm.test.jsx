import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WriteForm from '../../../src/features/ui/components/WriteForm';
import { LABELS } from '../../../src/features/ui/constants';
import { STATUSES } from '../../../src/features/oaf/oafConstants';

const { WRITE_FORM_LABELS } = LABELS;
// Helper functions to get elements
const getTextarea = () => screen.getByPlaceholderText(WRITE_FORM_LABELS.INPUT_PLACEHOLDER);
const getButton = () => screen.getByRole('button', { name: new RegExp(WRITE_FORM_LABELS.BUTTON_TEXT, 'i') });
const getResponseTextarea = () => document.getElementById(WRITE_FORM_LABELS.RESPONSE_ID);

// Mock useOaf hook
const mockOafWriteForm = jest.fn();

jest.mock('../../../src/features/oaf/useOaf', () => ({
  useOaf: jest.fn(() => ({
    oafWriteForm: mockOafWriteForm,
  })),
}));

describe('WriteForm', () => {
  beforeEach(() => {
    mockOafWriteForm.mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders input textarea, button, and response textarea', () => {
    render(<WriteForm />);

    expect(getTextarea()).toBeInTheDocument();
    expect(getButton()).toBeInTheDocument();
  });

  test('updates textarea value on change', () => {
    render(<WriteForm />);

    const testInput = '{"field1": "value1", "field2": "value2"}';
    fireEvent.change(getTextarea(), { target: { value: testInput } });

    expect(getTextarea().value).toBe(testInput);
  });

  test('calls oafWriteForm with parsed JSON and displays response', async () => {
    const mockMessage = 'Form data written successfully!';
    mockOafWriteForm.mockResolvedValue({ message: mockMessage });

    render(<WriteForm />);

    const testInput = '{"field1": "value1", "field2": "value2"}';
    fireEvent.change(getTextarea(), { target: { value: testInput } });
    fireEvent.click(getButton());

    await waitFor(() => {
      expect(mockOafWriteForm).toHaveBeenCalledWith({
        formMetaData: { field1: 'value1', field2: 'value2' },
      });
      expect(getResponseTextarea().value).toBe(mockMessage);
    });
  });

  test('handles JSON parsing error and displays error message', async () => {
    render(<WriteForm />);

    const invalidJson = '{invalid json}';
    fireEvent.change(getTextarea(), { target: { value: invalidJson } });
    fireEvent.click(getButton());

    await waitFor(() => {
      expect(mockOafWriteForm).not.toHaveBeenCalled();
      expect(getResponseTextarea().value).toContain('Invalid JSON:');
    });
  });

  test('handles empty input as invalid JSON', async () => {
    render(<WriteForm />);

    fireEvent.click(getButton());

    await waitFor(() => {
      expect(mockOafWriteForm).not.toHaveBeenCalled();
      expect(getResponseTextarea().value).toBe('Please enter data to write to the form');
    });
  });

  test('handles array as valid JSON input', async () => {
    const mockMessage = 'Array data written successfully';
    mockOafWriteForm.mockResolvedValue({ message: mockMessage });

    render(<WriteForm />);

    const arrayJson = '[{"id": 1, "name": "Item 1"}, {"id": 2, "name": "Item 2"}]';
    fireEvent.change(getTextarea(), { target: { value: arrayJson } });
    fireEvent.click(getButton());

    await waitFor(() => {
      expect(mockOafWriteForm).toHaveBeenCalledWith({
        formMetaData: [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' },
        ],
      });
      expect(getResponseTextarea().value).toBe(mockMessage);
    });
  });

  test('response textarea is readOnly', () => {
    render(<WriteForm />);

    expect(getResponseTextarea()).toHaveAttribute('readOnly');
  });

  test('input textarea has correct id', () => {
    render(<WriteForm />);

    expect(getTextarea()).toHaveAttribute('id', WRITE_FORM_LABELS.INPUT_ID);
  });

  test('button has correct id', () => {
    render(<WriteForm />);

    expect(getButton()).toHaveAttribute('id', WRITE_FORM_LABELS.BUTTON_ID);
  });

  test('response textarea has correct id', () => {
    render(<WriteForm />);

    expect(getResponseTextarea()).toHaveAttribute('id', WRITE_FORM_LABELS.RESPONSE_ID);
  });

  test('handles multiple successive form writes correctly', async () => {
    const firstMessage = 'First write response';
    const secondMessage = 'Second write response';

    render(<WriteForm />);

    // First form write
    mockOafWriteForm.mockResolvedValueOnce({ message: firstMessage });
    fireEvent.change(getTextarea(), { target: { value: '{"data": "first"}' } });
    fireEvent.click(getButton());

    await waitFor(() => {
      expect(getResponseTextarea().value).toBe(firstMessage);
    });

    // Second form write
    mockOafWriteForm.mockResolvedValueOnce({ message: secondMessage });
    fireEvent.change(getTextarea(), { target: { value: '{"data": "second"}' } });
    fireEvent.click(getButton());

    await waitFor(() => {
      expect(getResponseTextarea().value).toBe(secondMessage);
    });

    expect(mockOafWriteForm).toHaveBeenCalledTimes(2);
    expect(mockOafWriteForm).toHaveBeenNthCalledWith(1, { formMetaData: { data: 'first' } });
    expect(mockOafWriteForm).toHaveBeenNthCalledWith(2, { formMetaData: { data: 'second' } });
  });

  test('handles async error from oafWriteForm', async () => {
    const errorMessage = 'Error writing form data';
    mockOafWriteForm.mockResolvedValue({ status: 'failure', message: errorMessage });

    render(<WriteForm />);

    const testInput = '{"field": "value"}';
    fireEvent.change(getTextarea(), { target: { value: testInput } });
    fireEvent.click(getButton());

    await waitFor(() => {
      expect(mockOafWriteForm).toHaveBeenCalledWith({ formMetaData: { field: 'value' } });
      expect(getResponseTextarea().value).toBe(errorMessage);
    });
  });

  test('handles async error with error_data array and displays formatted message', async () => {
    const errorData = [
      { error_key: 'write_failed', error_attribute: 'field2' },
      { error_key: STATUSES.ERROR, error_message: 'Invalid value' },
    ];
    // Message format from oafUtils: `${error_key || ''} : ${error_attribute || error_message}` joined by newline
    const expectedMessage = 'write_failed : field2\n : Invalid value';
    mockOafWriteForm.mockResolvedValue({
      status: 'failure',
      message: expectedMessage,
      error_data: errorData,
    });

    render(<WriteForm />);

    fireEvent.change(getTextarea(), { target: { value: '{"field": "value"}' } });
    fireEvent.click(getButton());

    await waitFor(() => {
      expect(mockOafWriteForm).toHaveBeenCalledWith({ formMetaData: { field: 'value' } });
      expect(getResponseTextarea().value).toBe(expectedMessage);
    });
  });

  test('preserves response state after input changes', async () => {
    const mockMessage = 'Form write successful';
    mockOafWriteForm.mockResolvedValue({ message: mockMessage });

    render(<WriteForm />);

    // Perform form write
    const testInput = '{"field": "value"}';
    fireEvent.change(getTextarea(), { target: { value: testInput } });
    fireEvent.click(getButton());

    await waitFor(() => {
      expect(getResponseTextarea().value).toBe(mockMessage);
    });

    // Change input without clicking button
    fireEvent.change(getTextarea(), { target: { value: 'new input' } });

    // Response should remain unchanged
    expect(getResponseTextarea().value).toBe(mockMessage);
  });
});
