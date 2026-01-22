# Piston Setup Instructions

## Development Setup

1. **Start Piston locally:**
   ```bash
   cd be/piston
   ./start-dev.sh
   ```

2. **Verify installation:**
   ```bash
   curl http://localhost:2000/api/v2/runtimes
   ```

3. **Start your backend:**
   ```bash
   cd ../
   npm start
   ```

## Production Setup

1. **Deploy Piston:**
   ```bash
   cd be/piston
   ./deploy-prod.sh
   ```

2. **Configure environment:**
   - Copy `.env.production` to `.env`
   - Update production values

3. **Start backend:**
   ```bash
   NODE_ENV=production npm start
   ```

## Benefits of Self-Hosted Piston

- ✅ **Unlimited requests** (no rate limits)
- ✅ **Better performance** (local network)
- ✅ **Custom configuration** (timeouts, memory limits)
- ✅ **Security control** (isolated environment)
- ✅ **Cost effective** (no API fees)

## Monitoring

Check Piston health:
```bash
curl http://localhost:2000/api/v2/runtimes
```

View logs:
```bash
docker logs piston_api  # Development
docker logs piston_production  # Production
```

## Troubleshooting

1. **Container won't start:**
   ```bash
   docker-compose logs piston
   ```

2. **Port conflicts:**
   - Change port in docker-compose.yml
   - Update PISTON_API_URL in .env

3. **Memory issues:**
   - Increase Docker memory limits
   - Adjust container resource limits