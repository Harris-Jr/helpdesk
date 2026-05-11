export function toRecord(row) {
  if (!row) return null;
  return {
    id: row.id,
    created_by: row.created_by,
    created_date: row.created_date,
    updated_date: row.updated_date,
    ...(row.data || {})
  };
}

export function sanitizeSort(sort = '-created_date') {
  const desc = String(sort || '').startsWith('-');
  const field = String(sort || '-created_date').replace(/^-/, '');
  if (!/^[a-zA-Z0-9_]+$/.test(field)) return { field: 'created_date', desc: true };
  return { field, desc };
}

export function sortSql(sort) {
  const { field, desc } = sanitizeSort(sort);
  const direction = desc ? 'DESC' : 'ASC';
  if (field === 'created_date' || field === 'updated_date' || field === 'created_by' || field === 'id') {
    return `${field} ${direction}`;
  }
  return `LOWER(data->>'${field}') ${direction} NULLS LAST`;
}
