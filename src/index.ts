/* import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';


const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

client.on('qr', (qr: string) => {
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('✅ Bot conectado ao WhatsApp!');
});

client.on('message', async (msg: Message) => {
  const userMessage = msg.body;
  const sessionId = msg.from;

  try {
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userMessage,
        sessionId
      })
    });

    const data:any = await response.json();

    if (data.response) {
      await msg.reply(data.response);
    } else {
      await msg.reply('Desculpe, houve um erro ao processar sua solicitação.');
    }
  } catch (error) {
    console.error('Erro ao chamar a API:', error);
    await msg.reply('Erro interno. Tente novamente mais tarde.');
  }
});

client.initialize();
 */

import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import http from 'http';
import QRCode from 'qrcode';
import os from 'os';

// Obter IP local da máquina
function getLocalExternalIP(): string {
  const interfaces = os.networkInterfaces();

  for (const name of Object.keys(interfaces)) {
    const net = interfaces[name];
    if (!net) continue;

    for (const iface of net) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address; // ex: 192.168.0.103 ou IP público da VPS
      }
    }
  }

  return 'localhost'; // fallback
}

// Define URL base da API automaticamente
const hostname = getLocalExternalIP();
const port = 3000;
const API_URL = `http://${hostname}:${port}/api/chat`; // agora dinâmico ✅

console.log(`🧠 API configurada para: ${API_URL}`);

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

let qrCodeImage: string | null = null;

client.on('qr', async (qr: string) => {
  qrCodeImage = await QRCode.toDataURL(qr);
  console.log('📲 QR code atualizado. Acesse http://localhost:3001 para visualizar.');
});

client.on('ready', () => {
  console.log('✅ Bot conectado ao WhatsApp!');
  qrCodeImage = null;
});

client.on('message', async (msg: Message) => {
  const userMessage = msg.body;
  const sessionId = msg.from;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage, sessionId })
    });

    const data: any = await response.json();

    if (data.response) {
      await msg.reply(data.response);
    } else {
      await msg.reply('Desculpe, houve um erro ao processar sua solicitação.');
    }
  } catch (error) {
    console.error('❌ Erro ao chamar a API:', error);
    await msg.reply('Erro interno. Tente novamente mais tarde.');
  }
});

client.initialize();

// Servidor HTTP para exibir o QR Code
const qrServer = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });

    if (qrCodeImage) {
      res.end(`
        <h1>Escaneie o QR code para conectar o WhatsApp</h1>
        <img src="${qrCodeImage}" />
      `);
    } else {
      res.end('<h1>QR code não disponível no momento.</h1>');
    }
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

qrServer.listen(3001, () => {
  console.log(`🔐 QR Server rodando em http://localhost:3001`);
});
//alteração importante