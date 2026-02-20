const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const adminHash = await bcrypt.hash('Denskie123', 12);
    await prisma.user.upsert({
        where: { username: 'denskie' },
        update: {},
        create: {
            username: 'denskie',
            name: 'Denskie (Admin)',
            passwordHash: adminHash,
            role: 'admin',
            gradeLevel: 'all',
        },
    });

    await prisma.resource.upsert({
        where: { slug: 'quipper' },
        update: {},
        create: {
            name: 'Quipper',
            slug: 'quipper',
            description: 'Quipper eBook library for K-12 curricula.',
            driveFolderId: '1x3X9hRWjqzHnSyPYYMu4b_Suupu3oXspUJCB6gKBq-En3xQjfimf3jcAOpOqnBeTE9m6QskX',
            icon: '📘',
            color: '#6366f1',
            sortOrder: 0,
        },
    });

    await prisma.resource.upsert({
        where: { slug: 'phoenix' },
        update: {},
        create: {
            name: 'Phoenix',
            slug: 'phoenix',
            description: 'Phoenix eBook library.',
            driveFolderId: 'PLACEHOLDER_PHOENIX_FOLDER_ID',
            icon: '🔥',
            color: '#f59e0b',
            sortOrder: 1,
        },
    });

    console.log('Seed complete: admin user + 2 resources');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
