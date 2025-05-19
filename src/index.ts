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

const url ='https://nolevel.vercel.app/'
const API_URL = `http://localhost:3000/api/whatsbot`;

//função para comportamento de resposta humanizado
//função para controle o delay de resposta para simular o tempo de resposta humano randomico
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function esperarComoHumano() {
   const delayMs = Math.floor(Math.random()*10000); // Tempo de espera entre 0 e 10 segundos
   console.log("delay de atendimento", delayMs);
  await delay(delayMs);
}





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
  var serverUrl = process.env.SERVER_URL || 'http://localhost:3001';
  console.log(`📲acesse ${serverUrl} para acessar...` );
});

client.on('ready', () => {
  console.log('✅ Bot conectado ao WhatsApp!');
  qrCodeImage = null;
});

client.on('message', async (msg: Message) => {
  const userMessage = msg.body;
  const sessionId = msg.from;

  try {
   esperarComoHumano()
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage, sessionId })
    });

    const data: any = await response.json();

    if (data.response) {
    
      await client.sendMessage(msg.from, data.response);
    } else {
     
      await client.sendMessage(msg.from, 'Desculpe, houve um erro ao processar sua solicitação.');
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
  var serverUrl = process.env.SERVER_URL || 'http://localhost:3001';
  console.log(`📲acesse ${serverUrl} para acessar...` );
});





//alteração importante
async function iniciarConversa(numero: string, mensagem: string) {
  const contatoComDDI = numero.includes('@c.us') ? numero : `${numero}@c.us`;

  try {
    await client.sendMessage(contatoComDDI, mensagem);
    console.log(`✅ Mensagem enviada para ${numero}: "${mensagem}"`);
  } catch (error) {
    console.error(`❌ Erro ao iniciar conversa com ${numero}:`, error);
  }
}