import { render, screen, fireEvent, act } from '@testing-library/react';
import Header from '../../../src/features/ui/components/Header';
import { LABELS } from '../../../src/features/ui/constants';
const { HEADER_LABELS } = LABELS;
// Mock icons to avoid SVG errors
jest.mock('../../../src/features/ui/icons/EllipsesIcon', () => ({ children }) => (
  <div data-testid="ellipses-icon">{children}</div>
));
jest.mock('../../../src/features/ui/icons/CrossIcon', () => ({ children }) => (
  <div data-testid="cross-icon">{children}</div>
));

// Mock useOaf hook and its actions
const mockMinimise = jest.fn();
const mockMaximise = jest.fn();
const mockSidepanel = jest.fn();
const mockDockLeft = jest.fn();
const mockDockRight = jest.fn();
const mockClose = jest.fn();

jest.mock('../../../src/features/oaf/useOaf', () => ({
  useOaf: jest.fn(() => ({
    minimiseApp: mockMinimise,
    maximiseApp: mockMaximise,
    makeAppSidepanel: mockSidepanel,
    dockAppToLeft: mockDockLeft,
    dockAppToRight: mockDockRight,
    closeApp: mockClose,
  })),
}));

describe('Header', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders app title and control buttons', () => {
    render(<Header />);
    expect(screen.getByText(LABELS.APP_TITLE)).toBeInTheDocument();
    expect(screen.getByTitle('Options')).toBeInTheDocument();
    expect(screen.getByTitle('Close App')).toBeInTheDocument();
  });

  test('opens and closes ellipsis menu on button click', () => {
    render(<Header />);
    const ellipsisBtn = screen.getByTitle('Options');
    fireEvent.click(ellipsisBtn);
    expect(screen.getByText(HEADER_LABELS.MINIMIZE)).toBeInTheDocument();
    fireEvent.click(ellipsisBtn);
    expect(screen.queryByText(HEADER_LABELS.MINIMIZE)).not.toBeInTheDocument();
  });

  test('calls minimiseApp when Minimize is clicked', () => {
    render(<Header />);
    fireEvent.click(screen.getByTitle('Options'));
    fireEvent.click(screen.getByText(HEADER_LABELS.MINIMIZE));
    expect(mockMinimise).toHaveBeenCalled();
  });

  test('calls maximiseApp when Maximize is clicked', () => {
    render(<Header />);
    fireEvent.click(screen.getByTitle('Options'));
    fireEvent.click(screen.getByText(HEADER_LABELS.MAXIMIZE));
    expect(mockMaximise).toHaveBeenCalled();
  });

  test('calls makeAppSidepanel when SidePanel is clicked', () => {
    render(<Header />);
    fireEvent.click(screen.getByTitle('Options'));
    fireEvent.click(screen.getByText(HEADER_LABELS.MAKE_SIDE_PANEL));
    expect(mockSidepanel).toHaveBeenCalled();
  });

  test('calls dockAppToLeft when Dock To Left is clicked', () => {
    render(<Header />);
    fireEvent.click(screen.getByTitle('Options'));
    fireEvent.click(screen.getByText(HEADER_LABELS.DOCK_TO_LEFT));
    expect(mockDockLeft).toHaveBeenCalled();
  });

  test('calls dockAppToRight when Dock To Right is clicked', () => {
    render(<Header />);
    fireEvent.click(screen.getByTitle('Options'));
    fireEvent.click(screen.getByText(HEADER_LABELS.DOCK_TO_RIGHT));
    expect(mockDockRight).toHaveBeenCalled();
  });

  test('calls closeApp when Close button is clicked', () => {
    render(<Header />);
    fireEvent.click(screen.getByTitle('Close App'));
    expect(mockClose).toHaveBeenCalled();
  });

  test('closes menu when clicking outside', async () => {
    render(<Header />);
    fireEvent.click(screen.getByTitle('Options'));
    expect(screen.getByText(HEADER_LABELS.MINIMIZE)).toBeInTheDocument();
    
    // Wait for useEffect to register the mousedown listener
    await act(async () => {
      fireEvent.mouseDown(document.body);
    });
    
    expect(screen.queryByText(HEADER_LABELS.MINIMIZE)).not.toBeInTheDocument();
  });
});
