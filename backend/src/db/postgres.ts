import { Pool, QueryResult } from 'pg';
import config from '../config/config';

const connectionString = config.postgresUrl;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set in environment variables');
}

const pool = new Pool({ host: config.postgresUrl, 
                        user: config.postgresUser, 
                        password: config.postgresPassword,
                        database: config.postgresDb,});

export const query = (text: string, params?: any[]): Promise<QueryResult<any>> => {
  return pool.query(text, params);
};

export default pool;
