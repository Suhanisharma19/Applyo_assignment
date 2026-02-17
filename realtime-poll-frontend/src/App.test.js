import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the polling application', () => {
  render(<App />);
  const titleElement = screen.queryByText(/Create New Poll/i);
  expect(titleElement).toBeInTheDocument();
});

test('app mounts without crashing', () => {
  render(<App />);
  expect(screen.getByRole('button')).toBeInTheDocument();
});
