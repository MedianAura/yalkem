import { ChromiumType } from '../../../../../src/models/versions/chromium.js';

describe('Scenario => Model ChromiumType', () => {
  describe('Method <validate>', () => {
    it('should return true when a valid version string is provided', () => {
      const chromiumType = new ChromiumType('');
      expect(chromiumType.validate('1.2.3.12')).toBe(true);
      expect(chromiumType.validate('1.20.3.1')).toBe(true);
    });

    it('should return false when an empty string is provided', () => {
      const chromiumType = new ChromiumType('');
      expect(chromiumType.validate('')).toBe('Version must match pattern 0.0.0.0');
      expect(chromiumType.validate('1.2.3.a')).toBe('Version must match pattern 0.0.0.0');
      expect(chromiumType.validate('1.a.3.0')).toBe('Version must match pattern 0.0.0.0');
      expect(chromiumType.validate('bob0.0.0.1')).toBe('Version must match pattern 0.0.0.0');
      expect(chromiumType.validate('0.0.0.1bob')).toBe('Version must match pattern 0.0.0.0');
    });
  });

  describe('Method <getChoices>', () => {
    it('should return an array of strings containing the choices', () => {
      const chromiumType = new ChromiumType('');
      const result = chromiumType.getChoices();
      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual(['Major', 'Minor', 'Patch', 'Revision', 'Manual']);
    });
  });
});
