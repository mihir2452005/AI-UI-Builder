# Project API Routes Manual Test Guide

This guide helps you manually test the project management API routes.

## Prerequisites

1. Make sure the development server is running: `npm run dev`
2. Make sure you're signed in to the application
3. Have a tool like Postman, curl, or use the browser console

## Test Cases

### 1. Create a New Project (POST /api/projects)

**Request:**
```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Test Project",
    "description": "This is a test project"
  }'
```

**Expected Response (201):**
```json
{
  "success": true,
  "data": {
    "project": {
      "id": "clxxx...",
      "name": "My Test Project",
      "description": "This is a test project",
      "thumbnail": null,
      "updatedAt": "2024-01-15T10:00:00.000Z",
      "componentCount": 1,
      "userId": "clxxx...",
      "uiDocument": { ... },
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  },
  "timestamp": "2024-01-15T10:00:00.000Z"
}
```

### 2. List All Projects (GET /api/projects)

**Request:**
```bash
curl http://localhost:3000/api/projects
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "clxxx...",
        "name": "My Test Project",
        "description": "This is a test project",
        "thumbnail": null,
        "updatedAt": "2024-01-15T10:00:00.000Z",
        "componentCount": 1,
        "userId": "clxxx..."
      }
    ]
  },
  "timestamp": "2024-01-15T10:00:00.000Z"
}
```

### 3. Get Single Project (GET /api/projects/[id])

**Request:**
```bash
curl http://localhost:3000/api/projects/clxxx...
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "project": {
      "id": "clxxx...",
      "name": "My Test Project",
      "description": "This is a test project",
      "thumbnail": null,
      "updatedAt": "2024-01-15T10:00:00.000Z",
      "componentCount": 1,
      "userId": "clxxx...",
      "uiDocument": { ... },
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  },
  "timestamp": "2024-01-15T10:00:00.000Z"
}
```

### 4. Update Project (PATCH /api/projects/[id])

**Request:**
```bash
curl -X PATCH http://localhost:3000/api/projects/clxxx... \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Project Name",
    "description": "Updated description"
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "project": {
      "id": "clxxx...",
      "name": "Updated Project Name",
      "description": "Updated description",
      ...
    }
  },
  "timestamp": "2024-01-15T10:00:00.000Z"
}
```

### 5. Delete Project (DELETE /api/projects/[id])

**Request:**
```bash
curl -X DELETE http://localhost:3000/api/projects/clxxx...
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Project deleted successfully",
    "deletedAt": "2024-01-15T10:00:00.000Z",
    "permanentDeletionDate": "2024-02-14T10:00:00.000Z"
  },
  "timestamp": "2024-01-15T10:00:00.000Z"
}
```

## Browser Console Test

You can also test from the browser console while signed in:

```javascript
// Create a project
fetch('/api/projects', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Browser Test Project',
    description: 'Created from browser console'
  })
})
  .then(r => r.json())
  .then(console.log);

// List projects
fetch('/api/projects')
  .then(r => r.json())
  .then(console.log);

// Get single project (replace ID)
fetch('/api/projects/YOUR_PROJECT_ID')
  .then(r => r.json())
  .then(console.log);

// Update project (replace ID)
fetch('/api/projects/YOUR_PROJECT_ID', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Updated Name'
  })
})
  .then(r => r.json())
  .then(console.log);

// Delete project (replace ID)
fetch('/api/projects/YOUR_PROJECT_ID', {
  method: 'DELETE'
})
  .then(r => r.json())
  .then(console.log);
```

## Error Cases to Test

### 1. Unauthorized Access (No Session)
- Sign out and try to access any endpoint
- Expected: 401 Unauthorized

### 2. Invalid Project ID
- Try to GET/PATCH/DELETE a non-existent project ID
- Expected: 404 Not Found

### 3. Access Another User's Project
- Try to access a project that belongs to another user
- Expected: 403 Forbidden

### 4. Invalid Input
- Try to create a project with empty name
- Try to create a project with name > 100 characters
- Expected: 400 Validation Error

## Notes

- All routes require authentication via NextAuth session
- Projects are scoped to the authenticated user
- The DELETE operation is currently a hard delete (soft delete requires schema changes)
- Component count is calculated by traversing the UI document tree
