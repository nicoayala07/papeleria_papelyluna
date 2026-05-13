function shouldRemoveKey(key) {
  return key.endsWith('_id') || key.endsWith('Id');
}

function toPlainObject(data) {
  if (data instanceof Date) return data;
  if (data && typeof data.toJSON === 'function') return data.toJSON();
  return data;
}

function stripIdSuffixes(data) {
  const plainData = toPlainObject(data);

  if (Array.isArray(plainData)) return plainData.map(stripIdSuffixes);
  if (!plainData || typeof plainData !== 'object' || plainData instanceof Date) {
    return plainData;
  }

  const cleaned = {};
  for (const [key, value] of Object.entries(plainData)) {
    if (shouldRemoveKey(key)) continue;
    cleaned[key] = stripIdSuffixes(value);
  }

  return cleaned;
}

function sanitizeIds(req, res, next) {
  const originalJson = res.json.bind(res);
  res.json = (body) => originalJson(stripIdSuffixes(body));
  next();
}

module.exports = sanitizeIds;
module.exports.stripIdSuffixes = stripIdSuffixes;
