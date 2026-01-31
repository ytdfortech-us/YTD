# Neon Database Authentication Integration Guide

This guide explains how to integrate direct Neon database authentication into your mobile app.

## Setup

1. **Install Dependencies**

```bash
npm install @neondatabase/serverless
```

2. **Environment Variables**

Ensure your `.env` file contains:

```
EXPO_PUBLIC_NEON_DATABASE_URL=postgres://your-username:your-password@your-neon-host/your-database
```

## Integration Steps

### 1. Add to App Entry Point

In your `App.js` or main component:

```jsx
import { NeonAuthModal } from './src/utils/auth/NeonAuthModal';

export default function App() {
  return (
    <>
      {/* Your existing app components */}
      <NeonAuthModal />
    </>
  );
}
```

### 2. Use Authentication in Components

```jsx
import { useAuth } from './src/utils/auth/useAuth';
import { neonAuth } from './src/utils/auth/neonAuth';

function MyProtectedComponent() {
  const { isAuthenticated, signIn } = useAuth();
  
  // Initialize Neon Auth
  useEffect(() => {
    neonAuth.initialize();
  }, []);
  
  if (!isAuthenticated) {
    return (
      <View>
        <Text>Please sign in to access this content</Text>
        <Button title="Sign In" onPress={signIn} />
      </View>
    );
  }
  
  return (
    <View>
      <Text>Protected Content</Text>
    </View>
  );
}
```

### 3. Access User Profile

```jsx
const fetchUserProfile = async () => {
  const result = await neonAuth.getUserProfile();
  if (result.success) {
    // Use profile data
    console.log(result.profile);
  }
};
```

## Authentication Flow

1. **Sign In**: Uses `auth_users` and `auth_accounts` tables to verify credentials
2. **Sign Up**: Creates new entries in `auth_users`, `auth_accounts`, and `user_profiles` tables
3. **Profile**: Retrieves user data from `user_profiles` joined with `auth_users`

## Database Tables

The implementation uses these tables:

- `auth_users`: Core user information (id, email, name)
- `auth_accounts`: Authentication credentials and providers
- `auth_sessions`: User sessions management
- `user_profiles`: Extended user information and preferences

## Security Considerations

- Passwords should be properly hashed in production (update the `neonAuth.js` file)
- Use SSL for database connections
- Consider implementing token expiration and refresh logic
- Add rate limiting for authentication attempts

## Example Implementation

See the complete example in `/src/examples/NeonAuthExample.jsx`