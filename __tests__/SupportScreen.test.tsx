import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import SupportScreen from '@/app/support';
import * as api from '@/lib/api';

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    deviceName: 'Test device',
    expoConfig: { version: '1.0.0' },
  },
}));

jest.mock('@/lib/api', () => ({
  createSupportTicket: jest.fn(),
}));

describe('SupportScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('validates support ticket details', () => {
    render(<SupportScreen />);

    fireEvent.press(screen.getByText('Submit support ticket'));

    expect(
      screen.getByText('Please add a title and at least 10 characters of detail.'),
    ).toBeTruthy();
  });

  it('creates a support ticket and shows a success reference', async () => {
    jest.mocked(api.createSupportTicket).mockResolvedValue({
      id: 'ticket-mobile-1',
      status: 'OPEN',
      createdAt: '2026-05-05T12:00:00Z',
      message: 'Support ticket created. Our team will review it soon.',
    });

    render(<SupportScreen />);

    fireEvent.changeText(screen.getByPlaceholderText('Unable to confirm product handoff'), 'App issue');
    fireEvent.changeText(
      screen.getByPlaceholderText('Describe what happened and what you expected.'),
      'The confirmation button does not respond on mobile.',
    );
    fireEvent.changeText(screen.getByPlaceholderText('you@example.com'), 'user@example.com');
    fireEvent.press(screen.getByText('Submit support ticket'));

    await waitFor(() => {
      expect(api.createSupportTicket).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'App issue',
          source: 'mobile',
          email: 'user@example.com',
        }),
      );
    });
    expect(await screen.findByText(/ticket-mobile-1/)).toBeTruthy();
  });
});
