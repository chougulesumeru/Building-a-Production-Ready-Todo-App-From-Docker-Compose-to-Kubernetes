const express = require('express');
const { Pool } = require('pg');
const redis = require('redis');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const pgPool = new Pool({ connectionString: process.env.DATABASE_URL });
const redisClient = redis.createClient({ url: process.env.REDIS_URL });

redisClient.connect();

app.get('/api/todos', async (req, res) => {
  const cached = await redisClient.get('todos');
  if (cached) return res.json(JSON.parse(cached));

  const { rows } = await pgPool.query('SELECT * FROM todos');
  await redisClient.set('todos', JSON.stringify(rows), { EX: 60 }); // Cache 1 min
  res.json(rows);
});

app.post('/api/todos', async (req, res) => {
  const { text } = req.body;
  const { rows } = await pgPool.query('INSERT INTO todos (text) VALUES ($1) RETURNING *', [text]);
  await redisClient.del('todos'); // Invalidate cache
  res.json(rows[0]);
});

const initDb = async () => {
  await pgPool.query('CREATE TABLE IF NOT EXISTS todos (id SERIAL PRIMARY KEY, text VARCHAR(255))');
};
initDb();

app.listen(3001, () => console.log('Backend on 3001'));