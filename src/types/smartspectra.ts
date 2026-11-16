/**
 * Official type declarations for Presage Technologies SmartSpectra SDK
 * Corresponds to @smartspectra/node-sdk specifications and protobuf schema.
 */

export interface MetricSample {
  timestampUs?: number;
  value: number;
}

export interface BreathingMetricsPayload {
  rate?: MetricSample[];
  upperTrace?: MetricSample[];
  lowerTrace?: MetricSample[];
  confidence?: MetricSample[];
}

export interface CardioMetricsPayload {
  pulseRate?: MetricSample[];
  arterialPressureTrace?: MetricSample[];
  hrv?: MetricSample[];
}

export interface FaceMetricsPayload {
  trackingQuality?: MetricSample[];
  blink?: MetricSample[];
  landmarks?: number[][];
}

export interface DecodedSmartSpectraMetrics {
  breathing?: BreathingMetricsPayload;
  cardio?: CardioMetricsPayload;
  face?: FaceMetricsPayload;
  timestampUs?: number;
}

export interface ValidationStatus {
  status: number;
  hint: string;
}

export enum FrameTransform {
  kRotate0 = 0,
  kRotate90CW = 1,
  kRotate180 = 2,
  kRotate270CW = 3,
}

export interface SmartSpectraSDKOptions {
  apiKey?: string;
  requestedMetrics?: string[];
}

export type SmartSpectraEvent = 'metrics' | 'validationStatus' | 'streamAvailable' | 'error';
