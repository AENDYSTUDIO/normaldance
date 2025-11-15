import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'Enter text',
  },
}

export const WithLabel: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'Enter your email',
  },
}

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password',
  },
}

export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'Enter your email',
  },
}

export const WithError: Story = {
  args: {
    error: 'This field is required',
    placeholder: 'Enter text',
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: 'Disabled input',
  },
}

export const File: Story = {
  args: {
    type: 'file',
    accept: 'image/*',
  },
}

export const WithMaxLength: Story = {
  args: {
    maxLength: 10,
    placeholder: 'Max 10 characters',
  },
}