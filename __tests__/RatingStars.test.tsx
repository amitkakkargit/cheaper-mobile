import { fireEvent, render, screen } from '@testing-library/react-native';

import RatingStars, { roundRatingToHalf } from '@/components/RatingStars';

describe('mobile RatingStars', () => {
  it('renders decimal rating labels accessibly', () => {
    render(<RatingStars rating={4.5} label="4.5 out of 5" />);

    expect(screen.getByLabelText('4.5 out of 5')).toBeTruthy();
    expect(screen.getByText('4.5')).toBeTruthy();
  });

  it('supports half-star input', () => {
    const onRatingChange = jest.fn();

    render(
      <RatingStars
        rating={3}
        label="Rate transaction"
        interactive
        onRatingChange={onRatingChange}
      />,
    );

    fireEvent.press(screen.getByLabelText('Rate 3.5 out of 5'));

    expect(onRatingChange).toHaveBeenCalledWith(3.5);
  });

  it('rounds averages to the nearest half for visual display', () => {
    expect(roundRatingToHalf(4.3)).toBe(4.5);
    expect(roundRatingToHalf(2.2)).toBe(2);
  });
});
