process.env.DATABASE_URL ??= "postgres://test:test@localhost:5432/bus_test";
process.env.JWT_SECRET ??= "test-jwt-secret-value";
process.env.REDIS_URL ??= "redis://localhost:6379";
process.env.STRIPE_SECRET_KEY ??= "sk_test_123";
process.env.STRIPE_WEBHOOK_SECRET ??= "whsec_test_123";
process.env.FRONTEND_URL ??= "http://localhost:3000";

export {};
