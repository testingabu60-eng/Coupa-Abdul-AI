import { render, screen } from '@testing-library/react';
import { LABELS } from '../../../src/features/ui/constants';

const { ACTIONS_VIEW_LABELS } = LABELS;

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
  })),
}));

import ActionsView from '../../../src/features/ui/views/ActionsView';

// Mock all the child components
jest.mock('../../../src/features/ui/components/NavigatePath', () => {
  return function MockNavigatePath() {
    return <div data-testid="navigate-path">NavigatePath Component</div>;
  };
});

jest.mock('../../../src/features/ui/components/EasyForm', () => {
  return function MockEasyForm() {
    return <div data-testid="easy-form">EasyForm Component</div>;
  };
});

jest.mock('../../../src/features/ui/components/ReadForm', () => {
  return function MockReadForm() {
    return <div data-testid="read-form">ReadForm Component</div>;
  };
});

jest.mock('../../../src/features/ui/components/WriteForm', () => {
  return function MockWriteForm() {
    return <div data-testid="write-form">WriteForm Component</div>;
  };
});

jest.mock('../../../src/features/ui/components/SubscribeToLocation', () => {
  return function MockSubscribeToLocation() {
    return (
      <div data-testid="subscribe-to-location">
        SubscribeToLocation Component
      </div>
    );
  };
});

