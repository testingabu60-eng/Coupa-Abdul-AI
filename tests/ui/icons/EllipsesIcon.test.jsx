import { render } from '@testing-library/react';
import EllipsesIcon from '../../../src/features/ui/icons/EllipsesIcon';

describe('EllipsesIcon', () => {
  test('renders wrapper div and SVG element', () => {
    const { container } = render(<EllipsesIcon />);

    const wrapperDiv = container.firstChild;
    const svgElement = container.querySelector('svg');

    expect(wrapperDiv).toBeInTheDocument();
    expect(wrapperDiv.tagName).toBe('DIV');
    expect(svgElement).toBeInTheDocument();
  });

  test('has correct SVG attributes', () => {
    const { container } = render(<EllipsesIcon />);

    const svgElement = container.querySelector('svg');

    expect(svgElement).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
    expect(svgElement).toHaveAttribute('fill', 'currentColor');
    expect(svgElement).toHaveAttribute('viewBox', '0 0 24 24');
    expect(svgElement).toHaveAttribute('stroke', 'none');
  });

  test('has correct CSS classes', () => {
    const { container } = render(<EllipsesIcon />);

    const svgElement = container.querySelector('svg');

    expect(svgElement).toHaveClass('h-6');
    expect(svgElement).toHaveClass('w-6');
    expect(svgElement).toHaveClass('text-white-700');
  });

  test('contains three circle elements for ellipses dots', () => {
    const { container } = render(<EllipsesIcon />);

    const circleElements = container.querySelectorAll('circle');

    expect(circleElements).toHaveLength(3);
  });

  test('first circle has correct position and radius', () => {
    const { container } = render(<EllipsesIcon />);

    const circles = container.querySelectorAll('circle');
    const firstCircle = circles[0];

    expect(firstCircle).toHaveAttribute('cx', '5');
    expect(firstCircle).toHaveAttribute('cy', '12');
    expect(firstCircle).toHaveAttribute('r', '2');
  });

  test('second circle has correct position and radius', () => {
    const { container } = render(<EllipsesIcon />);

    const circles = container.querySelectorAll('circle');
    const secondCircle = circles[1];

    expect(secondCircle).toHaveAttribute('cx', '12');
    expect(secondCircle).toHaveAttribute('cy', '12');
    expect(secondCircle).toHaveAttribute('r', '2');
  });

  test('third circle has correct position and radius', () => {
    const { container } = render(<EllipsesIcon />);

    const circles = container.querySelectorAll('circle');
    const thirdCircle = circles[2];

    expect(thirdCircle).toHaveAttribute('cx', '19');
    expect(thirdCircle).toHaveAttribute('cy', '12');
    expect(thirdCircle).toHaveAttribute('r', '2');
  });

  test('all circles are horizontally aligned', () => {
    const { container } = render(<EllipsesIcon />);

    const circles = container.querySelectorAll('circle');

    // All circles should have the same cy (y-coordinate) value
    circles.forEach(circle => {
      expect(circle).toHaveAttribute('cy', '12');
    });
  });

  test('circles are evenly spaced horizontally', () => {
    const { container } = render(<EllipsesIcon />);

    const circles = container.querySelectorAll('circle');

    // Check the cx positions form an even horizontal spacing
    expect(circles[0]).toHaveAttribute('cx', '5'); // Left
    expect(circles[1]).toHaveAttribute('cx', '12'); // Center
    expect(circles[2]).toHaveAttribute('cx', '19'); // Right

    // Verify spacing is consistent (7 units between each)
    const leftPos = parseInt(circles[0].getAttribute('cx'));
    const centerPos = parseInt(circles[1].getAttribute('cx'));
    const rightPos = parseInt(circles[2].getAttribute('cx'));

    expect(centerPos - leftPos).toBe(7);
    expect(rightPos - centerPos).toBe(7);
  });

  test('all circles have the same radius', () => {
    const { container } = render(<EllipsesIcon />);

    const circles = container.querySelectorAll('circle');

    circles.forEach(circle => {
      expect(circle).toHaveAttribute('r', '2');
    });
  });

  test('renders as an inline SVG with currentColor fill', () => {
    const { container } = render(<EllipsesIcon />);

    const svgElement = container.querySelector('svg');

    expect(svgElement).toBeInTheDocument();
    expect(svgElement.tagName).toBe('svg');
    expect(svgElement).toHaveAttribute('fill', 'currentColor');
    expect(svgElement).toHaveAttribute('stroke', 'none');
  });

  test('SVG has standard 24x24 viewBox', () => {
    const { container } = render(<EllipsesIcon />);

    const svgElement = container.querySelector('svg');

    expect(svgElement).toHaveAttribute('viewBox', '0 0 24 24');
  });

  test('renders without errors', () => {
    expect(() => {
      render(<EllipsesIcon />);
    }).not.toThrow();
  });

  test('is a pure functional component', () => {
    const { container: container1 } = render(<EllipsesIcon />);
    const { container: container2 } = render(<EllipsesIcon />);

    // Both renders should produce identical output
    expect(container1.innerHTML).toBe(container2.innerHTML);
  });

  test('wrapper div contains only the SVG element', () => {
    const { container } = render(<EllipsesIcon />);

    const wrapperDiv = container.firstChild;

    expect(wrapperDiv.children).toHaveLength(1);
    expect(wrapperDiv.firstChild.tagName).toBe('svg');
  });

  test('circles represent horizontal ellipses pattern', () => {
    const { container } = render(<EllipsesIcon />);

    const circles = container.querySelectorAll('circle');

    // Verify this creates a horizontal ellipses (...) pattern
    expect(circles).toHaveLength(3);

    // All should be on the same horizontal line
    const yPositions = Array.from(circles).map(circle =>
      circle.getAttribute('cy')
    );
    const uniqueYPositions = [...new Set(yPositions)];
    expect(uniqueYPositions).toHaveLength(1);
    expect(uniqueYPositions[0]).toBe('12');

    // Should be arranged left to right
    const xPositions = Array.from(circles).map(circle =>
      parseInt(circle.getAttribute('cx'))
    );
    expect(xPositions).toEqual([5, 12, 19]);
    expect(xPositions).toEqual(xPositions.sort((a, b) => a - b)); // Verify sorted order
  });

  test('has proper styling for ellipses icon', () => {
    const { container } = render(<EllipsesIcon />);

    const svgElement = container.querySelector('svg');

    // Should be styled as white/light colored ellipses
    expect(svgElement).toHaveClass('text-white-700');
    expect(svgElement).toHaveAttribute('fill', 'currentColor');

    // Should have standard icon size
    expect(svgElement).toHaveClass('h-6', 'w-6');
  });
});
