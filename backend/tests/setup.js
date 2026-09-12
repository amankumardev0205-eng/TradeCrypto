// Set test environment variables to isolate testing environment
process.env.NODE_ENV = 'test';
process.env.PORT = '5001';
process.env.JWT_SECRET = 'test_jwt_secret_key_12345';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_key_12345';
