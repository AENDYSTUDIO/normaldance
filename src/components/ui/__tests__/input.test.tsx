import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '@/components/ui/input'

describe('Input Component', () => {
  it('renders with default props', () => {
    render(<Input placeholder="Enter text" />)
    
    const input = screen.getByPlaceholderText(/enter text/i)
    expect(input).toBeInTheDocument()
    expect(input).toHaveClass('flex h-9 w-full rounded-md border')
  })

  it('renders with different types', () => {
    render(<Input type="email" />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('type', 'email')
  })

  it('handles value changes', async () => {
    const handleChange = jest.fn()
    render(<Input onChange={handleChange} />)
    
    const input = screen.getByRole('textbox')
    await userEvent.type(input, 'test value')
    
    expect(handleChange).toHaveBeenCalledTimes(10) // once for each character
  })

  it('can be disabled', () => {
    render(<Input disabled />)
    
    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
    expect(input).toHaveClass('disabled:cursor-not-allowed')
  })

  it('shows error state', () => {
    render(<Input error />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('border-destructive')
  })

  it('renders with label', () => {
    render(<Input label="Email Address" />)
    
    expect(screen.getByText('Email Address')).toBeInTheDocument()
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
  })

  it('supports file input type', () => {
    render(<Input type="file" accept="image/*" />)
    
    const input = screen.getByRole('button') // file inputs are often rendered as buttons
    expect(input).toHaveAttribute('type', 'file')
    expect(input).toHaveAttribute('accept', 'image/*')
  })
})