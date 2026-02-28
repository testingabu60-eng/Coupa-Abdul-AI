import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import SubscribeToLocation from '../../../src/features/ui/components/SubscribeToLocation';
import { LABELS } from '../../../src/features/ui/constants';

const { SUBSCRIBE_TO_LOCATION_LABELS } = LABELS;

// Helper functions to get elements
const getTextarea = () => screen.getByPlaceholderText(SUBSCRIBE_TO_LOCATION_LABELS.INPUT_PLACEHOLDER);
const getButton = () => screen.getByRole('button', { name: new RegExp(SUBSCRIBE_TO_LOCATION_LABELS.BUTTON_TEXT, 'i') });
const getResponseTextarea = () => screen.getByPlaceholderText(new RegExp(SUBSCRIBE_TO_LOCATION_LABELS.RESPONSE_PLACEHOLDER, 'i'));

// Mock useOaf hook
const mockOafSubscribeToLocation = jest.fn();
const mockOafAppEvents = {
  on: jest.fn(),
  off: jest.fn(),
};

jest.mock('../../../src/features/oaf/useOaf', () => ({
  useOaf: jest.fn(() => ({
    oafSubscribeToLocation: mockOafSubscribeToLocation,
    oafAppEvents: mockOafAppEvents,
  })),
}));

