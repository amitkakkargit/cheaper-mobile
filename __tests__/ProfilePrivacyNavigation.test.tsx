import { render, screen } from '@testing-library/react-native';

import ProfileScreen from '@/app/(tabs)/profile';
import * as api from '@/lib/api';

jest.mock('@/lib/api', () => ({
  clearUserSession: jest.fn(),
  getCurrentUser: jest.fn(),
  requestEmailOtp: jest.fn(),
  requestPhoneOtp: jest.fn(),
  updateProfile: jest.fn(),
  verifyEmailOtp: jest.fn(),
  verifyPhoneOtp: jest.fn(),
}));

describe('profile settings navigation', () => {
  it('shows privacy and support navigation for signed-in users', async () => {
    jest.mocked(api.getCurrentUser).mockResolvedValue({
      id: 'user-1',
      name: 'Test User',
      sellers: [],
    });

    render(<ProfileScreen />);

    expect(await screen.findByText('Privacy Settings')).toBeTruthy();
    expect(await screen.findByText('Help & Support')).toBeTruthy();
  });
});
