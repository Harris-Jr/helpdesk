const clients = new Map();

function send(res, event) {
  res.write(`data: ${JSON.stringify(event)}\n\n`);
}

export function realtimeRoute(req, res) {
  const entity = req.params.entity;
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  if (!clients.has(entity)) clients.set(entity, new Set());
  clients.get(entity).add(res);
  send(res, { type: 'connected', entity, data: null });

  req.on('close', () => {
    clients.get(entity)?.delete(res);
  });
}

export function broadcastEntity(entity, type, data) {
  const event = { type, entity, data };
  for (const res of clients.get(entity) || []) {
    try {
      send(res, event);
    } catch {
      clients.get(entity)?.delete(res);
    }
  }
}
