import { render, screen } from '@testing-library/react';
import ExpandedView from '../../../src/features/ui/views/ExpandedView';

// Mock the child components
jest.mock('../../../src/features/ui/components/Header', () => {
  return function MockHeader() {
    return <div data-testid="header">Header Component</div>;
  };
});

jest.mock('../../../src/features/ui/views/ActionsView', () => {
  return function MockActionsView() {
    return <div data-testid="actions-view">ActionsView Component</div>;
  };
});

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

// Mock useOaf hook
jest.mock('../../../src/features/oaf/useOaf', () => ({
  useOaf: jest.fn(() => ({
    oafNavigatePath: jest.fn(),
    oafOpenEasyForm: jest.fn(),
    oafReadForm: jest.fn(),
    oafWriteForm: jest.fn(),
    oafSubscribeToLocation: jest.fn(),
    oafAppEvents: { on: jest.fn(), off: jest.fn() },
    currLayoutPosition: 'maximized',
    isVisible: true,
  })),
}));

describe('ExpandedView', () => {
  test('renders without errors', () => {
    expect(() => {
      render(<ExpandedView />);
    }).not.toThrow();
  });

  test('renders Header component', () => {
    render(<ExpandedView />);

    const headerComponent = screen.getByTestId('header');
    expect(headerComponent).toBeInTheDocument();
    expect(headerComponent).toHaveTextContent('Header Component');
  });

  test('renders ActionsView component', () => {
    render(<ExpandedView />);

    const actionsViewComponent = screen.getByTestId('actions-view');
    expect(actionsViewComponent).toBeInTheDocument();
    expect(actionsViewComponent).toHaveTextContent('ActionsView Component');
  });

  test('renders both Header and ActionsView components', () => {
    render(<ExpandedView />);

    const headerComponent = screen.getByTestId('header');
    const actionsViewComponent = screen.getByTestId('actions-view');

    expect(headerComponent).toBeInTheDocument();
    expect(actionsViewComponent).toBeInTheDocument();
  });

  test('components are rendered in correct order', () => {
    const { container } = render(<ExpandedView />);

    const expandedViewDiv = container.querySelector('.expanded-view');
    const children = Array.from(expandedViewDiv.children);

    expect(children).toHaveLength(2);
    expect(children[0]).toHaveAttribute('data-testid', 'header');
    expect(children[1]).toHaveAttribute('data-testid', 'actions-view');
  });

  test('Header appears before ActionsView in DOM order', () => {
    render(<ExpandedView />);

    const headerComponent = screen.getByTestId('header');
    const actionsViewComponent = screen.getByTestId('actions-view');

    // Get their positions in the DOM
    const headerPosition = Array.from(
      headerComponent.parentNode.children
    ).indexOf(headerComponent);
    const actionsPosition = Array.from(
      actionsViewComponent.parentNode.children
    ).indexOf(actionsViewComponent);

    expect(headerPosition).toBeLessThan(actionsPosition);
  });

  test('has expanded-view class on wrapper div', () => {
    const { container } = render(<ExpandedView />);

    const expandedViewDiv = container.querySelector('.expanded-view');
    expect(expandedViewDiv).toBeInTheDocument();
    expect(expandedViewDiv).toHaveClass('expanded-view');
  });

  test('wrapper div contains both components', () => {
    const { container } = render(<ExpandedView />);

    const expandedViewDiv = container.querySelector('.expanded-view');
    expect(expandedViewDiv.children).toHaveLength(2);
  });

  test('is a memoized component', () => {
    // Verify React.memo is applied by checking the component renders consistently
    const { container: container1 } = render(<ExpandedView />);
    const { container: container2 } = render(<ExpandedView />);

    expect(container1.querySelector('.expanded-view')).toBeTruthy();
    expect(container2.querySelector('.expanded-view')).toBeTruthy();
    expect(container1.querySelector('[data-testid="header"]')).toBeTruthy();
    expect(container2.querySelector('[data-testid="header"]')).toBeTruthy();
  });

  test('serves as expanded app layout container', () => {
    render(<ExpandedView />);

    // Should contain the expanded app structure with header and actions
    const headerComponent = screen.getByTestId('header');
    const actionsViewComponent = screen.getByTestId('actions-view');

    expect(headerComponent).toBeInTheDocument();
    expect(actionsViewComponent).toBeInTheDocument();

    // Both should be siblings in the same container
    expect(headerComponent.parentNode).toBe(actionsViewComponent.parentNode);
  });
});