describe('SubscribeToLocation', () => {
  beforeEach(() => {
    mockOafSubscribeToLocation.mockReset();
    mockOafAppEvents.on.mockReset();
    mockOafAppEvents.off.mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders title, input textarea, button, and response textarea', () => {
    render(<SubscribeToLocation />);

    expect(screen.getByText(SUBSCRIBE_TO_LOCATION_LABELS.HEADER)).toBeInTheDocument();
    expect(getTextarea()).toBeInTheDocument();
    expect(getButton()).toBeInTheDocument();
    expect(getResponseTextarea()).toBeInTheDocument();
  });

  test('updates textarea value on change', () => {
    render(<SubscribeToLocation />);

    const testInput = '{"location": "test-location", "attributes": ["attr1"]}';
    fireEvent.change(getTextarea(), { target: { value: testInput } });

    expect(getTextarea().value).toBe(testInput);
  });

  test('calls oafSubscribeToLocation with parsed JSON and displays response', async () => {
    const mockMessage = 'Subscription successful!';
    mockOafSubscribeToLocation.mockResolvedValue({ status: 'success', message: mockMessage });

    render(<SubscribeToLocation />);

    const testInput = '{"location": "invoices", "attributes": ["status", "amount"]}';
    fireEvent.change(getTextarea(), { target: { value: testInput } });
    fireEvent.click(getButton());

    await waitFor(() => {
      expect(mockOafSubscribeToLocation).toHaveBeenCalledWith({
        location: 'invoices',
        attributes: ['status', 'amount'],
      });
      expect(getResponseTextarea().value).toBe(mockMessage);
    });
  });

  test('sets up event listener for subscribedAttributeResponse on mount', () => {
    render(<SubscribeToLocation />);

    expect(mockOafAppEvents.on).toHaveBeenCalledWith(
      'subscribedAttributeResponse',
      expect.any(Function)
    );
  });

  test('removes event listener on unmount', () => {
    const { unmount } = render(<SubscribeToLocation />);

    const callback = mockOafAppEvents.on.mock.calls[0][1];

    unmount();

    expect(mockOafAppEvents.off).toHaveBeenCalledWith(
      'subscribedAttributeResponse',
      callback
    );
  });

  test('handles subscribedAttributeResponse event and updates response', async () => {
    render(<SubscribeToLocation />);

    const eventHandler = mockOafAppEvents.on.mock.calls[0][1];

    const mockEvent = {
      location: 'invoices',
      attribute: 'status',
      value: 'approved',
    };

    await act(async () => {
      eventHandler(mockEvent);
    });

    expect(getResponseTextarea().value).toBe(JSON.stringify(mockEvent, null, 2));
  });

  test('handles valid JSON input correctly', async () => {
    const mockMessage = 'Subscription successful';
    mockOafSubscribeToLocation.mockResolvedValue({ status: 'success', message: mockMessage });

    render(<SubscribeToLocation />);

    const validJson = '{"location": "test", "attributes": ["attr1"]}';
    fireEvent.change(getTextarea(), { target: { value: validJson } });
    fireEvent.click(getButton());

    await waitFor(() => {
      expect(mockOafSubscribeToLocation).toHaveBeenCalledWith({
        location: 'test',
        attributes: ['attr1'],
      });
      expect(getResponseTextarea().value).toBe(mockMessage);
    });
  });

  test('handles array as valid JSON input', async () => {
    const mockMessage = 'Array subscription successful';
    mockOafSubscribeToLocation.mockResolvedValue({ status: 'success', message: mockMessage });

    render(<SubscribeToLocation />);

    const arrayJson = '["location1", "location2"]';
    fireEvent.change(getTextarea(), { target: { value: arrayJson } });
    fireEvent.click(getButton());

    await waitFor(() => {
      expect(mockOafSubscribeToLocation).toHaveBeenCalledWith(['location1', 'location2']);
      expect(getResponseTextarea().value).toBe(mockMessage);
    });
  });

  test('response textarea is readOnly', () => {
    render(<SubscribeToLocation />);

    expect(getResponseTextarea()).toHaveAttribute('readOnly');
  });

  test('input textarea has correct id', () => {
    render(<SubscribeToLocation />);

    expect(getTextarea()).toHaveAttribute('id', SUBSCRIBE_TO_LOCATION_LABELS.INPUT_ID);
  });

  test('button has correct id', () => {
    render(<SubscribeToLocation />);

    expect(getButton()).toHaveAttribute('id', SUBSCRIBE_TO_LOCATION_LABELS.BUTTON_ID);
  });

  test('response textarea has correct id', () => {
    render(<SubscribeToLocation />);

    expect(getResponseTextarea()).toHaveAttribute('id', SUBSCRIBE_TO_LOCATION_LABELS.RESPONSE_ID);
  });

  test('handles complex subscription data structure', async () => {
    const mockMessage = 'Subscribed successfully with id 12345';
    mockOafSubscribeToLocation.mockResolvedValue({ status: 'success', message: mockMessage });

    render(<SubscribeToLocation />);

    const complexSubscription = JSON.stringify({
      location: 'purchase-orders',
      attributes: ['status', 'total', 'vendor'],
      filters: {
        status: ['pending', 'approved'],
        dateRange: { start: '2023-01-01', end: '2023-12-31' },
      },
      options: { realTime: true, batchSize: 10 },
    });

    fireEvent.change(getTextarea(), { target: { value: complexSubscription } });
    fireEvent.click(getButton());

    await waitFor(() => {
      expect(mockOafSubscribeToLocation).toHaveBeenCalledWith({
        location: 'purchase-orders',
        attributes: ['status', 'total', 'vendor'],
        filters: {
          status: ['pending', 'approved'],
          dateRange: { start: '2023-01-01', end: '2023-12-31' },
        },
        options: { realTime: true, batchSize: 10 },
      });
      expect(getResponseTextarea().value).toBe(mockMessage);
    });
  });

  test('handles multiple successive subscriptions correctly', async () => {
    const firstMessage = 'First subscription response';
    const secondMessage = 'Second subscription response';

    render(<SubscribeToLocation />);

    // First subscription
    mockOafSubscribeToLocation.mockResolvedValueOnce({ status: 'success', message: firstMessage });
    fireEvent.change(getTextarea(), { target: { value: '{"location": "location1", "attributes": ["attr1"]}' } });
    fireEvent.click(getButton());

    await waitFor(() => {
      expect(getResponseTextarea().value).toBe(firstMessage);
    });

    // Second subscription
    mockOafSubscribeToLocation.mockResolvedValueOnce({ status: 'success', message: secondMessage });
    fireEvent.change(getTextarea(), { target: { value: '{"location": "location2", "attributes": ["attr2"]}' } });
    fireEvent.click(getButton());

    await waitFor(() => {
      expect(getResponseTextarea().value).toBe(secondMessage);
    });

    expect(mockOafSubscribeToLocation).toHaveBeenCalledTimes(2);
  });

  test('event response overwrites subscription response', async () => {
    const subscriptionMessage = 'Initial subscription response';
    mockOafSubscribeToLocation.mockResolvedValue({ status: 'success', message: subscriptionMessage });

    render(<SubscribeToLocation />);

    // Make initial subscription
    fireEvent.change(getTextarea(), { target: { value: '{"location": "test", "attributes": ["attr"]}' } });
    fireEvent.click(getButton());

    await waitFor(() => {
      expect(getResponseTextarea().value).toBe(subscriptionMessage);
    });

    // Simulate event response
    const eventHandler = mockOafAppEvents.on.mock.calls[0][1];
    const eventData = { location: 'test', attribute: 'attr', value: 'new value' };

    await act(async () => {
      eventHandler(eventData);
    });

    expect(getResponseTextarea().value).toBe(JSON.stringify(eventData, null, 2));
  });

  test('handles async error from oafSubscribeToLocation', async () => {
    mockOafSubscribeToLocation.mockResolvedValue({ status: 'failure', message: 'Subscription failed' });

    render(<SubscribeToLocation />);

    fireEvent.change(getTextarea(), { target: { value: '{"location": "invalid-location"}' } });
    fireEvent.click(getButton());

    await waitFor(() => {
      expect(mockOafSubscribeToLocation).toHaveBeenCalledWith({ location: 'invalid-location' });
      expect(getResponseTextarea().value).toBe('The location to subscribe is invalid');
    });
  });
});
