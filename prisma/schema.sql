-- Users table
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "username" TEXT UNIQUE NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'student',
    "gradeLevel" TEXT,
    "avatar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Resources table
CREATE TABLE IF NOT EXISTS "Resource" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT UNIQUE NOT NULL,
    "slug" TEXT UNIQUE NOT NULL,
    "description" TEXT,
    "driveFolderId" TEXT NOT NULL,
    "icon" TEXT DEFAULT '📚',
    "color" TEXT DEFAULT 'indigo',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Index for authentication
CREATE INDEX IF NOT EXISTS "User_username_idx" ON "User"("username");
CREATE INDEX IF NOT EXISTS "Resource_slug_idx" ON "Resource"("slug");
