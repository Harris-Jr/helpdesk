export function applyAccessContext(req, _res, next) {
  req.access = {
    actorEmail: req.user?.email || req.body?.created_by || req.query?.created_by || 'system',
    role: req.user?.role || 'guest'
  };
  next();
}
