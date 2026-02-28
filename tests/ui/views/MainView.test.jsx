import { render, screen } from '@testing-library/react';

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

import MainView from '../../../src/features/ui/views/MainView';
import { OafProvider } from '../../../src/features/oaf/OafContext.jsx';

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

describe('MainView', () => {
  test('renders without errors', () => {
    expect(() => {
      render(
        <OafProvider>
          <MainView />
        </OafProvider>
      );
    }).not.toThrow();
  });

  test('renders wrapper div container', () => {
    const { container } = render(
      <OafProvider>
        <MainView />
      </OafProvider>
    );

    const wrapperDiv = container.firstChild;
    expect(wrapperDiv).toBeInTheDocument();
    expect(wrapperDiv.tagName).toBe('DIV');
  });

  test('renders Header component', () => {
    render(
      <OafProvider>
        <MainView />
      </OafProvider>
    );

    const headerComponent = screen.getByTestId('header');
    expect(headerComponent).toBeInTheDocument();
    expect(headerComponent).toHaveTextContent('Header Component');
  });

  test('renders ActionsView component', () => {
    render(
      <OafProvider>
        <MainView />
      </OafProvider>
    );

    const actionsViewComponent = screen.getByTestId('actions-view');
    expect(actionsViewComponent).toBeInTheDocument();
    expect(actionsViewComponent).toHaveTextContent('ActionsView Component');
  });

  test('renders both Header and ActionsView components', () => {
    render(
      <OafProvider>
        <MainView />
      </OafProvider>
    );

    const headerComponent = screen.getByTestId('header');
    const actionsViewComponent = screen.getByTestId('actions-view');

    expect(headerComponent).toBeInTheDocument();
    expect(actionsViewComponent).toBeInTheDocument();
  });

  test('components are rendered in correct order', () => {
    const { container } = render(
      <OafProvider>
        <MainView />
      </OafProvider>
    );

    const wrapperDiv = container.firstChild;
    const expandedView = wrapperDiv.firstChild;
    const children = Array.from(expandedView.children);

    expect(children).toHaveLength(2);
    expect(children[0]).toHaveAttribute('data-testid', 'header');
    expect(children[1]).toHaveAttribute('data-testid', 'actions-view');
  });

  test('Header appears before ActionsView in DOM order', () => {
    render(
      <OafProvider>
        <MainView />
      </OafProvider>
    );

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

  test('is a composition component', () => {
    render(
      <OafProvider>
        <MainView />
      </OafProvider>
    );

    // Should compose Header and ActionsView without additional logic
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('actions-view')).toBeInTheDocument();

    // Should not add any additional content
    const allElements = screen.getAllByTestId(/^(header|actions-view)$/);
    expect(allElements).toHaveLength(2);
  });

  test('is a pure functional component', () => {
    const { container: container1 } = render(
      <OafProvider>
        <MainView />
      </OafProvider>
    );
    const { container: container2 } = render(
      <OafProvider>
        <MainView />
      </OafProvider>
    );

    // Both renders should produce identical structure
    expect(container1.firstChild.tagName).toBe(container2.firstChild.tagName);
    expect(container1.firstChild.children.length).toBe(
      container2.firstChild.children.length
    );

    // Both should have the same components
    const container1Header = container1.querySelector('[data-testid="header"]');
    const container1Actions = container1.querySelector(
      '[data-testid="actions-view"]'
    );
    const container2Header = container2.querySelector('[data-testid="header"]');
    const container2Actions = container2.querySelector(
      '[data-testid="actions-view"]'
    );

    expect(container1Header).toBeTruthy();
    expect(container1Actions).toBeTruthy();
    expect(container2Header).toBeTruthy();
    expect(container2Actions).toBeTruthy();
  });

  test('acts as main app layout container', () => {
    render(
      <OafProvider>
        <MainView />
      </OafProvider>
    );

    // Should contain the main app structure
    const headerComponent = screen.getByTestId('header');
    const actionsViewComponent = screen.getByTestId('actions-view');

    expect(headerComponent).toBeInTheDocument();
    expect(actionsViewComponent).toBeInTheDocument();

    // These should be the only direct children
    const container = headerComponent.parentNode;
    expect(container.children).toHaveLength(2);
  });

  test('maintains component hierarchy', () => {
    const { container } = render(
      <OafProvider>
        <MainView />
      </OafProvider>
    );

    const wrapperDiv = container.firstChild;
    const expandedView = wrapperDiv.children[0];
    const headerComponent = expandedView.children[0];
    const actionsViewComponent = expandedView.children[1];

    // Verify correct parent-child relationships
    expect(headerComponent.parentNode).toBe(expandedView);
    expect(actionsViewComponent.parentNode).toBe(expandedView);
    expect(expandedView.parentNode).toBe(wrapperDiv);
    expect(wrapperDiv.parentNode).toBe(container);
  });

  test('serves as root component layout', () => {
    render(
      <OafProvider>
        <MainView />
      </OafProvider>
    );

    // Should provide the basic app layout with header at top and main content below
    const headerComponent = screen.getByTestId('header');
    const actionsViewComponent = screen.getByTestId('actions-view');

    // Both components should be siblings in the same container
    expect(headerComponent.parentNode).toBe(actionsViewComponent.parentNode);

    // Header should come first (typical app layout)
    const siblings = Array.from(headerComponent.parentNode.children);
    expect(siblings.indexOf(headerComponent)).toBe(0);
    expect(siblings.indexOf(actionsViewComponent)).toBe(1);
  });
});
