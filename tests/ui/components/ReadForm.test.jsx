import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ReadForm from '../../../src/features/ui/components/ReadForm';
import { LABELS } from '../../../src/features/ui/constants';

const { READ_FORM_LABELS } = LABELS;

// Helper functions to get elements
const getTextarea = () => screen.getByPlaceholderText(READ_FORM_LABELS.INPUT_PLACEHOLDER);
const getButton = () => screen.getByRole('button', { name: new RegExp(READ_FORM_LABELS.BUTTON_TEXT, 'i') });
const getResponseTextarea = () => screen.getByPlaceholderText(new RegExp(READ_FORM_LABELS.RESPONSE_PLACEHOLDER, 'i'));

// Mock useOaf hook
const mockOafReadForm = jest.fn();

jest.mock('../../../src/features/oaf/useOaf', () => ({
  useOaf: jest.fn(() => ({
    oafReadForm: mockOafReadForm,
  })),
}));

describe('ReadForm', () => {
  beforeEach(() => {
    mockOafReadForm.mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders input textarea, button, and response textarea', () => {
    render(<ReadForm />);

    expect(getTextarea()).toBeInTheDocument();
    expect(getButton()).toBeInTheDocument();
    expect(getResponseTextarea()).toBeInTheDocument();
  });

  test('updates textarea value on change', () => {
    render(<ReadForm />);

    const testInput = '{"formMetaData": {"field1": "value1"}}';
    fireEvent.change(getTextarea(), { target: { value: testInput } });

    expect(getTextarea().value).toBe(testInput);
  });

  test('calls oafReadForm with parsed formMetaData and displays response', async () => {
    const mockData = { field1: 'data1', field2: 'data2' };
    mockOafReadForm.mockResolvedValue({ status: 'success', data: mockData });

    render(<ReadForm />);

    const testInput = '{"formMetaData": {"field1": "value1", "field2": "value2"}}';
    fireEvent.change(getTextarea(), { target: { value: testInput } });
    fireEvent.click(getButton());

    await waitFor(() => {
      expect(mockOafReadForm).toHaveBeenCalledWith({
        formMetaData: { field1: 'value1', field2: 'value2' },
      });
      expect(getResponseTextarea().value).toBe(JSON.stringify(mockData, null, 2));
    });
  });

  test('handles JSON parsing error and displays error message', async () => {
    render(<ReadForm />);

    const invalidJson = '{"formMetaData": invalid json}';
    fireEvent.change(getTextarea(), { target: { value: invalidJson } });
    fireEvent.click(getButton());

    await waitFor(() => {
      expect(mockOafReadForm).not.toHaveBeenCalled();
      expect(getResponseTextarea().value).toContain('Error parsing input:');
    });
  });

  test('handles empty input gracefully', async () => {
    render(<ReadForm />);

    fireEvent.click(getButton());

    await waitFor(() => {
      expect(mockOafReadForm).not.toHaveBeenCalled();
      expect(getResponseTextarea().value).toBe('Please enter Meta data to read from the form');
    });
  });

  test('handles complex formMetaData structure', async () => {
    const mockData = { field1: 'data1', field2: 'data2' };
    mockOafReadForm.mockResolvedValue({ status: 'success', data: mockData });

    render(<ReadForm />);

    const complexInput = JSON.stringify({
      formMetaData: {
        formId: '123',
        fields: ['field1', 'field2'],
        options: { includeMetadata: true },
      },
    });

    fireEvent.change(getTextarea(), { target: { value: complexInput } });
    fireEvent.click(getButton());

    await waitFor(() => {
      expect(mockOafReadForm).toHaveBeenCalledWith({
        formMetaData: {
          formId: '123',
          fields: ['field1', 'field2'],
          options: { includeMetadata: true },
        },
      });
      expect(getResponseTextarea().value).toBe(JSON.stringify(mockData, null, 2));
    });
  });

  test('response textarea is readOnly', () => {
    render(<ReadForm />);

    expect(getResponseTextarea()).toHaveAttribute('readOnly');
  });

  test('input textarea has correct id', () => {
    render(<ReadForm />);

    expect(getTextarea()).toHaveAttribute('id', READ_FORM_LABELS.INPUT_ID);
  });

  test('button has correct id', () => {
    render(<ReadForm />);

    expect(getButton()).toHaveAttribute('id', READ_FORM_LABELS.BUTTON_ID);
  });

  test('response textarea has correct id', () => {
    render(<ReadForm />);

    expect(getResponseTextarea()).toHaveAttribute('id', READ_FORM_LABELS.RESPONSE_ID);
  });

  test('handles async error from oafReadForm', async () => {
    const errorMessage = 'Error reading form data';
    mockOafReadForm.mockResolvedValue({ status: 'failure', message: errorMessage });

    render(<ReadForm />);

    fireEvent.change(getTextarea(), { target: { value: '{"formMetaData": {"invalidField": "value"}}' } });
    fireEvent.click(getButton());

    await waitFor(() => {
      expect(mockOafReadForm).toHaveBeenCalledWith({ formMetaData: { invalidField: 'value' } });
      expect(getResponseTextarea().value).toBe(errorMessage);
    });
  });

  test('handles async error with error_data array and displays formatted message', async () => {
    const errorData = [
      { error_key: 'validation_error', error_attribute: 'field1' },
      { error_key: 'required', error_message: 'Field is required' },
    ];
    // Message format from oafUtils: `${error_key || ''} : ${error_attribute || error_message}` joined by newline
    const expectedMessage = 'validation_error : field1\nrequired : Field is required';
    mockOafReadForm.mockResolvedValue({
      status: 'failure',
      message: expectedMessage,
      error_data: errorData,
    });

    render(<ReadForm />);

    fireEvent.change(getTextarea(), { target: { value: '{"formMetaData": {"field": "value"}}' } });
    fireEvent.click(getButton());

    await waitFor(() => {
      expect(mockOafReadForm).toHaveBeenCalledWith({ formMetaData: { field: 'value' } });
      expect(getResponseTextarea().value).toBe(expectedMessage);
    });
  });

  test('preserves response state after input changes', async () => {
    const mockData = { result: 'success' };
    mockOafReadForm.mockResolvedValue({ status: 'success', data: mockData });

    render(<ReadForm />);

    fireEvent.change(getTextarea(), { target: { value: '{"formMetaData": {"field": "value"}}' } });
    fireEvent.click(getButton());

    const expectedResponse = JSON.stringify(mockData, null, 2);
    await waitFor(() => {
      expect(getResponseTextarea().value).toBe(expectedResponse);
    });

    // Change input without clicking button
    fireEvent.change(getTextarea(), { target: { value: 'new input' } });

    // Response should remain unchanged
    expect(getResponseTextarea().value).toBe(expectedResponse);
  });
});
