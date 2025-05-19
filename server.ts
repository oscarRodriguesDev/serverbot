import express from 'express'; 
import { Request, Response } from 'express';
import bodyParser from 'body-parser';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3000;

app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});



app.post('/api/chat', async (req: Request|any, res: Response|any) => {
  const { message, sessionId } = req.body;

  if (!message || !sessionId) {
    return res.status(400).json({ error: 'Dados inválidos.' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4', // ou 'gpt-3.5-turbo'
      messages: [
        { role: 'system', content: 'Você é um assistente útil e educado.' },
        { role: 'user', content: message }
      ]
    });

    const reply = completion.choices[0].message.content || 'Desculpe, sem resposta.';

    return res.json({ response: reply });
  } catch (error) {
    console.error('Erro na OpenAI:', error);
    return res.status(500).json({ error: 'Erro ao conectar com o modelo.' });
  }
});


app.listen(port, () => {
  console.log(`🚀 API rodando em http://localhost:${port}/api/chat`);
});
