import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

describe('Card Component', () => {
  it('renders card with all parts', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>Card Content</CardContent>
        <CardFooter>Card Footer</CardFooter>
      </Card>
    )

    expect(screen.getByText('Card Title')).toBeInTheDocument()
    expect(screen.getByText('Card Description')).toBeInTheDocument()
    expect(screen.getByText('Card Content')).toBeInTheDocument()
    expect(screen.getByText('Card Footer')).toBeInTheDocument()
  })

  it('renders card with custom className', () => {
    render(
      <Card className="custom-class">
        <CardContent>Content</CardContent>
      </Card>
    )

    const card = screen.getByText('Content').closest('div')
    expect(card).toHaveClass('custom-class')
  })

  it('renders card without header', () => {
    render(
      <Card>
        <CardContent>Content Only</CardContent>
      </Card>
    )

    expect(screen.getByText('Content Only')).toBeInTheDocument()
    expect(screen.queryByText('Card Title')).not.toBeInTheDocument()
  })

  it('handles click events on footer', async () => {
    const handleClick = jest.fn()
    render(
      <Card>
        <CardFooter>
          <button onClick={handleClick}>Action</button>
        </CardFooter>
      </Card>
    )

    const button = screen.getByRole('button', { name: /action/i })
    await userEvent.click(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})