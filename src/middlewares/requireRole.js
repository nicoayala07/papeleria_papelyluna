module.exports = (requiredRole) => (req, res, next) => {
  if (!req.user)
    return res.status(401).json({ error: 'No autenticado' });
  if (req.user.role !== requiredRole)
    return res.status(403).json({ error: `Acceso prohibido. Se requiere rol ${requiredRole}.` });
  next();
};