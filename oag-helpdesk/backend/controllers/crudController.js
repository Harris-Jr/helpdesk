import { query } from '../config/db.js';
import { getEntityConfig } from '../config/entityDefinitions.js';
import { toRecord, sortSql } from '../utils/records.js';
import { broadcastEntity } from '../utils/socket.js';

function parseFilter(raw) {
  if (!raw) return {};
  if (typeof raw === 'object') return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function createCrudController(entityName, hooks = {}) {
  const { table } = getEntityConfig(entityName);

  return {
    async list(req, res, next) {
      try {
        const filters = parseFilter(req.query.filter);
        const limit = Math.min(Number(req.query.limit || 100), 1000);
        const orderBy = sortSql(req.query.sort);
        const result = await query(
          `SELECT * FROM ${table}
           WHERE ($1::jsonb = '{}'::jsonb OR data @> $1::jsonb)
           ORDER BY ${orderBy}
           LIMIT $2`,
          [JSON.stringify(filters), limit]
        );
        res.json(result.rows.map(toRecord));
      } catch (error) {
        next(error);
      }
    },

    async getById(req, res, next) {
      try {
        const result = await query(`SELECT * FROM ${table} WHERE id = $1`, [req.params.id]);
        const record = toRecord(result.rows[0]);
        if (!record) return res.status(404).json({ message: `${entityName} not found` });
        return res.json(record);
      } catch (error) {
        next(error);
      }
    },

    async create(req, res, next) {
      try {
        const body = await hooks.beforeCreate?.(req.body, req) || req.body || {};
        const createdBy = body.created_by || req.access?.actorEmail || req.user?.email || null;
        const result = await query(
          `INSERT INTO ${table} (data, created_by)
           VALUES ($1::jsonb, $2)
           RETURNING *`,
          [JSON.stringify(body), createdBy]
        );
        const record = toRecord(result.rows[0]);
        await hooks.afterCreate?.(record, req);
        broadcastEntity(entityName, 'create', record);
        return res.status(201).json(record);
      } catch (error) {
        next(error);
      }
    },

    async update(req, res, next) {
      try {
        const patch = await hooks.beforeUpdate?.(req.body, req) || req.body || {};
        const result = await query(
          `UPDATE ${table}
           SET data = data || $1::jsonb, updated_date = now()
           WHERE id = $2
           RETURNING *`,
          [JSON.stringify(patch), req.params.id]
        );
        const record = toRecord(result.rows[0]);
        if (!record) return res.status(404).json({ message: `${entityName} not found` });
        await hooks.afterUpdate?.(record, req);
        broadcastEntity(entityName, 'update', record);
        return res.json(record);
      } catch (error) {
        next(error);
      }
    },

    async delete(req, res, next) {
      try {
        const result = await query(`DELETE FROM ${table} WHERE id = $1 RETURNING *`, [req.params.id]);
        const record = toRecord(result.rows[0]);
        if (!record) return res.status(404).json({ message: `${entityName} not found` });
        broadcastEntity(entityName, 'delete', record);
        return res.json({ success: true, id: req.params.id });
      } catch (error) {
        next(error);
      }
    }
  };
}
