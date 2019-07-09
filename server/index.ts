import next from 'next';
import express from 'express';

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const expressServer = express();

  expressServer.get('*', (req: any, res: any) => handle(req, res));

  expressServer.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`);
  });
});