describe('ActionsView', () => {
  test('renders without errors', () => {
    expect(() => {
      render(<ActionsView />);
    }).not.toThrow();
  });

  test('renders main layout structure', () => {
    const { container } = render(<ActionsView />);

    // Check for main structural elements
    const flexContainer = container.querySelector('.flex.flex-col.h-full');
    const mainElement = container.querySelector('main');
    const actionsViewDiv = container.querySelector('#ActionsView');

    expect(flexContainer).toBeInTheDocument();
    expect(mainElement).toBeInTheDocument();
    expect(actionsViewDiv).toBeInTheDocument();
  });

  test('renders Client Demo header', () => {
    render(<ActionsView />);

    const clientDemoHeader = screen.getByText(ACTIONS_VIEW_LABELS.CLIENT_DEMO);
    expect(clientDemoHeader).toBeInTheDocument();
  });

  test('Client Demo header has correct styling classes', () => {
    render(<ActionsView />);

    const clientDemoHeader = screen.getByText(ACTIONS_VIEW_LABELS.CLIENT_DEMO);

    expect(clientDemoHeader).toHaveClass('text-xl');
    expect(clientDemoHeader).toHaveClass('font-bold');
    expect(clientDemoHeader).toHaveClass('text-gray-700');
    expect(clientDemoHeader).toHaveClass('p-3');
    expect(clientDemoHeader).toHaveClass('bg-gray-100');
    expect(clientDemoHeader).toHaveClass('rounded-xl');
  });

  test('renders NavigatePath component', () => {
    render(<ActionsView />);

    const navigatePathComponent = screen.getByTestId('navigate-path');
    expect(navigatePathComponent).toBeInTheDocument();
    expect(navigatePathComponent).toHaveTextContent('NavigatePath Component');
  });

  test('renders EasyForm component', () => {
    render(<ActionsView />);

    const easyFormComponent = screen.getByTestId('easy-form');
    expect(easyFormComponent).toBeInTheDocument();
    expect(easyFormComponent).toHaveTextContent('EasyForm Component');
  });

  test('renders ReadForm component', () => {
    render(<ActionsView />);

    const readFormComponent = screen.getByTestId('read-form');
    expect(readFormComponent).toBeInTheDocument();
    expect(readFormComponent).toHaveTextContent('ReadForm Component');
  });

  test('renders WriteForm component', () => {
    render(<ActionsView />);

    const writeFormComponent = screen.getByTestId('write-form');
    expect(writeFormComponent).toBeInTheDocument();
    expect(writeFormComponent).toHaveTextContent('WriteForm Component');
  });

  test('renders SubscribeToLocation component', () => {
    render(<ActionsView />);

    const subscribeComponent = screen.getByTestId('subscribe-to-location');
    expect(subscribeComponent).toBeInTheDocument();
    expect(subscribeComponent).toHaveTextContent(
      'SubscribeToLocation Component'
    );
  });

  test('renders "Read/Write to Form" section header', () => {
    render(<ActionsView />);

    const sectionHeader = screen.getByText(ACTIONS_VIEW_LABELS.READ_WRITE_FORM);
    expect(sectionHeader).toBeInTheDocument();
  });

  test('Read/Write section has correct styling', () => {
    render(<ActionsView />);

    const sectionHeader = screen.getByText(ACTIONS_VIEW_LABELS.READ_WRITE_FORM);
    const sectionContainer = sectionHeader.closest('.bg-white');

    expect(sectionContainer).toHaveClass('bg-white');
    expect(sectionContainer).toHaveClass('p-6');
    expect(sectionContainer).toHaveClass('rounded-xl');
    expect(sectionContainer).toHaveClass('shadow-lg');
    expect(sectionContainer).toHaveClass('space-y-4');
    expect(sectionContainer).toHaveClass('border');
    expect(sectionContainer).toHaveClass('border-gray-200');
  });

  test('Read/Write section header has correct styling', () => {
    render(<ActionsView />);

    const sectionHeader = screen.getByText(ACTIONS_VIEW_LABELS.READ_WRITE_FORM);

    expect(sectionHeader).toHaveClass('text-xl');
    expect(sectionHeader).toHaveClass('font-semibold');
    expect(sectionHeader).toHaveClass('text-gray-700');
    expect(sectionHeader).toHaveClass('border-b');
    expect(sectionHeader).toHaveClass('pb-2');
  });

  test('main element has correct layout classes', () => {
    const { container } = render(<ActionsView />);

    const mainElement = container.querySelector('main');

    expect(mainElement).toHaveClass('flex-grow');
    expect(mainElement).toHaveClass('p-4');
    expect(mainElement).toHaveClass('bg-gray-50');
    expect(mainElement).toHaveClass('overflow-y-auto');
  });

  test('ActionsView div has correct id and spacing class', () => {
    const { container } = render(<ActionsView />);

    const actionsViewDiv = container.querySelector('#ActionsView');

    expect(actionsViewDiv).toHaveAttribute('id', 'ActionsView');
    expect(actionsViewDiv).toHaveClass('space-y-6');
  });

  test('header wrapper has correct styling', () => {
    const { container } = render(<ActionsView />);

    const headerWrapper = container.querySelector('header');

    expect(headerWrapper).toBeInTheDocument();
    expect(headerWrapper).toHaveClass('text-center');
  });

  test('components are rendered in correct order', () => {
    const { container } = render(<ActionsView />);

    const actionsViewDiv = container.querySelector('#ActionsView');
    const children = Array.from(actionsViewDiv.children);

    // Check order by looking for specific elements/components
    expect(children[0].tagName).toBe('HEADER'); // Client Demo header
    expect(children[1]).toContainHTML('NavigatePath Component'); // NavigatePath
    expect(children[2]).toContainHTML('EasyForm Component'); // EasyForm
    expect(children[3]).toContainHTML(ACTIONS_VIEW_LABELS.READ_WRITE_FORM); // Read/Write section
  });

  test('ReadForm and WriteForm are grouped in same section', () => {
    render(<ActionsView />);

    const readFormComponent = screen.getByTestId('read-form');
    const writeFormComponent = screen.getByTestId('write-form');
    const sectionHeader = screen.getByText(ACTIONS_VIEW_LABELS.READ_WRITE_FORM);

    // Both should be in the same container as the section header
    const sectionContainer = sectionHeader.closest('.bg-white');

    expect(sectionContainer).toContainElement(readFormComponent);
    expect(sectionContainer).toContainElement(writeFormComponent);
  });

  test('has proper responsive layout structure', () => {
    const { container } = render(<ActionsView />);

    // Should have flex layout for responsive design
    const outerContainer = container.querySelector('.flex.flex-col.h-full');
    expect(outerContainer).toBeInTheDocument();

    // Main should be flex-grow to take available space
    const mainElement = container.querySelector('main.flex-grow');
    expect(mainElement).toBeInTheDocument();
  });

  test('all components are present and accounted for', () => {
    render(<ActionsView />);

    // Verify all expected components are rendered
    expect(screen.getByTestId('navigate-path')).toBeInTheDocument();
    expect(screen.getByTestId('easy-form')).toBeInTheDocument();
    expect(screen.getByTestId('read-form')).toBeInTheDocument();
    expect(screen.getByTestId('write-form')).toBeInTheDocument();
    expect(screen.getByTestId('subscribe-to-location')).toBeInTheDocument();

    // Verify headers/labels
    expect(screen.getByText(ACTIONS_VIEW_LABELS.CLIENT_DEMO)).toBeInTheDocument();
    expect(screen.getByText(ACTIONS_VIEW_LABELS.READ_WRITE_FORM)).toBeInTheDocument();
  });

  test('is a pure functional component', () => {
    const { container: container1 } = render(<ActionsView />);
    const { container: container2 } = render(<ActionsView />);

    // Both renders should produce identical output (structure-wise)
    expect(container1.querySelector('#ActionsView')).toBeTruthy();
    expect(container2.querySelector('#ActionsView')).toBeTruthy();
    expect(container1.querySelector('header')).toBeTruthy();
    expect(container2.querySelector('header')).toBeTruthy();
  });
});
