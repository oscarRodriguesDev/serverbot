import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import http from 'http';
import QRCode from 'qrcode';

const port = 3001;

let qrCodeImage: string | null = null;

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

client.on('qr', async (qr: string) => {
  qrCodeImage = await QRCode.toDataURL(qr);
  console.log('QR code atualizado. Acesse http://localhost:3001 para visualizar.');
});

client.on('ready', () => {
  console.log('✅ Bot conectado ao WhatsApp!');
  qrCodeImage = null;
});

client.on('message', async (msg: Message) => {
  const userMessage = msg.body;
  const sessionId = msg.from;

  try {
    const response = await fetch('http://localhost:3000/api/chat', {
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
    console.error('Erro ao chamar a API:', error);
    await msg.reply('Erro interno. Tente novamente mais tarde.');
  }
});

client.initialize();

// Servidor HTTP básico que exibe o QR code
const server = http.createServer((req, res) => {
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

server.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
