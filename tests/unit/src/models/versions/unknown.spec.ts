import { UnknownType } from '../../../../../src/models/versions/unknown.js';

describe('Scenario => Model UnknownType', () => {
  describe('Method <validate>', () => {
    it('should return true when a valid version string is provided', () => {
      const unknownType = new UnknownType();
      expect(unknownType.validate('1.2.30')).toBe(true);
      expect(unknownType.validate('1.20.3')).toBe(true);
      expect(unknownType.validate('10.2.3')).toBe(true);
      expect(unknownType.validate('1.2.3.12')).toBe(true);
      expect(unknownType.validate('1.20.3.1')).toBe(true);
    });

    it('should return false when an empty string is provided', () => {
      const unknownType = new UnknownType();
      expect(unknownType.validate('')).toBe('Version must match pattern 0.0.0.0 or 0.0.0');
      expect(unknownType.validate('1.2.3.a')).toBe('Version must match pattern 0.0.0.0 or 0.0.0');
      expect(unknownType.validate('1.a.3.0')).toBe('Version must match pattern 0.0.0.0 or 0.0.0');
      expect(unknownType.validate('bob0.0.0.1')).toBe('Version must match pattern 0.0.0.0 or 0.0.0');
      expect(unknownType.validate('0.0.0.1bob')).toBe('Version must match pattern 0.0.0.0 or 0.0.0');
    });
  });

  describe('Method <getChoices>', () => {
    it('should return an array of strings containing the choices', () => {
      const unknownType = new UnknownType('');
      const result = unknownType.getChoices();
      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual(['Manual']);
    });
  });
});
