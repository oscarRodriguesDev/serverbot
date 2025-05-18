import express from 'express'; 
import bodyParser from 'body-parser';
import { Configuration, OpenAIApi } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3000;

app.use(bodyParser.json());

const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
}));

app.post('/api/chat', async (req:any, res:any) => {
  const { message, sessionId } = req.body;

  if (!message || !sessionId) {
    return res.status(400).json({ error: 'Dados inválidos.' });
  }

  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-4', // ou 'gpt-3.5-turbo'
      messages: [
        { role: 'system', content: 'Você é um assistente útil e educado.' },
        { role: 'user', content: message }
      ]
    });

    const reply = completion.data.choices[0].message?.content || 'Desculpe, não consegui gerar uma resposta.';

    res.json({ response: reply });
  } catch (error) {
    console.error('Erro na OpenAI:', error);
    res.status(500).json({ error: 'Erro ao conectar com o modelo.' });
  }
});

app.listen(port, () => {
  console.log(`🚀 API rodando em http://localhost:${port}/api/chat`);
});
