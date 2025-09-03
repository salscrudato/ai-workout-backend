import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import LoadingSpinner from './LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />)
    
    const spinner = screen.getByRole('img', { hidden: true })
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveClass('h-8', 'w-8', 'animate-spin', 'text-primary-600')
  })

  it('renders with custom size', () => {
    render(<LoadingSpinner size="lg" />)
    
    const spinner = screen.getByRole('img', { hidden: true })
    expect(spinner).toHaveClass('h-12', 'w-12')
  })

  it('renders with text', () => {
    const testText = 'Loading data...'
    render(<LoadingSpinner text={testText} />)
    
    expect(screen.getByText(testText)).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const customClass = 'custom-spinner-class'
    render(<LoadingSpinner className={customClass} />)
    
    const container = screen.getByRole('img', { hidden: true }).parentElement
    expect(container).toHaveClass(customClass)
  })

  it('renders small size correctly', () => {
    render(<LoadingSpinner size="sm" />)
    
    const spinner = screen.getByRole('img', { hidden: true })
    expect(spinner).toHaveClass('h-4', 'w-4')
  })

  it('combines custom className with default classes', () => {
    const customClass = 'my-custom-class'
    render(<LoadingSpinner className={customClass} />)
    
    const container = screen.getByRole('img', { hidden: true }).parentElement
    expect(container).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center', customClass)
  })

  it('does not render text when not provided', () => {
    render(<LoadingSpinner />)
    
    const textElement = screen.queryByText(/loading/i)
    expect(textElement).not.toBeInTheDocument()
  })
})
