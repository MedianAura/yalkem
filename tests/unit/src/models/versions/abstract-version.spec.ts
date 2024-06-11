import { SemverType } from '../../../../../src/models/versions/semver.js';

describe('Scenario => Abstract BaseVersionType', () => {
  describe('Method <setVersion>', () => {
    it('should correctly split a version string with dots into an array of digits', () => {
      const version = '1.2.3';
      const baseVersionType = new SemverType();

      baseVersionType.setVersion(version);

      // @ts-expect-error : digits is protected
      expect(baseVersionType.digits).toEqual([1, 2, 3]);
    });

    it('should throw an error if the version string contains non-numeric characters', () => {
      const version = '1.2.a';
      const baseVersionType = new SemverType();
      expect(() => baseVersionType.setVersion(version)).toThrowError('Invalid version string');
    });
  });

  describe('Method <getVersion>', () => {
    it('should return a string with the version digits separated by dots', () => {
      const version = new SemverType('1.2.3');
      const result = version.getVersion();
      expect(result).toBe('1.2.3');
    });

    it('should handle the case where digits array contains negative numbers', () => {
      const version = new SemverType('-1.-2.-3');
      const result = version.getVersion();
      expect(result).toBe('-1.-2.-3');
    });
  });

  describe('Method <getBumpChoices>', () => {
    it('should return proper type when given input', () => {
      const versionType = new SemverType();
      expect(versionType['getBumpChoices']('Major')).toBe(0);
      expect(versionType['getBumpChoices']('Minor')).toBe(1);
      expect(versionType['getBumpChoices']('Patch')).toBe(2);
      expect(versionType['getBumpChoices']('Revision')).toBe(3);
    });
  });

  describe('Method <bump>', () => {
    it('should bump the correct digit when given a valid bump type', () => {
      const version = new SemverType('1.2.3');
      version.bump('Minor');
      expect(version.getVersion()).toBe('1.3.0');
    });

    it('should throw an error when given an invalid bump type', () => {
      const version = new SemverType('1.2.3');
      expect(() => {
        version.bump('Invalid');
      }).toThrowError('Invalid bump type');
    });
  });
});
