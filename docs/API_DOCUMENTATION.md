# AI Workout Backend - API Documentation

## Base URL
- **Production**: `https://ai-workout-backend-2024.web.app/api`
- **Development**: `http://localhost:3000`

## Authentication

All API endpoints (except health checks) require Firebase Authentication.

### Headers
```
Authorization: Bearer <firebase_id_token>
Content-Type: application/json
```

## Health & Monitoring Endpoints

### GET /health
Basic health check endpoint.

**Response:**
```json
{
  "ok": true,
  "timestamp": "2025-01-10T12:00:00.000Z",
  "version": "1.0.0",
  "environment": "production",
  "uptime": 3600
}
```

### GET /health/detailed
Comprehensive health check with system metrics.

**Response:**
```json
{
  "ok": true,
  "timestamp": "2025-01-10T12:00:00.000Z",
  "version": "1.0.0",
  "environment": "production",
  "uptime": 3600,
  "dependencies": {
    "system": {
      "status": "healthy",
      "responseTime": 0,
      "lastChecked": "2025-01-10T12:00:00.000Z"
    }
  },
  "memory": {
    "rss": 50331648,
    "heapTotal": 20971520,
    "heapUsed": 15728640,
    "external": 1048576
  }
}
```

### GET /health/performance
Real-time performance metrics and health status.

**Response:**
```json
{
  "health": {
    "status": "healthy",
    "issues": [],
    "metrics": {
      "requestCount": 150,
      "averageResponseTime": 245,
      "errorRate": 0.67,
      "slowRequests": 2,
      "memoryUsage": {...},
      "uptime": 3600,
      "lastUpdated": "2025-01-10T12:00:00.000Z"
    }
  },
  "stats": {
    "totalRequests": 1500,
    "requestsByPath": {
      "/v1/workouts/generate": 450,
      "/v1/profile": 300
    },
    "requestsByMethod": {
      "GET": 800,
      "POST": 700
    },
    "averageResponseTimeByPath": {
      "/v1/workouts/generate": 1200,
      "/v1/profile": 150
    },
    "errorsByPath": {
      "/v1/workouts/generate": 5
    }
  },
  "timestamp": "2025-01-10T12:00:00.000Z"
}
```

## Authentication Endpoints

### POST /v1/auth/google
Authenticate with Google Firebase token.

**Request:**
```json
{
  "idToken": "firebase_id_token_here"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "uid": "user_uid_here",
    "email": "user@example.com",
    "projectId": "ai-workout-backend-2024"
  },
  "backendProjectId": "ai-workout-backend-2024"
}
```

### GET /v1/auth/verify
Verify current authentication token.

**Response:**
```json
{
  "success": true,
  "user": {
    "uid": "user_uid_here",
    "email": "user@example.com",
    "projectId": "ai-workout-backend-2024"
  },
  "backendProjectId": "ai-workout-backend-2024"
}
```

## User Profile Endpoints

### GET /v1/profile
Get current user's profile.

**Response:**
```json
{
  "id": "profile_id",
  "userId": "user_uid",
  "experience": "intermediate",
  "goals": ["muscle_building", "strength"],
  "equipmentAvailable": ["dumbbells", "barbell"],
  "age": 30,
  "sex": "male",
  "height_ft": 6,
  "height_in": 0,
  "weight_lb": 180,
  "injury_notes": "Previous knee injury",
  "constraints": ["no_jumping"],
  "health_ack": true,
  "data_consent": true,
  "createdAt": "2025-01-10T12:00:00.000Z",
  "updatedAt": "2025-01-10T12:00:00.000Z"
}
```

### POST /v1/profile
Create user profile.

**Request:**
```json
{
  "experience": "intermediate",
  "goals": ["muscle_building", "strength"],
  "equipmentAvailable": ["dumbbells", "barbell"],
  "age": 30,
  "sex": "male",
  "height_ft": 6,
  "height_in": 0,
  "weight_lb": 180,
  "injury_notes": "Previous knee injury",
  "constraints": ["no_jumping"],
  "health_ack": true,
  "data_consent": true
}
```

### PATCH /v1/profile
Update user profile.

**Request:** (partial update)
```json
{
  "goals": ["strength", "endurance"],
  "weight_lb": 175
}
```

## Workout Generation Endpoints

### POST /v1/workouts/generate
Generate a personalized AI workout.

**Request:**
```json
{
  "experience": "intermediate",
  "goals": ["muscle_building", "strength"],
  "workoutType": "full_body",
  "equipmentAvailable": ["dumbbells", "barbell"],
  "duration": 45,
  "constraints": ["no_jumping"]
}
```

