import { buildVCard, type VCardData, createEmptyAddress } from '../src/vcard';
import QRCode from 'qrcode';
import { writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';

const address = createEmptyAddress();
address.street = 'Innovation One Building';
address.street2 = 'Level 3, AI Campus';
address.city = 'Dubai';
address.state = 'DIFC';
address.country = 'UAE';

const aydan: VCardData = {
  firstName: 'Aydan',
  lastName: 'Baghirzade',
  prefix: '',
  suffix: '',
  org: 'Beyond The Analytics',
  title: 'Data Analytics Associate',
  phones: [{ type: 'CELL', value: '+971 52 478 9738' }],
  emails: [],
  addresses: [address],
  url: 'www.BeyondTheAnalytics.com',
  note: '',
};

const vcardString = buildVCard(aydan);

console.log('--- vCard content ---');
console.log(vcardString);
console.log('--------------------');

const outputPath = resolve(import.meta.dir, '../output/aydan_baghirzade_qr.png');
mkdirSync(dirname(outputPath), { recursive: true });

await QRCode.toFile(outputPath, vcardString, {
  type: 'png',
  width: 800,
  margin: 2,
  errorCorrectionLevel: 'M',
  color: {
    dark: '#000000',
    light: '#ffffff',
  },
});

console.log(`QR code saved to: ${outputPath}`);
