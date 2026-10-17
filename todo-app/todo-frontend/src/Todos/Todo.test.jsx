import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import Todo from './Todo'

describe('<Todo />', () => {
  const todo = {
    text: 'Write tests for the Todo component',
    done: false
  }

  test('renders the text of the todo', () => {
    render(<Todo todo={todo} />)

    expect(screen.getByText('Write tests for the Todo component')).toBeInTheDocument()
  })

  test('shows the not done info and a button to set the todo as done', () => {
    render(<Todo todo={todo} />)

    expect(screen.getByText('This todo is not done')).toBeInTheDocument()
    expect(screen.getByText('Set as done')).toBeInTheDocument()
  })

  test('shows the done info and no set as done button when the todo is done', () => {
    render(<Todo todo={{ ...todo, done: true }} />)

    expect(screen.getByText('This todo is done')).toBeInTheDocument()
    expect(screen.queryByText('Set as done')).toBeNull()
  })

  test('calls completeTodo with the todo when Set as done is clicked', async () => {
    const completeTodo = vi.fn()
    const user = userEvent.setup()

    render(<Todo todo={todo} completeTodo={completeTodo} />)
    await user.click(screen.getByText('Set as done'))

    expect(completeTodo).toHaveBeenCalledTimes(1)
    expect(completeTodo).toHaveBeenCalledWith(todo)
  })

  test('calls deleteTodo with the todo when Delete is clicked', async () => {
    const deleteTodo = vi.fn()
    const user = userEvent.setup()

    render(<Todo todo={todo} deleteTodo={deleteTodo} />)
    await user.click(screen.getByText('Delete'))

    expect(deleteTodo).toHaveBeenCalledTimes(1)
    expect(deleteTodo).toHaveBeenCalledWith(todo)
  })
})
