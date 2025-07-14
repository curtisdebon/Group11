import { render, screen, fireEvent } from '@testing-library/react';
import ModeratorPanel from './ModeratorPanel';
import '@testing-library/jest-dom';

test('moderator approves a flagged review', () => {
  render(<ModeratorPanel />);

  // Check for the review content
  expect(screen.getByText('Fake Review')).toBeInTheDocument();
  expect(screen.getByText('This is fake.')).toBeInTheDocument();
  expect(screen.getByText('Adam Parker')).toBeInTheDocument();

  // Click the Approve Flag button
  fireEvent.click(screen.getByText('Approve Flag'));

  // Check that the approval message is displayed
  expect(screen.getByText('Flag Approved ✅')).toBeInTheDocument();
});
