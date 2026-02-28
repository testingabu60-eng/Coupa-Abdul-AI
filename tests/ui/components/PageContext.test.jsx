import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PageContext from '../../../src/features/ui/components/PageContext';
import { LABELS } from '../../../src/features/ui/constants';

const { PAGE_CONTEXT_LABELS } = LABELS;

// Helper functions to get elements
const getButton = () => screen.getByRole('button', { name: new RegExp(PAGE_CONTEXT_LABELS.BUTTON_TEXT, 'i') });
const getResponseTextarea = () => screen.getByPlaceholderText(new RegExp(PAGE_CONTEXT_LABELS.RESPONSE_PLACEHOLDER, 'i'));

// Mock useOaf hook
const mockOafGetPageContext = jest.fn();

jest.mock('../../../src/features/oaf/useOaf', () => ({
  useOaf: jest.fn(() => ({
    oafGetPageContext: mockOafGetPageContext,
  })),
}));

describe('PageContext', () => {
  beforeEach(() => {
    mockOafGetPageContext.mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders title, button, and response textarea', () => {
    render(<PageContext />);

    expect(screen.getByText(PAGE_CONTEXT_LABELS.HEADER)).toBeInTheDocument();
    expect(getButton()).toBeInTheDocument();
    expect(getResponseTextarea()).toBeInTheDocument();
  });

  test('calls oafGetPageContext and displays response on button click', async () => {
    const mockContextData = {
      pageDetails: {
        viewPortHeight: 1080,
        viewPortWidth: 1920,
        currentUrl: '/suppliers/123',
      },
    };
    mockOafGetPageContext.mockResolvedValue({ data: mockContextData });

    render(<PageContext />);

    fireEvent.click(getButton());

    await waitFor(() => {
      expect(mockOafGetPageContext).toHaveBeenCalled();
      expect(getResponseTextarea().value).toBe(JSON.stringify(mockContextData, null, 2));
    });
  });

  test('response textarea is readOnly', () => {
    render(<PageContext />);

    expect(getResponseTextarea()).toHaveAttribute('readOnly');
  });

  test('button has correct id', () => {
    render(<PageContext />);

    expect(getButton()).toHaveAttribute('id', PAGE_CONTEXT_LABELS.BUTTON_ID);
  });

  test('response textarea has correct id', () => {
    render(<PageContext />);

    expect(getResponseTextarea()).toHaveAttribute('id', PAGE_CONTEXT_LABELS.RESPONSE_ID);
  });

  test('handles null data response', async () => {
    mockOafGetPageContext.mockResolvedValue({ data: null });

    render(<PageContext />);

    fireEvent.click(getButton());

    await waitFor(() => {
      expect(getResponseTextarea().value).toBe('null');
    });
  });

  test('initial response textarea is empty', () => {
    render(<PageContext />);

    expect(getResponseTextarea().value).toBe('');
  });
});
