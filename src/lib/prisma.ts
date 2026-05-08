import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Em serverless (Vercel), cada função deve usar no máximo 1 conexão por instância.
// O Pool do `pg` por padrão abre até 10, esgotando o banco rapidamente.
const pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
    max: 1,              // Máximo de 1 conexão por instância serverless
    idleTimeoutMillis: 10_000,  // Fecha conexões ociosas após 10s
    connectionTimeoutMillis: 10_000, // Timeout para obter conexão do pool
});

const adapter = new PrismaPg(pool);

const globalForPrisma = global as unknown as {
    prisma: PrismaClient;
};

const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({ adapter });

globalForPrisma.prisma = prisma;

export default prisma;