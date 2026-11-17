import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function subirPolitica() {
  const credPath = path.resolve(__dirname, '../../credenciales/cuenta-servicio.json');
  const cred = JSON.parse(fs.readFileSync(credPath, 'utf8'));
  const now = Math.floor(Date.now() / 1000);

  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const claimSet = Buffer.from(JSON.stringify({
    iss: cred.client_email,
    scope: 'https://www.googleapis.com/auth/drive',
    aud: cred.token_uri || 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  })).toString('base64url');

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(header + '.' + claimSet);
  const signature = signer.sign(cred.private_key, 'base64url');
  const assertion = header + '.' + claimSet + '.' + signature;

  const tokenResp = await fetch(cred.token_uri || 'https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });

  const { access_token } = await tokenResp.json();
  console.log('✅ Token OAuth con alcance de escritura obtenido.');

  const folderId = '1pMcv1iAk0wTSToo6Z13DUlR9djbSWCdG';
  
  // 1. Probar acceso a la carpeta
  const folderCheck = await fetch(`https://www.googleapis.com/drive/v3/files/${folderId}?supportsAllDrives=true&fields=id,name,capabilities`, {
    headers: { Authorization: `Bearer ${access_token}` }
  });
  console.log('Folder check status:', folderCheck.status);
  const folderJson = await folderCheck.json();
  console.log('Folder check response:', JSON.stringify(folderJson, null, 2));
  const filePath = path.resolve(__dirname, '../../../frontend/public/Politica_General_ZoeTi_Personal_Shopper.txt');
  const content = fs.readFileSync(filePath, 'utf8');

  const metadata = {
    name: 'Politica_General_ZoeTi_Personal_Shopper.txt',
    parents: [folderId],
    mimeType: 'text/plain',
  };

  const boundary = 'foo_bar_baz_777';
  const delimiter = '\r\n--' + boundary + '\r\n';
  const closeDelim = '\r\n--' + boundary + '--';

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: text/plain; charset=UTF-8\r\n\r\n' +
    content +
    closeDelim;

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${access_token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody,
  });

  console.log('Subida a Google Drive HTTP Status:', res.status);
  const json = await res.json();
  console.log('Resultado Google Drive:\n', JSON.stringify(json, null, 2));
}

subirPolitica().catch(console.error);

