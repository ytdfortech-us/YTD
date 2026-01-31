# Mobile Database Integration Setup

This document explains how to set up database integration for the mobile app.

## Overview

The mobile app connects to the database through secure API endpoints on the web backend. The web backend handles all database queries to the Neon PostgreSQL database.

## Architecture

```
Mobile App → HTTP requests → Web API Endpoints → Neon PostgreSQL Database
```

## Setup Instructions

### 1. Database Schema Setup

First, run the database schema to create the required tables:

```sql
-- Run the schema file in your PostgreSQL database
-- File: apps/web/src/app/api/mobile/schema.sql
```

### 2. Environment Variables

#### Web Backend (.env)

Add these variables to your web app's environment:

```bash
# Database connection (already configured)
DATABASE_URL=postgresql://username:password@host:port/database

# API key for mobile app authentication
MOBILE_API_KEY=your-secure-api-key-here

# CORS origins (add your mobile app's domain)
CORS_ORIGINS=http://localhost:8081,https://your-mobile-domain.com
```

#### Mobile App (.env)

Add these variables to your mobile app's environment:

```bash
# Base URL for your web backend
EXPO_PUBLIC_BASE_URL=https://your-backend-domain.com

# API key for database authentication
EXPO_PUBLIC_API_KEY=your-secure-api-key-here

# Project configuration (already configured)
EXPO_PUBLIC_PROJECT_GROUP_ID=your-project-group-id
EXPO_PUBLIC_HOST=your-host-domain.com
```

### 3. Generate API Key

To generate a new API key for mobile authentication, you can use the provided utility:

```javascript
// In your web backend, run this to generate an API key
import { generateApiKey } from './src/app/api/middleware/dbAuth.js';

const result = await generateApiKey(
  'Mobile App Key',           // name
  ['read:profile', 'write:profile', 'read:fatigue', 'write:fatigue', 'read:wellness', 'write:wellness', 'read:community', 'write:community', 'read:parking', 'write:parking'], // scopes
  null                        // expires_at (null for no expiration)
);

console.log('Generated API Key:', result.apiKey);
```

### 4. Initialize Mobile Database Client

In your mobile app, initialize the database client with the API key:

```javascript
import { initializeDatabase } from './src/utils/database';

// Initialize with your API key
await initializeDatabase('your-api-key-here');
```

### 5. API Endpoints

The following API endpoints are available for the mobile app:

#### User Profiles
- `GET /api/mobile/profile/:userId` - Get user profile
- `POST /api/mobile/profile` - Create/update profile
- `PATCH /api/mobile/profile/:userId` - Update specific fields

#### Fatigue Checks
- `POST /api/mobile/fatigue-check` - Submit fatigue check result
- `GET /api/mobile/fatigue-check/history/:userId` - Get user's check history

#### Wellness
- `GET /api/mobile/wellness/activities` - Get available activities
- `POST /api/mobile/wellness/complete` - Mark activity complete
- `GET /api/mobile/wellness/stats/:userId` - Get user stats/points

#### Community
- `GET /api/mobile/community/posts` - List community posts
- `POST /api/mobile/community/posts` - Create new post
- `GET /api/mobile/community/posts/:postId` - Get specific post

#### Parking
- `GET /api/mobile/parking/locations` - Search parking locations
- `POST /api/mobile/parking/locations` - Add parking location
- `GET /api/mobile/parking/locations/:locationId` - Get location details

## Usage Examples

### Loading User Profile

```javascript
import { databaseClient } from './src/utils/database';

// Load user profile
const profile = await databaseClient.getUserProfile('user-id');
console.log('User name:', profile.name);
console.log('Streak:', profile.streak_count);
```

### Submitting Fatigue Check

```javascript
const fatigueData = {
  userId: 'user-id',
  alertnessScore: 7,
  fatigueLevel: 'moderate',
  symptoms: ['drowsiness', 'heavy_eyelids'],
  recommendations: ['take_break', 'drink_water'],
  locationLat: 40.7128,
  locationLng: -74.0060
};

await databaseClient.submitFatigueCheck(fatigueData);
```

### Completing Wellness Activity

```javascript
await databaseClient.completeWellnessActivity({
  userId: 'user-id',
  activityId: 'activity-id',
  notes: 'Completed morning stretch routine'
});
```

### Getting Community Posts

```javascript
const posts = await databaseClient.getCommunityPosts({
  limit: 10,
  category: 'general'
});
```

## Security Considerations

1. **API Key Storage**: API keys are stored securely in the mobile app using Expo SecureStore
2. **HTTPS Only**: All API calls must use HTTPS in production
3. **Rate Limiting**: Consider implementing rate limiting on database endpoints
4. **Input Validation**: All inputs are validated on the server side
5. **Scope-based Permissions**: API keys can have specific scopes for different operations

## Troubleshooting

### Common Issues

1. **API Key Not Found**: Ensure the API key is properly set in environment variables
2. **CORS Errors**: Make sure your mobile app's domain is added to CORS_ORIGINS
3. **Database Connection**: Verify DATABASE_URL is correctly configured
4. **Authentication Errors**: Check that the API key has the required scopes

### Debug Mode

Enable debug logging by setting:

```bash
# In your mobile app
EXPO_PUBLIC_DEBUG=true
```

This will log all database API calls and responses.

## Testing

### Test API Endpoints

You can test the API endpoints using curl:

```bash
# Test profile endpoint
curl -X GET "https://your-backend.com/api/mobile/profile/user-id" \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json"

# Test fatigue check submission
curl -X POST "https://your-backend.com/api/mobile/fatigue-check" \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"userId":"user-id","alertnessScore":7,"fatigueLevel":"moderate"}'
```

## Production Deployment

1. **Generate Production API Key**: Create a new API key specifically for production
2. **Update Environment Variables**: Set production URLs and keys
3. **Test All Endpoints**: Verify all API endpoints work correctly
4. **Monitor Usage**: Set up monitoring for API usage and errors
5. **Backup Database**: Ensure regular database backups are configured

## Support

For issues or questions about the mobile database integration:

1. Check the console logs for error messages
2. Verify environment variables are set correctly
3. Test API endpoints directly using curl or Postman
4. Check database connection and schema setup


