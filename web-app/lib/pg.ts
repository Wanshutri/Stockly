import { Pool } from 'pg';

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

        this.connectWithRetry(5, 2000); // 5 intentos, 2s de retraso
    }

    private async connectWithRetry(retries: number, delayMs: number) {
        for (let i = 0; i < retries; i++) {
            try {
                await this.pool.connect();
                console.log('Conectado a PostgreSQL');
                return;
            } catch (err) {
                console.error(`Intento ${i + 1} fallido. Reintentando en ${delayMs / 1000}s...`, err);
                if (i < retries - 1) {
                    await new Promise(res => setTimeout(res, delayMs));
                } else {
                    console.error('No se pudo conectar a PostgreSQL después de varios intentos.');
                    process.exit(1); // Opcional: termina la app si no se conecta
                }
            }
        }
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
