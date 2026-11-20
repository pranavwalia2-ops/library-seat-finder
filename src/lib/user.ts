// User helper for registration number storage
const REG_NO_KEY = 'seatsync_reg_no';

export function getRegistrationNumber(): string {
  if (typeof window === 'undefined') return '12200001';

  const saved = localStorage.getItem(REG_NO_KEY);
  if (saved && saved.trim()) return saved.trim();

  const legacyKey = localStorage.getItem('registration_number');
  if (legacyKey && legacyKey.trim()) return legacyKey.trim();

  try {
    const stateStr = localStorage.getItem('seatsync_state_v1');
    if (stateStr) {
      const parsed = JSON.parse(stateStr);
      if (parsed?.currentUser?.reg_no) {
        return parsed.currentUser.reg_no;
      }
    }
  } catch {
    // Ignore JSON parse errors
  }

  return '12200001';
}

export function setRegistrationNumber(regNo: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(REG_NO_KEY, regNo.trim());
  }
}
