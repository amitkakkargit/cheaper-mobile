import { fireEvent, render, screen } from '@testing-library/react-native';

import PrivacySettingsScreen from '@/app/privacy-settings';

describe('mobile privacy settings', () => {
  it('renders privacy settings controls', () => {
    render(<PrivacySettingsScreen />);

    expect(screen.getByText('Privacy Settings')).toBeTruthy();
    expect(screen.getByText('Public profile')).toBeTruthy();
    expect(screen.getByLabelText('Show sold products')).toBeTruthy();
  });

  it('saves privacy preferences locally', async () => {
    render(<PrivacySettingsScreen />);

    fireEvent.press(screen.getByText('Save privacy settings'));

    expect(await screen.findByText('Privacy preferences saved locally.')).toBeTruthy();
  });
});
