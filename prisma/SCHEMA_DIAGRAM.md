# Database Schema Diagram

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         AI UI Builder Database Schema                    │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│       users          │
├──────────────────────┤
│ id (PK)             │◄─────────┐
│ email (UNIQUE)      │          │
│ name                │          │
│ emailVerified       │          │
│ image               │          │
│ createdAt           │          │
│ updatedAt           │          │
└──────────────────────┘          │
         ▲                        │
         │                        │
         │ 1:N                    │ 1:N
         │                        │
┌────────┴──────────┐    ┌────────┴──────────┐
│     accounts      │    │     sessions      │
├───────────────────┤    ├───────────────────┤
│ id (PK)          │    │ id (PK)          │
│ userId (FK)      │    │ sessionToken     │
│ type             │    │ userId (FK)      │
│ provider         │    │ expires          │
│ providerAccountId│    └───────────────────┘
│ refresh_token    │
│ access_token     │
│ expires_at       │
│ token_type       │
│ scope            │
│ id_token         │
│ session_state    │
└───────────────────┘

┌──────────────────────┐
│ verification_tokens  │
├──────────────────────┤
│ identifier          │
│ token (UNIQUE)      │
│ expires             │
└──────────────────────┘

┌──────────────────────┐
│      projects        │
├──────────────────────┤
│ id (PK)             │
│ name                │
│ description         │
│ userId (FK)         │◄─────────┐
│ uiDocument (JSON)   │          │
│ thumbnail           │          │ 1:N
│ createdAt           │          │
│ updatedAt           │          │
└──────────────────────┘          │
         ▲                        │
         │                        │
         └────────────────────────┘
                From users table
```

## Table Relationships

### User → Accounts (1:N)
- One user can have multiple OAuth accounts (Google, GitHub, etc.)
- Cascade delete: Deleting a user removes all their accounts

### User → Sessions (1:N)
- One user can have multiple active sessions
- Cascade delete: Deleting a user removes all their sessions

### User → Projects (1:N)
- One user can have multiple UI projects
- Cascade delete: Deleting a user removes all their projects

### Verification Tokens (Standalone)
- No foreign key relationships
- Used for email verification and password resets
- Identified by email or phone number

## Field Details

### users
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | PRIMARY KEY | CUID identifier |
| email | String | UNIQUE, NOT NULL | User email address |
| name | String | NULLABLE | User display name |
| emailVerified | DateTime | NULLABLE | Email verification timestamp |
| image | String | NULLABLE | Profile image URL |
| createdAt | DateTime | DEFAULT now() | Account creation time |
| updatedAt | DateTime | AUTO UPDATE | Last update time |

### accounts
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | PRIMARY KEY | CUID identifier |
| userId | String | FOREIGN KEY | References users.id |
| type | String | NOT NULL | Account type (oauth, email) |
| provider | String | NOT NULL | OAuth provider (google, github) |
| providerAccountId | String | NOT NULL | Provider's user ID |
| refresh_token | Text | NULLABLE | OAuth refresh token |
| access_token | Text | NULLABLE | OAuth access token |
| expires_at | Integer | NULLABLE | Token expiration timestamp |
| token_type | String | NULLABLE | Token type (Bearer) |
| scope | String | NULLABLE | OAuth scopes |
| id_token | Text | NULLABLE | OpenID Connect ID token |
| session_state | String | NULLABLE | OAuth session state |

**Unique Constraint**: (provider, providerAccountId)

### sessions
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | PRIMARY KEY | CUID identifier |
| sessionToken | String | UNIQUE, NOT NULL | Session token |
| userId | String | FOREIGN KEY | References users.id |
| expires | DateTime | NOT NULL | Session expiration time |

### verification_tokens
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| identifier | String | NOT NULL | Email or phone number |
| token | String | UNIQUE, NOT NULL | Verification token |
| expires | DateTime | NOT NULL | Token expiration time |

**Unique Constraint**: (identifier, token)

### projects
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | PRIMARY KEY | CUID identifier |
| name | String | NOT NULL | Project name |
| description | String | NULLABLE | Project description |
| userId | String | FOREIGN KEY | References users.id |
| uiDocument | JSON | NOT NULL | Complete UI specification |
| thumbnail | String | NULLABLE | Preview image URL |
| createdAt | DateTime | DEFAULT now() | Project creation time |
| updatedAt | DateTime | AUTO UPDATE | Last update time |

**Indexes**:
- userId (for fast user project queries)
- updatedAt (for sorting by recent activity)

## Data Flow Examples

### User Registration Flow
```
1. Create user record in `users` table
2. If OAuth: Create account record in `accounts` table
3. Create session record in `sessions` table
4. Send verification email (create record in `verification_tokens`)
```

### User Login Flow
```
1. Verify credentials against `users` table
2. If OAuth: Check/update `accounts` table
3. Create new session in `sessions` table
4. Return session token to client
```

### Project Creation Flow
```
1. Verify user session from `sessions` table
2. Create project record in `projects` table
3. Link project to user via userId foreign key
4. Store UIDocument JSON in uiDocument field
```

### Project Query Flow
```
1. Verify user session from `sessions` table
2. Query projects WHERE userId = current user
3. Order by updatedAt DESC
4. Return project list with metadata
```

## Storage Considerations

### JSON Storage (uiDocument)
- Stores complete UI specification as JSON
- Flexible schema for evolving UI requirements
- Indexed for fast retrieval
- Can be queried using PostgreSQL JSON operators

### Text Storage (tokens)
- OAuth tokens stored as TEXT for unlimited length
- Encrypted at rest by PostgreSQL
- Should be encrypted in application layer for extra security

### Timestamps
- All tables include createdAt/updatedAt for audit trails
- Automatic updates via Prisma middleware
- Useful for analytics and debugging

## Performance Optimizations

### Indexes
```sql
-- User projects (fast lookup)
CREATE INDEX "projects_userId_idx" ON "projects"("userId");

-- Recent projects (fast sorting)
CREATE INDEX "projects_updatedAt_idx" ON "projects"("updatedAt");
```

### Cascade Deletes
- Automatic cleanup of related records
- Prevents orphaned data
- Maintains referential integrity

### CUID Primary Keys
- Collision-resistant identifiers
- URL-safe and sortable
- Better for distributed systems than UUIDs

## Security Features

### Foreign Key Constraints
- Enforces data integrity
- Prevents invalid references
- Automatic cascade deletes

### Unique Constraints
- Prevents duplicate emails
- Ensures unique session tokens
- Validates OAuth account uniqueness

### Soft Deletes (Future Enhancement)
- Projects can be moved to trash
- 30-day retention before permanent deletion
- Requires additional `deletedAt` field

## Scalability Considerations

### Horizontal Scaling
- CUID keys support distributed ID generation
- No auto-increment dependencies
- Can shard by userId

### Vertical Scaling
- Indexes optimize query performance
- JSON storage reduces table joins
- Connection pooling recommended

### Caching Strategy
- Cache user sessions in Redis
- Cache project metadata (not full uiDocument)
- Invalidate on updates

## Migration History

### Initial Migration (init)
- Created all 5 tables
- Added foreign key relationships
- Created indexes for performance
- Set up cascade deletes

### Future Migrations
- Add soft delete support (deletedAt field)
- Add project tags/folders
- Add collaboration features (shared projects)
- Add version history (project snapshots)

---

**Last Updated**: 2024
**Schema Version**: 1.0.0 (Initial)
**Prisma Version**: 5.10.0
