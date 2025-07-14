import { render, screen, fireEvent } from '@testing-library/react';
import CompanyResponsePanel from './CompanyResponsePanel';
import '@testing-library/jest-dom';

test('company responds to a review', () => {
  const mockReview = {
    title: 'Excellent Service',
    content: 'Fast and friendly support!',
    user: 'JaneDoe'
  };

  render(<CompanyResponsePanel review={mockReview} />);

  // Step 2: See review
  expect(screen.getByText('Excellent Service')).toBeInTheDocument();
  expect(screen.getByText('Fast and friendly support!')).toBeInTheDocument();
  expect(screen.getByText('JaneDoe')).toBeInTheDocument();

  // Step 3: Type response
  fireEvent.change(screen.getByTestId('response-input'), {
    target: { value: 'Thank you for your feedback!' }
  });

  // Step 4: Click submit
  fireEvent.click(screen.getByText('Submit'));

  // Step 5: See confirmation
  expect(screen.getByTestId('confirmation')).toHaveTextContent('Response saved successfully. Status: Active.');
});
