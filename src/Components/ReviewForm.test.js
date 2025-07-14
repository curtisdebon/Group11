import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ReviewForm from './ReviewForm';
import '@testing-library/jest-dom';

test('submits a review when form is filled and submitted', () => {
  const mockSubmit = jest.fn();

  render(<ReviewForm onSubmit={mockSubmit} />);

  // Fill in the form
  fireEvent.change(screen.getByTestId('title-input'), {
    target: { value: 'Amazing Product' }
  });

  fireEvent.change(screen.getByTestId('content-input'), {
    target: { value: 'Really enjoyed using it!' }
  });

  fireEvent.change(screen.getByTestId('user-input'), {
    target: { value: 'JaneDoe' }
  });

  // Submit the form
  fireEvent.click(screen.getByTestId('submit-button'));

  // Check that onSubmit was called with correct values
  expect(mockSubmit).toHaveBeenCalledWith({
    title: 'Amazing Product',
    content: 'Really enjoyed using it!',
    user: 'JaneDoe'
  });

  // Check that inputs are cleared
  expect(screen.getByTestId('title-input')).toHaveValue('');
  expect(screen.getByTestId('content-input')).toHaveValue('');
  expect(screen.getByTestId('user-input')).toHaveValue('');
});
