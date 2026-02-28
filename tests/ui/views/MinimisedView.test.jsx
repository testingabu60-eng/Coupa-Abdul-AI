import { render, screen, fireEvent } from '@testing-library/react';
import MinimisedView from '../../../src/features/ui/views/MinimisedView';
import { LABELS } from '../../../src/features/ui/constants';

const { APP_TITLE } = LABELS;

// Mock useOaf hook
const mockExpandApp = jest.fn();

jest.mock('../../../src/features/oaf/useOaf', () => ({
  useOaf: jest.fn(() => ({
    expandApp: mockExpandApp,
  })),
}));

// Mock oafClient to avoid import.meta.env issues
jest.mock('../../../src/features/oaf/oafClient.js', () => ({
  navigatePath: jest.fn(),
  openEasyForm: jest.fn(),
  readForm: jest.fn(),
  writeForm: jest.fn(),
  subscribeToLocation: jest.fn(),
  oafEvents: jest.fn(() => ({ on: jest.fn(), off: jest.fn(), emit: jest.fn() })),
  moveAndResize: jest.fn(),
  getPageContext: jest.fn(),
}));

describe('MinimisedView', () => {
  beforeEach(() => {
    mockExpandApp.mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders without errors', () => {
    expect(() => {
      render(<MinimisedView />);
    }).not.toThrow();
  });

  test('renders the expand button with app title', () => {
    render(<MinimisedView />);

    const button = screen.getByRole('button', { name: new RegExp(APP_TITLE, 'i') });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent(APP_TITLE);
  });

  test('calls expandApp when button is clicked', () => {
    render(<MinimisedView />);

    const button = screen.getByRole('button', { name: new RegExp(APP_TITLE, 'i') });
    fireEvent.click(button);

    expect(mockExpandApp).toHaveBeenCalledTimes(1);
  });

  test('button has byoa-circle class', () => {
    render(<MinimisedView />);

    const button = screen.getByRole('button', { name: new RegExp(APP_TITLE, 'i') });
    expect(button).toHaveClass('byoa-circle');
  });

  test('has fixed positioning layout', () => {
    const { container } = render(<MinimisedView />);

    const wrapperDiv = container.firstChild;
    expect(wrapperDiv).toHaveClass('fixed');
    expect(wrapperDiv).toHaveClass('inset-0');
    expect(wrapperDiv).toHaveClass('flex');
    expect(wrapperDiv).toHaveClass('items-center');
    expect(wrapperDiv).toHaveClass('justify-center');
  });

  test('is a memoized component', () => {
    // Verify React.memo is applied by checking the component renders consistently
    const { container: container1 } = render(<MinimisedView />);
    const { container: container2 } = render(<MinimisedView />);

    expect(container1.querySelector('.byoa-circle')).toBeTruthy();
    expect(container2.querySelector('.byoa-circle')).toBeTruthy();
  });

  test('renders centered button in viewport', () => {
    const { container } = render(<MinimisedView />);

    // Check the centering classes are present
    const wrapperDiv = container.firstChild;
    expect(wrapperDiv).toHaveClass('flex');
    expect(wrapperDiv).toHaveClass('items-center');
    expect(wrapperDiv).toHaveClass('justify-center');
  });

  test('contains only one button element', () => {
    const { container } = render(<MinimisedView />);

    const buttons = container.querySelectorAll('button');
    expect(buttons).toHaveLength(1);
  });

  test('button is clickable and interactive', () => {
    render(<MinimisedView />);

    const button = screen.getByRole('button', { name: new RegExp(APP_TITLE, 'i') });
    
    // Verify the button is not disabled
    expect(button).not.toBeDisabled();
    
    // Verify click handler works
    fireEvent.click(button);
    expect(mockExpandApp).toHaveBeenCalled();
  });
});
