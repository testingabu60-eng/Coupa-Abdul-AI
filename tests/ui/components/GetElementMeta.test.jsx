import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import GetElementMeta from '../../../src/features/ui/components/GetElementMeta';
import { LABELS } from '../../../src/features/ui/constants';

const { GET_ELEMENT_META_LABELS } = LABELS;

// Helper functions to get elements
const getTextarea = () => screen.getByPlaceholderText(GET_ELEMENT_META_LABELS.INPUT_PLACEHOLDER);
const getButton = () => screen.getByRole('button', { name: new RegExp(GET_ELEMENT_META_LABELS.BUTTON_TEXT, 'i') });
const getResponseTextarea = () => screen.getByPlaceholderText(new RegExp(GET_ELEMENT_META_LABELS.RESPONSE_PLACEHOLDER, 'i'));

// Mock useOaf hook
const mockOafGetElementMeta = jest.fn();
const mockOafAppEvents = {
  on: jest.fn(),
  off: jest.fn(),
};

jest.mock('../../../src/features/oaf/useOaf', () => ({
  useOaf: jest.fn(() => ({
    oafGetElementMeta: mockOafGetElementMeta,
    oafAppEvents: mockOafAppEvents,
  })),
}));

describe('GetElementMeta', () => {
  beforeEach(() => {
    mockOafGetElementMeta.mockReset();
    mockOafAppEvents.on.mockReset();
    mockOafAppEvents.off.mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders title, input textarea, button, and response textarea', () => {
    render(<GetElementMeta />);

    expect(screen.getByText(GET_ELEMENT_META_LABELS.HEADER)).toBeInTheDocument();
    expect(getTextarea()).toBeInTheDocument();
    expect(getButton()).toBeInTheDocument();
    expect(getResponseTextarea()).toBeInTheDocument();
  });

  test('updates textarea value on change', () => {
    render(<GetElementMeta />);

    const testInput = '{"formLocation": "test_form", "formId": "123"}';
    fireEvent.change(getTextarea(), { target: { value: testInput } });

    expect(getTextarea().value).toBe(testInput);
  });

  test('calls oafGetElementMeta with parsed JSON and displays response', async () => {
    const mockRawResponse = {
      formId: '123',
      fields: [{ id: 'field1', type: 'text' }],
    };
    mockOafGetElementMeta.mockResolvedValue({
      status: 'success',
      rawResponse: mockRawResponse,
    });

    render(<GetElementMeta />);

    const testInput = '{"formLocation": "supplier_form", "formId": "123"}';
    fireEvent.change(getTextarea(), { target: { value: testInput } });
    fireEvent.click(getButton());

    await waitFor(() => {
      expect(mockOafGetElementMeta).toHaveBeenCalledWith({
        formLocation: 'supplier_form',
        formId: '123',
      });
      expect(getResponseTextarea().value).toBe(JSON.stringify(mockRawResponse, null, 2));
    });
  });

  test('handles JSON parsing error and displays error message', async () => {
    render(<GetElementMeta />);

    const invalidJson = '{invalid json}';
    fireEvent.change(getTextarea(), { target: { value: invalidJson } });
    fireEvent.click(getButton());

    await waitFor(() => {
      expect(mockOafGetElementMeta).not.toHaveBeenCalled();
      expect(getResponseTextarea().value).toContain('Error parsing input');
    });
  });

  test('handles empty input gracefully', async () => {
    render(<GetElementMeta />);

    fireEvent.click(getButton());

    await waitFor(() => {
      expect(mockOafGetElementMeta).not.toHaveBeenCalled();
      expect(getResponseTextarea().value).toBe('Metadata text cannot be empty');
    });
  });

  test('handles error response from oafGetElementMeta', async () => {
    const mockErrorResponse = {
      status: 'failure',
      message: 'Element not found',
      error_data: [{ error_message: 'Invalid form ID' }],
    };
    mockOafGetElementMeta.mockResolvedValue(mockErrorResponse);

    render(<GetElementMeta />);

    const testInput = '{"formLocation": "invalid_form", "formId": "999"}';
    fireEvent.change(getTextarea(), { target: { value: testInput } });
    fireEvent.click(getButton());

    await waitFor(() => {
      expect(mockOafGetElementMeta).toHaveBeenCalled();
      expect(getResponseTextarea().value).toBe(JSON.stringify(mockErrorResponse, null, 2));
    });
  });

  test('sets up event listener for getElementMetaResponse on mount', () => {
    render(<GetElementMeta />);

    expect(mockOafAppEvents.on).toHaveBeenCalledWith(
      'getElementMetaResponse',
      expect.any(Function)
    );
  });

  test('removes event listener on unmount', () => {
    const { unmount } = render(<GetElementMeta />);

    // Get the callback function that was registered
    const callback = mockOafAppEvents.on.mock.calls[0][1];

    unmount();

    expect(mockOafAppEvents.off).toHaveBeenCalledWith(
      'getElementMetaResponse',
      callback
    );
  });

  test('handles getElementMetaResponse event and updates response', async () => {
    render(<GetElementMeta />);

    const eventHandler = mockOafAppEvents.on.mock.calls[0][1];

    const mockEvent = {
      formId: '123',
      metadata: { fieldCount: 5 },
    };

    await act(async () => {
      eventHandler(mockEvent);
    });

    expect(getResponseTextarea().value).toBe(JSON.stringify(mockEvent, null, 2));
  });

  test('response textarea is readOnly', () => {
    render(<GetElementMeta />);

    expect(getResponseTextarea()).toHaveAttribute('readOnly');
  });

  test('input textarea has correct id', () => {
    render(<GetElementMeta />);

    expect(getTextarea()).toHaveAttribute('id', GET_ELEMENT_META_LABELS.INPUT_ID);
  });

  test('button has correct id', () => {
    render(<GetElementMeta />);

    expect(getButton()).toHaveAttribute('id', GET_ELEMENT_META_LABELS.BUTTON_ID);
  });

  test('response textarea has correct id', () => {
    render(<GetElementMeta />);

    expect(getResponseTextarea()).toHaveAttribute('id', GET_ELEMENT_META_LABELS.RESPONSE_ID);
  });

  test('handles complex inputFields structure', async () => {
    const mockRawResponse = {
      fields: [{ id: 'name_given', type: 'text', value: 'John' }],
    };
    mockOafGetElementMeta.mockResolvedValue({
      status: 'success',
      rawResponse: mockRawResponse,
    });

    render(<GetElementMeta />);

    const complexInput = JSON.stringify({
      inputFields: [
        {
          inputId: 'name_given',
          inputLocation: 'supplier_information_contact_form',
          formId: '62',
        },
      ],
    });

    fireEvent.change(getTextarea(), { target: { value: complexInput } });
    fireEvent.click(getButton());

    await waitFor(() => {
      expect(mockOafGetElementMeta).toHaveBeenCalledWith({
        inputFields: [
          {
            inputId: 'name_given',
            inputLocation: 'supplier_information_contact_form',
            formId: '62',
          },
        ],
      });
    });
  });
});
