import { SemverType } from '../../../../../src/models/versions/semver.js';

describe('Scenario => Model SemverType', () => {
  describe('Method <validate>', () => {
    // Should return true for a valid semver version (e.g. "1.2.3")
    it('should return true when a valid semver version is provided', () => {
      const semverType = new SemverType('');
      expect(semverType.validate('1.2.12')).toBe(true);
      expect(semverType.validate('1.20.3')).toBe(true);
      expect(semverType.validate('10.5.3')).toBe(true);
    });

    // Should return false for a semver version with a missing patch version (e.g. "1.2")
    it('should return false when a semver version with a missing patch version is provided', () => {
      const semverType = new SemverType('');
      expect(semverType.validate('')).toBe('Version must match pattern 0.0.0');
      expect(semverType.validate('1.2.3.1')).toBe('Version must match pattern 0.0.0');
      expect(semverType.validate('1.a.3')).toBe('Version must match pattern 0.0.0');
      expect(semverType.validate('bob0.0.0')).toBe('Version must match pattern 0.0.0');
      expect(semverType.validate('0.0.1bob')).toBe('Version must match pattern 0.0.0');
    });
  });

  describe('Method <getChoices>', () => {
    it(`should return an array of strings containing the choices ['Major', 'Minor', 'Patch', 'Manual']`, () => {
      const semverType = new SemverType('');
      const choices = semverType.getChoices();
      expect(choices).toEqual(['Major', 'Minor', 'Patch', 'Manual']);
    });
  });
});
