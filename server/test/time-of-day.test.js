import { describe, expect, it } from 'vitest';
const { getTimeOfDayLabel } = require('../utils/time-of-day');

describe('getTimeOfDayLabel', () => {
    it('returns morning between 5 and 11', () => {
        expect(getTimeOfDayLabel(5)).toBe('morning');
        expect(getTimeOfDayLabel(11)).toBe('morning');
    });

    it('returns afternoon between 12 and 16', () => {
        expect(getTimeOfDayLabel(12)).toBe('afternoon');
        expect(getTimeOfDayLabel(16)).toBe('afternoon');
    });

    it('returns evening between 17 and 20', () => {
        expect(getTimeOfDayLabel(17)).toBe('evening');
        expect(getTimeOfDayLabel(20)).toBe('evening');
    });

    it('returns night outside daytime hours', () => {
        expect(getTimeOfDayLabel(0)).toBe('night');
        expect(getTimeOfDayLabel(4)).toBe('night');
        expect(getTimeOfDayLabel(21)).toBe('night');
        expect(getTimeOfDayLabel(23)).toBe('night');
    });
});
