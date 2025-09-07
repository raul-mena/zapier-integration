# Wistia Zapier Integration

A robust, production-ready Zapier integration for Wistia that enables automated workflows between Wistia and thousands of other apps. This integration provides triggers for new/updated media and actions for creating projects.

**Current Version:** 1.0.3 - Production-ready with enhanced cursor management, robust error handling, and publishing readiness.

## 🚀 Quickstart

### 1. Register or Link Your Integration

**For new integrations:**
```bash
zapier register "Your Wistia Integration Name"
```

**For existing integrations:**
```bash
zapier link
```

### 2. Get Your Wistia API Token

1. Log into your Wistia account
2. Go to **Account Settings** → **API**
3. Click **"Generate new token"**
4. Copy the generated token (keep it secure!)

### 3. Build and Deploy

```bash
# Install dependencies
npm install

# Build the integration
npm run build

# Validate the integration
zapier validate

# Push to Zapier platform
zapier push
```

### 4. Test in Zap Editor

1. Go to [zapier.com/app/editor](https://zapier.com/app/editor)
2. Create a new Zap
3. Search for your integration name
4. Connect using your Wistia API token
5. Test the trigger and action

**Testing the Trigger:**
- **Sample Mode**: Returns static sample data without API calls
- **Real Mode**: Fetches actual media from your Wistia account
- **Limit Handling**: Respects `bundle.meta.limit` for testing

**Testing the Action:**
- Creates a real project in your Wistia account
- Validates project name (trimmed, non-empty)
- Returns project details for next Zap steps

### 5. View Task History

Monitor your Zap's performance:
1. Go to **My Zaps** in Zapier dashboard
2. Click on your Zap
3. View **Task History** tab for execution logs and errors

## 🚀 Features

- **New/Updated Media Trigger**: Automatically trigger workflows when media is created or updated in Wistia
- **Create Project Action**: Create new projects in Wistia from other apps
- **Bearer Token Authentication**: Secure API authentication using Wistia API tokens
- **Advanced Error Handling**: Robust error recovery and graceful failure handling
- **Rate Limiting Handling**: Built-in throttling and error handling for API limits
- **TypeScript Support**: Full type safety with Zod schema validation
- **Flexible Data Types**: Handles mixed data types from Wistia API automatically
- **Environment Configuration**: Flexible configuration using environment variables
- **Production Stability**: Enhanced cursor management and polling reliability

## 📋 Prerequisites

- Node.js 18+ and npm
- Zapier CLI installed globally: `npm install -g zapier-platform-cli`
- Wistia account with API access
- Wistia API token ([Get yours here](https://wistia.com/support/developers/data-api#authentication))

## 🛠️ Installation & Setup

### 1. Clone and Install Dependencies

```bash
git clone https://github.com/raul-mena/zapier-integration.git
cd zapier-integration
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure your API credentials:

```bash
cp .env.example .env
```

Edit `.env` file with your Wistia API token:

```env
# Wistia API Configuration
WISTIA_API_TOKEN=your_actual_wistia_api_token_here
WISTIA_API_BASE_URL=https://api.wistia.com/v1
```

### 3. Build the Project

```bash
npm run build
```

### 4. Run Tests

```bash
npm test
```

## 🏗️ Project Architecture

### Directory Structure

```
src/
├── config.ts              # Environment configuration and API endpoints
├── index.ts               # Main app definition and entry point
├── authentication.ts      # Wistia API authentication setup
├── middleware.ts          # Request/response middleware (auth, error handling)
├── schemas.ts             # Zod schemas for data validation
├── creates/
│   └── create_project.ts  # Create project action implementation
├── triggers/
│   └── new_media.ts       # New/updated media trigger implementation
└── test/                  # Comprehensive test suite
    ├── authentication.test.ts
    ├── creates/
    │   └── create_project.test.ts
    └── triggers/
        └── new_media.test.ts
```

### Key Components

#### 1. **Authentication System** (`authentication.ts`)

- Bearer token authentication using Wistia API tokens
- Automatic token validation via account endpoint
- Secure credential management

#### 2. **Middleware Layer** (`middleware.ts`)

- **Authentication Middleware**: Automatically adds Bearer tokens to requests
- **Error Handling Middleware**: Manages API errors and rate limiting
- **Throttling Support**: Handles 429 rate limit responses with retry logic

#### 3. **Configuration Management** (`config.ts`)

- Centralized environment variable management using dotenv
- API endpoint configuration with fallback values
- Type-safe configuration exports

#### 4. **Data Validation** (`schemas.ts`)

- Zod schemas for runtime type validation with flexible type handling
- Automatic type conversion for mixed API responses (string/number IDs)
- Input sanitization and validation
- Type inference for TypeScript integration
- Graceful handling of malformed data

#### 5. **Triggers** (`triggers/new_media.ts`)

- Polling-based trigger for new/updated media with enhanced stability
- Robust cursor-based pagination for efficient data retrieval
- Automatic deduplication using timestamps
- Individual item parsing with graceful failure recovery
- Comprehensive error logging and debugging support
- Handles empty responses and API inconsistencies
- Production-ready polling with proper high-watermark management

#### 6. **Actions** (`creates/create_project.ts`)

- Project creation with validated input
- Proper error handling and response processing
- Form-encoded request body for Wistia API compatibility

## 🔧 Development

### Available Scripts

```bash
# Clean build artifacts
npm run clean

# Build TypeScript to JavaScript
npm run build

# Run tests with coverage
npm test

# Internal Zapier build script
npm run _zapier-build
```

### Development Workflow

1. **Make Changes**: Edit TypeScript files in `src/`
2. **Build**: Run `npm run build` to compile TypeScript
3. **Test**: Run `npm test` to ensure everything works
4. **Deploy**: Use Zapier CLI commands to push changes

### Testing Strategy

The project includes comprehensive tests for:

- Authentication middleware functionality
- API endpoint integration
- Error handling and edge cases
- Data validation and schema compliance

## 🚀 Deployment

### 1. Register with Zapier (First Time)

```bash
zapier register "Wistia Integration"
```

### 2. Link to Existing Integration

```bash
zapier link
```

### 3. Deploy to Zapier

```bash
zapier push
```

### 4. Test Integration

```bash
zapier test
```

## 📖 How It Works

### Authentication Flow

1. User provides Wistia API token in Zapier
2. Integration validates token against Wistia account endpoint
3. Bearer token automatically added to all subsequent requests
4. Middleware handles authentication errors and retries

### Trigger Workflow (New/Updated Media)

1. **Polling**: Zapier polls Wistia API every few minutes
2. **Cursor Management**: Uses timestamp-based cursor for efficient pagination
3. **Deduplication**: Filters out already-processed media using update timestamps
4. **Data Processing**: Validates and transforms media data using Zod schemas
5. **Trigger Execution**: Sends new/updated media to connected Zapier workflows

### Action Workflow (Create Project)

1. **Input Validation**: Validates project data using Zod schemas
2. **API Request**: Sends POST request to Wistia projects endpoint
3. **Error Handling**: Manages API errors and provides user feedback
4. **Response Processing**: Returns created project data to Zapier

### Error Handling

- **Rate Limiting**: Automatic retry with exponential backoff for 429 responses
- **API Errors**: Descriptive error messages for 4xx/5xx responses
- **Validation Errors**: Clear feedback for invalid input data
- **Network Issues**: Graceful handling of connection problems
- **Data Type Mismatches**: Automatic conversion between string/number types
- **Partial Failures**: Continue processing when individual items fail
- **Empty Responses**: Graceful handling of accounts with no media
- **Cursor Failures**: Robust cursor management with fallback strategies

## 🔒 Security

- API tokens stored securely in environment variables
- No hardcoded credentials in source code
- Bearer token authentication for all API requests
- Input validation prevents injection attacks
- Error messages don't expose sensitive information

## 🧪 Testing

### Automated Test Suite

Run the test suite to verify functionality:

```bash
# Run all tests
npm test

# Run local testing harness
npm run test:local

# Tests include:
# - Authentication middleware
# - API endpoint integration
# - Error handling scenarios
# - Data validation
# - Mock API responses
```

### Local Testing Harness

Test your integration locally with real API calls:

1. **Setup Environment:**
   ```bash
   cp .env.example .env
   # Edit .env and add your WISTIA_API_TOKEN
   ```

2. **Run Local Tests:**
   ```bash
   npm run test:local
   ```

3. **Validate Output:**
   - Authentication test should return account info
   - Trigger test should return media array
   - Action test should create a project and return details

### Manual Testing in Zapier Editor

**Trigger Testing:**
- Test with "Load Sample" (should return quickly without API calls)
- Test with "Test Trigger" (should fetch real data)
- Verify cursor management between test runs
- Check limit handling with different values

**Action Testing:**
- Test project creation with valid names
- Test validation with empty/whitespace names
- Verify error handling with invalid tokens
- Check response format matches output fields

## 📚 API Reference

### Wistia Endpoints Used

- `GET /v1/account.json` - Authentication validation
- `GET /v1/medias.json` - Fetch media for trigger (with proper JSON endpoint)
- `POST /v1/projects.json` - Create new projects

### Environment Variables

| Variable              | Required | Default                     | Description           |
| --------------------- | -------- | --------------------------- | --------------------- |
| `WISTIA_API_TOKEN`    | Yes      | -                           | Your Wistia API token |
| `WISTIA_API_BASE_URL` | No       | `https://api.wistia.com/v1` | Wistia API base URL   |

## 🔗 Useful Links

- [Zapier Platform CLI](https://github.com/zapier/zapier-platform/tree/main/packages/cli)
- [Wistia API Documentation](https://wistia.com/support/developers/data-api)
- [Zapier Integration Guidelines](https://platform.zapier.com/)
