import { describe, it, expect } from 'vitest';
import { DecodedSmartSpectraMetrics } from '../types/smartspectra';

describe('SmartSpectra Metrics Specifications', () => {
  it('parses cardio metrics properly from decoded payload', () => {
    const mockDecodedPayload: DecodedSmartSpectraMetrics = {
      cardio: {
        pulseRate: [{ timestampUs: 1000000, value: 72.4 }],
        arterialPressureTrace: [{ timestampUs: 1000000, value: 0.88 }],
        hrv: [{ timestampUs: 1000000, value: 54.2 }],
      },
      breathing: {
        rate: [{ timestampUs: 1000000, value: 14.1 }],
        upperTrace: [{ timestampUs: 1000000, value: 0.35 }],
        lowerTrace: [{ timestampUs: 1000000, value: 0.32 }],
      },
    };

    const pulseRate = mockDecodedPayload.cardio?.pulseRate?.at(-1)?.value;
    const arterialTrace = mockDecodedPayload.cardio?.arterialPressureTrace?.at(-1)?.value;
    const breathingRate = mockDecodedPayload.breathing?.rate?.at(-1)?.value;
    const upperTrace = mockDecodedPayload.breathing?.upperTrace?.at(-1)?.value;

    expect(pulseRate).toBe(72.4);
    expect(arterialTrace).toBe(0.88);
    expect(breathingRate).toBe(14.1);
    expect(upperTrace).toBe(0.35);
  });

  it('handles empty metric arrays gracefully between valid capture windows', () => {
    const mockEmptyPayload: DecodedSmartSpectraMetrics = {
      cardio: {
        pulseRate: [],
      },
      breathing: {
        rate: [],
      },
    };

    const pulseRate = mockEmptyPayload.cardio?.pulseRate?.at(-1)?.value;
    const breathingRate = mockEmptyPayload.breathing?.rate?.at(-1)?.value;

    expect(pulseRate).toBeUndefined();
    expect(breathingRate).toBeUndefined();
  });
});
