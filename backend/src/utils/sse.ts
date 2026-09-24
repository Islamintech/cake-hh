import type { Request, Response } from 'express';

export type SseSend = (event: string, data: unknown) => void;

/** Open a Server-Sent Events response. Returns send(event, data); onClose runs when the client leaves. */
export function openSse(req: Request, res: Response, onClose?: () => void): SseSend {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no', // disable proxy buffering (nginx)
  });
  res.write('retry: 3000\n\n');
  const send: SseSend = (event, data) => { res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`); };
  const beat = setInterval(() => res.write(': ping\n\n'), 25000);
  req.on('close', () => { clearInterval(beat); onClose?.(); });
  return send;
}
