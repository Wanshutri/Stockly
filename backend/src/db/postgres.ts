import { Pool, QueryResult } from 'pg';
import config from '../config/config';

const connectionString = config.databaseUrl;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set in environment variables');
}

const pool = new Pool({ connectionString });

export const query = (text: string, params?: any[]): Promise<QueryResult<any>> => {
  return pool.query(text, params);
};

export default pool;
