# OAuth Authentication Setup Guide

This guide will help you set up Google and LinkedIn OAuth authentication for your Alumni Portal.

## Prerequisites

- Node.js and npm installed
- MongoDB running locally or remotely
- Google Cloud Console account
- LinkedIn Developer account

## Step 1: Google OAuth Setup

### 1.1 Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API

### 1.2 Create OAuth 2.0 Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - `https://yourdomain.com/api/auth/callback/google` (for production)
5. Copy the Client ID and Client Secret

### 1.3 Configure Environment Variables
Add these to your `.env.local` file:
```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## Step 2: LinkedIn OAuth Setup

### 2.1 Create LinkedIn App
1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Click "Create App"
3. Fill in the required information
4. Submit for review (may take 1-2 business days)

### 2.2 Configure OAuth Settings
1. In your app, go to "Auth" tab
2. Add redirect URLs:
   - `http://localhost:3000/api/auth/callback/linkedin` (for development)
   - `https://yourdomain.com/api/auth/callback/linkedin` (for production)
3. Copy the Client ID and Client Secret

### 2.3 Configure Environment Variables
Add these to your `.env.local` file:
```env
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
```

## Step 3: NextAuth Configuration

### 3.1 Generate NextAuth Secret
Generate a random secret for NextAuth:
```bash
openssl rand -base64 32
```

### 3.2 Add to Environment Variables
```env
NEXTAUTH_SECRET=your-generated-secret
NEXTAUTH_URL=http://localhost:3000
```

## Step 4: Database Setup

### 4.1 MongoDB Collections
The OAuth system will automatically create these collections:
- `accounts` - OAuth account information
- `sessions` - User sessions
- `users` - User profiles
- `verification_tokens` - Email verification tokens

### 4.2 User Data Structure
OAuth users will be created with this structure:
```json
{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "userType": "", // User must choose during profile completion
  "profilePicture": "https://...",
  "oauthProvider": "google",
  "oauthId": "123456789",
  "isActive": true,
  "isProfileComplete": false, // Flag to indicate profile needs completion
  "showEmailInProfile": true,
  "showPhoneInProfile": false,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Note**: OAuth users will be redirected to `/setup-profile` to choose their user type (student or alumni) and complete their profile before accessing the main application.

## Step 5: Testing

### 5.1 Start Development Server
```bash
npm run dev
```

### 5.2 Test OAuth Flow
1. Go to `/auth/login` or `/auth/register`
2. Click "Continue with Google" or "Continue with LinkedIn"
3. Complete the OAuth flow
4. Verify user is created in MongoDB with `userType: ""` and `isProfileComplete: false`
5. User will be redirected to `/setup-profile` to choose user type and department
6. After profile completion, user can access the main application

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI" error**
   - Ensure redirect URIs in OAuth provider match exactly
   - Check for trailing slashes or protocol mismatches

2. **"Client ID not found" error**
   - Verify environment variables are set correctly
   - Restart development server after adding env vars

3. **Database connection issues**
   - Check MongoDB is running
   - Verify MONGODB_URI is correct

4. **OAuth callback errors**
   - Ensure NEXTAUTH_URL is set correctly
   - Check that callback routes are accessible

### Debug Mode
Enable debug logging by adding to `.env.local`:
```env
NEXTAUTH_DEBUG=true
```

## Security Considerations

1. **Environment Variables**
   - Never commit `.env.local` to version control
   - Use strong, unique secrets for production

2. **OAuth Scopes**
   - Only request necessary permissions
   - Review OAuth app permissions regularly

3. **User Data**
   - Validate and sanitize all OAuth data
   - Implement proper session management

## Production Deployment

1. Update redirect URIs to production domain
2. Use strong, unique NEXTAUTH_SECRET
3. Set NEXTAUTH_URL to production URL
4. Configure MongoDB connection for production
5. Set up proper SSL/TLS certificates

## Support

If you encounter issues:
1. Check the NextAuth documentation
2. Review OAuth provider documentation
3. Check browser console for errors
4. Verify environment variables are loaded
5. Check MongoDB connection and collections
