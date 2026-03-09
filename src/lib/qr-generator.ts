import QRCode from 'qrcode';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { type VCardData, buildVCard, hasMinimumData } from '../vcard';

export interface QROptions {
  width?: number;
  margin?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  darkColor?: string;
  lightColor?: string;
}

const defaults: Required<QROptions> = {
  width: 800,
  margin: 2,
  errorCorrectionLevel: 'M',
  darkColor: '#000000',
  lightColor: '#ffffff',
};

/**
 * Generate a QR code PNG buffer from vCard data.
 */
export async function generateQRBuffer(
  data: VCardData,
  opts: QROptions = {},
): Promise<Buffer> {
  if (!hasMinimumData(data)) {
    throw new Error('Need at least a first name, last name, or organization');
  }

  const o = { ...defaults, ...opts };
  const vcard = buildVCard(data);

  const buffer = await QRCode.toBuffer(vcard, {
    type: 'png',
    width: o.width,
    margin: o.margin,
    errorCorrectionLevel: o.errorCorrectionLevel,
    color: { dark: o.darkColor, light: o.lightColor },
  });

  return buffer;
}

/**
 * Generate a QR code and return as a base64-encoded PNG string.
 */
export async function generateQRBase64(
  data: VCardData,
  opts: QROptions = {},
): Promise<string> {
  const buffer = await generateQRBuffer(data, opts);
  return buffer.toString('base64');
}

/**
 * Generate a QR code and write it to a file.
 */
export async function generateQRToFile(
  data: VCardData,
  outputPath: string,
  opts: QROptions = {},
): Promise<void> {
  const buffer = await generateQRBuffer(data, opts);
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, buffer);
}

/**
 * Generate a QR code PNG as base64 from a raw string.
 */
export async function generateQRFromStringBase64(
  content: string,
  opts: QROptions = {},
): Promise<string> {
  const o = { ...defaults, ...opts };
  const buffer = await QRCode.toBuffer(content, {
    type: 'png',
    width: o.width,
    margin: o.margin,
    errorCorrectionLevel: o.errorCorrectionLevel,
    color: { dark: o.darkColor, light: o.lightColor },
  });
  return buffer.toString('base64');
}

/**
 * Generate the raw vCard string without QR encoding.
 */
export function generateVCardString(data: VCardData): string {
  if (!hasMinimumData(data)) {
    throw new Error('Need at least a first name, last name, or organization');
  }
  return buildVCard(data);
}
