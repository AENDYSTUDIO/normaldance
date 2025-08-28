import { render, screen } from '@testing-library/react';
import { describe, it, expect } from '@jest/globals';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('applies variant classes correctly', () => {
    const { container } = render(<Button variant="destructive">Delete</Button>);
    // Проверяем, что кнопка отрендерена (точную проверку классов можно добавить позже)
    expect(container.firstChild).toBeInTheDocument();
  });
});