import type { Meta, StoryObj } from '@storybook/react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card'

const meta: Meta = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: (
      <>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>Card Content</CardContent>
        <CardFooter>Card Footer</CardFooter>
      </>
    ),
  },
}

export const WithoutHeader: Story = {
  args: {
    children: (
      <>
        <CardContent>Content Only</CardContent>
        <CardFooter>Footer Only</CardFooter>
      </>
    ),
  },
}

export const Simple: Story = {
  args: {
    children: (
      <CardContent>
        <h3>Simple Card</h3>
        <p>This is a simple card with just content.</p>
      </CardContent>
    ),
  },
}

export const WithCustomClass: Story = {
  args: {
    className: 'border-2 border-blue-500',
    children: (
      <CardContent>
        <h3>Custom Card</h3>
        <p>This card has custom styling.</p>
      </CardContent>
    ),
  },
}

export const Interactive: Story = {
  args: {
    children: (
      <>
        <CardHeader>
          <CardTitle>Interactive Card</CardTitle>
          <CardDescription>Click the button below</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This card demonstrates interactive elements.</p>
          <CardFooter>
            <button onClick={() => alert('Button clicked!')}>
              Action Button
            </button>
          </CardFooter>
        </CardContent>
      </>
    ),
  },
}