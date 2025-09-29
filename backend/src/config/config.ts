import dotenv from 'dotenv';

dotenv.config();

interface Config {
    port: number;
    nodeEnv: string;
    postgresUrl: string;
    postgresUser: string;
    postgresPassword: string;
    postgresDb: string;
    databaseUrl?: string;
    jwtSecret: string;

}

const config: Config = {
    port: Number(process.env.PORT) || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    postgresUrl: process.env.POSTGRESURL || 'localhost',
    postgresUser: process.env.POSTGRESUSER || 'postgres',
    postgresPassword: process.env.POSTGRESPASSWORD || 'mysecretpassword', // Quitar para produccion
    postgresDb: process.env.POSTGRESDB || 'stockly',
    jwtSecret: process.env.JWT_SECRET || 'change-me-in-prod'

};

// print config for debugging
if (config.nodeEnv == 'development') {
    for (const [key, value] of Object.entries(config)) {
        console.log(`${key}: ${value}`);
    }
}

export default config;