**Response:**
```json
{
  "workoutId": "workout_id_here",
  "plan": {
    "meta": {
      "workoutName": "Full Body Strength",
      "estimatedDuration": 45,
      "difficultyLevel": "intermediate",
      "equipmentNeeded": ["dumbbells", "barbell"]
    },
    "warmup": [
      {
        "name": "Dynamic Warmup",
        "sets": 1,
        "reps": "Time-based",
        "duration": "300s",
        "rest": "10s",
        "notes": "Light movement to prepare body"
      }
    ],
    "exercises": [
      {
        "name": "Barbell Squat",
        "sets": 3,
        "reps": "8-10",
        "weight": "Moderate to Heavy",
        "rest": "90s",
        "tempo": "2-1-2-1",
        "intensity": "High",
        "rpe": 7,
        "notes": "Focus on depth and control",
        "equipment": "barbell",
        "primaryMuscles": "quadriceps, glutes"
      }
    ],
    "cooldown": [
      {
        "name": "Static Stretching",
        "sets": 1,
        "reps": "Time-based",
        "duration": "300s",
        "rest": "10s",
        "notes": "Hold each stretch 30 seconds"
      }
    ]
  },
  "reasoning": "Workout designed for intermediate strength building",
  "confidence": 0.95
}
```

### POST /v1/workouts/generate/quick
Generate a quick workout with minimal input.

**Request:**
```json
{
  "duration": 30
}
```

**Response:** (Similar to full generation but with default parameters)

## Workout Management Endpoints

### GET /v1/workouts
List user's workout history.

**Query Parameters:**
- `limit` (optional): Number of workouts to return (default: 10, max: 50)
- `offset` (optional): Number of workouts to skip (default: 0)

**Response:**
```json
{
  "workouts": [
    {
      "id": "workout_id",
      "createdAt": "2025-01-10T12:00:00.000Z",
      "plan": {...},
      "summary": {
        "workoutType": "full_body",
        "experience": "intermediate",
        "durationMin": 45,
        "goals": ["muscle_building"],
        "equipment": ["dumbbells"]
      }
    }
  ],
  "total": 25,
  "hasMore": true
}
```

### GET /v1/workouts/:workoutId
Get specific workout by ID.

**Response:**
```json
{
  "id": "workout_id",
  "userId": "user_uid",
  "model": "gpt-4o-mini",
  "promptVersion": "v2.1.0",
  "plan": {...},
  "createdAt": "2025-01-10T12:00:00.000Z",
  "summary": {...}
}
```

### POST /v1/workouts/:workoutId/complete
Mark workout as completed with feedback.

**Request:**
```json
{
  "feedback": "Great workout, felt challenging but manageable",
  "rating": 4,
  "startedAt": "2025-01-10T12:00:00.000Z",
  "completedAt": "2025-01-10T12:45:00.000Z"
}
```

### POST /v1/workouts/:workoutId/feedback
Submit workout feedback for adaptive learning.

**Request:**
```json
{
  "rating": 4,
  "difficulty": 3,
  "enjoyment": 5,
  "completed": true,
  "notes": "Loved the variety of exercises"
}
```

## Equipment Endpoints

### GET /v1/equipment
Get list of available equipment.

**Response:**
```json
{
  "equipment": [
    {
      "slug": "dumbbells",
      "label": "Dumbbells"
    },
    {
      "slug": "barbell",
      "label": "Barbell"
    }
  ]
}
```

## Error Responses

All endpoints return structured error responses:

```json
{
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": [
    {
      "field": "experience",
      "message": "Experience must be beginner, intermediate, or advanced"
    }
  ],
  "timestamp": "2025-01-10T12:00:00.000Z",
  "correlationId": "req_123456789"
}
```

### Common Error Codes
- `VALIDATION_ERROR` (400): Invalid input data
- `UNAUTHORIZED` (401): Missing or invalid authentication
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `RATE_LIMIT_EXCEEDED` (429): Too many requests
- `INTERNAL_ERROR` (500): Server error
- `SERVICE_UNAVAILABLE` (503): Service temporarily unavailable

## Rate Limits

- **General API**: 100 requests per 15 minutes per IP
- **Workout Generation**: 8 requests per minute per user
- **Authentication**: 10 requests per 15 minutes per IP

## Performance Considerations

- **Caching**: Frequently accessed data is cached for improved performance
- **Response Times**: Target <1.5s for workout generation, <500ms for other endpoints
- **Monitoring**: All requests are monitored for performance and errors
- **Health Checks**: Use `/health` endpoints for monitoring and load balancer configuration
