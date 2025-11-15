import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

class PostgresDB {
    private static instance: PostgresDB;
    private pool: Pool;

    private constructor() {
        this.pool = new Pool({
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_DATABASE,
            password: process.env.DB_PASSWORD,
            port: Number(process.env.DB_PORT) || 5432,
        });

        this.pool.connect()
            .then(() => console.log('Conectado a PostgreSQL'))
            .catch(err => console.error('Error conectando a PostgreSQL', err));
    }

    public static getInstance(): PostgresDB {
        if (!PostgresDB.instance) {
            PostgresDB.instance = new PostgresDB();
        }
        return PostgresDB.instance;
    }

    public query(text: string, params?: any[]) {
        return this.pool.query(text, params);
    }

    public getPool(): Pool {
        return this.pool;
    }
}

export default PostgresDB.getInstance();
