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
  // 2. Crear documento nativo de Google Docs (0 bytes quota)
  const gdocRes = await fetch('https://www.googleapis.com/drive/v3/files?supportsAllDrives=true', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'Politica_General_ZoeTi_Personal_Shopper',
      mimeType: 'application/vnd.google-apps.document',
      parents: [folderId],
    }),
  });

  console.log('CREATE GDOC STATUS:', gdocRes.status);
  const gdocJson = await gdocRes.json();
  console.log('CREATE GDOC RESULT:', JSON.stringify(gdocJson, null, 2));
}

subirPolitica().catch(console.error);

