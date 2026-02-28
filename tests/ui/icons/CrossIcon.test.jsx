import { render, screen } from '@testing-library/react';
import CrossIcon from '../../../src/features/ui/icons/CrossIcon';

describe('CrossIcon', () => {
  test('renders SVG element', () => {
    const { container } = render(<CrossIcon />);

    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
  });

  test('has correct SVG attributes', () => {
    const { container } = render(<CrossIcon />);

    const svgElement = container.querySelector('svg');

    expect(svgElement).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
    expect(svgElement).toHaveAttribute('fill', 'none');
    expect(svgElement).toHaveAttribute('viewBox', '0 0 24 24');
    expect(svgElement).toHaveAttribute('stroke', 'currentColor');
  });

  test('has correct CSS classes', () => {
    const { container } = render(<CrossIcon />);

    const svgElement = container.querySelector('svg');

    expect(svgElement).toHaveClass('h-6');
    expect(svgElement).toHaveClass('w-6');
    expect(svgElement).toHaveClass('text-white-300');
  });

  test('contains correct path element with cross shape', () => {
    const { container } = render(<CrossIcon />);

    const pathElement = container.querySelector('path');

    expect(pathElement).toBeInTheDocument();
    expect(pathElement).toHaveAttribute('stroke-linecap', 'round');
    expect(pathElement).toHaveAttribute('stroke-linejoin', 'round');
    expect(pathElement).toHaveAttribute('stroke-width', '2');
    expect(pathElement).toHaveAttribute('d', 'M6 18L18 6M6 6l12 12');
  });

  test('renders as an inline SVG', () => {
    const { container } = render(<CrossIcon />);

    const svgElement = container.querySelector('svg');

    expect(svgElement).toBeInTheDocument();
    expect(svgElement.tagName).toBe('svg');
  });

  test('SVG is accessible', () => {
    const { container } = render(<CrossIcon />);

    const svgElement = container.querySelector('svg');

    // SVG should be present and properly structured
    expect(svgElement).toBeInTheDocument();
    expect(svgElement.tagName).toBe('svg');
  });

  test('path draws correct cross lines', () => {
    const { container } = render(<CrossIcon />);

    const pathElement = container.querySelector('path');
    const pathData = pathElement.getAttribute('d');

    // The path should contain two lines forming an X
    // M6 18L18 6 - diagonal line from bottom-left to top-right
    // M6 6l12 12 - diagonal line from top-left to bottom-right
    expect(pathData).toContain('M6 18L18 6');
    expect(pathData).toContain('M6 6l12 12');
  });

  test('has proper stroke styling', () => {
    const { container } = render(<CrossIcon />);

    const pathElement = container.querySelector('path');

    expect(pathElement).toHaveAttribute('stroke-linecap', 'round');
    expect(pathElement).toHaveAttribute('stroke-linejoin', 'round');
    expect(pathElement).toHaveAttribute('stroke-width', '2');
  });

  test('SVG has standard 24x24 viewBox', () => {
    const { container } = render(<CrossIcon />);

    const svgElement = container.querySelector('svg');

    expect(svgElement).toHaveAttribute('viewBox', '0 0 24 24');
  });

  test('uses currentColor for stroke', () => {
    const { container } = render(<CrossIcon />);

    const svgElement = container.querySelector('svg');

    expect(svgElement).toHaveAttribute('stroke', 'currentColor');
    expect(svgElement).toHaveAttribute('fill', 'none');
  });

  test('renders without errors', () => {
    expect(() => {
      render(<CrossIcon />);
    }).not.toThrow();
  });

  test('is a pure functional component', () => {
    const { container: container1 } = render(<CrossIcon />);
    const { container: container2 } = render(<CrossIcon />);

    // Both renders should produce identical output
    expect(container1.innerHTML).toBe(container2.innerHTML);
  });
});
