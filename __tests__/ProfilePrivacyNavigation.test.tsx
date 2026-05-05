import { render, screen } from '@testing-library/react-native';

import ProfileScreen from '@/app/(tabs)/profile';
import * as api from '@/lib/api';

jest.mock('@/lib/api', () => ({
  clearUserSession: jest.fn(),
  getCachedCurrentUser: jest.fn(() => null),
  getCurrentUser: jest.fn(),
  requestEmailOtp: jest.fn(),
  requestPhoneOtp: jest.fn(),
  updateProfile: jest.fn(),
  verifyEmailOtp: jest.fn(),
  verifyPhoneOtp: jest.fn(),
}));

describe('profile settings navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(api.getCachedCurrentUser).mockReturnValue(null);
  });

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

  it('keeps cached profile visible while auth refresh is pending', () => {
    jest.mocked(api.getCachedCurrentUser).mockReturnValue({
      id: 'user-1',
      name: 'Cached User',
      sellers: [],
    });
    jest.mocked(api.getCurrentUser).mockImplementation(() => new Promise(() => {}));

    render(<ProfileScreen />);

    expect(screen.getByText('Privacy Settings')).toBeTruthy();
    expect(screen.queryByText('Sign in')).toBeNull();
  });
});
