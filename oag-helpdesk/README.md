# OAG Helpdesk

A comprehensive support ticketing and knowledge management system for the Office of the Auditor General (OAG). Built with a modern tech stack for multi-portal support operations (Admin, Staff, and User portals).

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [System Architecture](#system-architecture)
- [User Roles & Permissions](#user-roles--permissions)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Database Schema](#database-schema)
- [Core Workflows](#core-workflows)
- [Environment Configuration](#environment-configuration)
- [Project Structure](#project-structure)
- [API Integration](#api-integration)
- [Setup Instructions](#setup-instructions)
- [Development & Testing](#development--testing)
- [Deployment](#deployment)

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** >= v22
- **PostgreSQL** >= 16
- **npm** >= 10

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd oag-helpdesk

# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
cd ../backend && npm install

# Copy environment file and configure
cp .env.example .env

# Initialize database
npm run db:init

# Start development server
npm run dev
```

Access the application:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

---

## 🏗️ System Architecture

### Multi-Portal Design

The system is structured around three independent portals accessed through route-based separation:

1. **Admin Portal** (`/admin/*`)
   - System configuration and management
   - User account creation and role assignment
   - System announcements and email settings
   - Access control and audit logs
   - Knowledge base administration

2. **Staff Portal** (`/staff/*`)
   - Real-time dashboard with ticket statistics
   - Ticket assignment and status management
   - Customer communication and responses
   - Internal email and knowledge base access
   - Performance metrics and analytics

3. **User Portal** (`/user/*`)
   - Submit and track personal support tickets
   - View ticket history and status
   - Receive notifications and announcements
   - Access public knowledge base articles
   - Respond to ticket updates

### Data Flow

```
Email System → Parser → Database (Tickets)
                           ↓
                       Staff Portal
                           ↓
Staff Response → Email Notification → User
Staff Resolution → Ticket Closure → Notification
```

---

## 👥 User Roles & Permissions

### Admin (`admin`)
- **Scope**: System-wide administrative control
- **Capabilities**:
  - Create/edit/delete system users
  - Assign roles and permissions
  - Configure email servers (SMTP)
  - Manage announcements
  - Access audit logs
  - System settings and integrations

### Staff (`staff`)
- **Scope**: Ticket management and customer support
- **Capabilities**:
  - View assigned and team tickets
  - Update ticket status
  - Respond to tickets
  - Send email responses
  - Access knowledge base
  - Real-time dashboard analytics

### User (`user`)
- **Scope**: Personal ticket management
- **Capabilities**:
  - Submit new tickets
  - View own tickets
  - Respond to ticket updates
  - Access public knowledge base
  - Receive notifications

### Staff Extensions (Role Modifiers)
- **IT Extension** (`staff_it`): Elevated IT support permissions
- **Manager** (`staff_manager`): Team oversight and approval

---

## ✨ Key Features

### 1. Intelligent Ticket Management
- **Email-to-Ticket Conversion**: Incoming emails automatically create tickets with full conversation history
- **Smart Routing**: Automatic assignment based on category and queue
- **Status Workflow**: Open → In Progress → Resolved → Closed
- **Real-time Updates**: WebSocket-backed live status notifications

### 2. Knowledge Base System
- **Article Management**: Rich-text knowledge articles with versioning
- **Search & Discovery**: Full-text search across articles
- **Public Accessibility**: Self-service resources for users
- **Category Organization**: Structured article hierarchy

### 3. Communication Hub
- **Internal Messaging**: Staff comments and internal communications
- **Email Integration**: Bidirectional email integration (inbound + outbound)
- **Notification System**: Real-time notifications via notification bell
- **Announcements**: System-wide announcements displayed to users

### 4. Analytics & Reporting
- **Real-time Dashboards**: Live ticket statistics and trends
- **7-Day Analytics**: Submission trends and status breakdown
- **Performance Metrics**: Staff KPIs and response times
- **Audit Logging**: Complete activity log with timestamps and user attribution

### 5. Security & Access Control
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Granular permission management
- **RBAC Middleware**: Enforced on all protected routes
- **Audit Trail**: Full logging of administrative actions

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 (Vite build)
- **Styling**: TailwindCSS + custom components
- **State Management**: React Query + React Context
- **Forms**: React Hook Form + Zod schema validation
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **UI Components**: shadcn/ui component library
- **Charts**: Recharts for analytics
- **Date Handling**: date-fns
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 4
- **Database**: PostgreSQL 16+
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Email**: Nodemailer
- **Uploads**: Multer
- **Request Logging**: Morgan
- **Validation**: Zod schema validation
- **CORS**: Cross-origin resource sharing enabled

### Database
- **Type**: PostgreSQL 16+
- **Features**:
  - JSONB flexible data columns
  - Generated columns for computed fields
  - Immutable functions for safe enum casting
  - Full-text search indexes
  - Custom enum types

---

## 📊 Database Schema

### Core Entity Tables

#### Users
- `users`: System user accounts with roles and authentication
- `user_roles`: Role definitions and hierarchies
- `password_reset_tokens`: Secure password reset flow

#### Tickets
- `tickets`: Main ticket records with status and metadata
- `ticket_categories`: Ticket classification system
- `ticket_notes`: Internal staff notes
- `ticket_responses`: Public staff responses
- `ticket_routes`: Assignment and routing rules

#### Communication
- `notifications`: Real-time user notifications
- `announcements`: System-wide announcements
- `chat_sessions`: Chatbot conversation history
- `chat_logs`: Individual chatbot messages

#### Knowledge
- `knowledge_base_articles`: Self-service documentation
- `feedback`: User feedback on articles and system

#### Email
- `email_servers`: SMTP configuration
- `email_notifications`: Outbound email tracking
- `email_ticket`: Email-to-ticket conversion logs
- `internal_email`: Staff-to-staff communication

#### Admin
- `audit_logs`: System activity logging
- `app_users`: System user management
- `validation_requests`: User account validation flow

### Data Model Features

**JSONB Flexible Fields**:
- `data` column in most tables for schema flexibility
- Stores structured metadata as JSON

**Generated Columns**:
- Computed fields derived from JSONB data
- Indexed for efficient querying
- Immutable function-based calculations

**Example**: User role extraction
```sql
-- Generated column definition
role TEXT GENERATED ALWAYS AS (to_user_role(data->>'role')) STORED

-- Immutable casting function (type-safe)
CREATE FUNCTION to_user_role(text) RETURNS user_role 
AS $$ ... $$ LANGUAGE sql IMMUTABLE;
```

---

## 🔄 Core Workflows

### Email-to-Ticket Conversion (Inbound)
```
1. Email arrives at configured SMTP server
2. Backend email parser processes incoming mail
3. Extract from/cc/subject/body
4. Create or link to existing ticket
5. Store email metadata in ticket conversation
6. Notify assigned staff
7. Generate notification for user
```

### Ticket Submission (User Self-Service)
```
1. User fills submit-ticket form
2. Frontend validation (React Hook Form + Zod)
3. Backend CRUD validation
4. Create ticket record
5. Send confirmation email to user
6. Notify relevant staff
7. Redirect to my-tickets view
```

### Staff Resolution Process
```
1. Staff assigned ticket appears in dashboard
2. Staff updates status or adds response
3. Email notification sent to user
4. User receives notification bell alert
5. User can respond to ticket
6. Staff marked as resolved → user can close or reopen
7. Closed tickets archived for audit trail
```

### Announcement Distribution
```
1. Admin creates announcement via admin portal
2. Announcement stored with created_date and metadata
3. NotificationBell component fetches announcements
4. Merges announcements + notifications (sorted by date)
5. User sees announcement badge
6. User can dismiss announcement
7. Dismissal tracked in user preferences
```

---

## ⚙️ Environment Configuration

### Backend (.env)

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=oag_helpdesk
DB_USER=postgres
DB_PASSWORD=your_secure_password

# Authentication
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRES_IN=7d

# Email (Nodemailer)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=noreply@ago.gov.zm
MAIL_PASSWORD=your_app_password
MAIL_FROM=noreply@ago.gov.zm

# Server
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# File Uploads
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
```

### Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 📁 Project Structure

```
oag-helpdesk/
├── backend/                    # Express.js API
│   ├── config/                 # Database config
│   ├── controllers/            # Route handlers (30+ endpoints)
│   ├── middleware/             # Auth, RBAC, logging
│   ├── routes/                 # Express route definitions
│   ├── schemas/                # Zod validation schemas
│   ├── utils/                  # Email, helpers
│   ├── database/               # PostgreSQL schema + migrations
│   │   ├── init.js            # Schema initialization
│   │   ├── seed.sql           # Sample data
│   │   └── migrations/        # Versioned DB migrations
│   ├── server.js              # Express app entry point
│   └── package.json           # Node.js dependencies

├── frontend/                   # React + Vite
│   ├── src/
│   │   ├── pages/             # Portal views
│   │   │   ├── admin/         # Admin interface
│   │   │   ├── staff/         # Staff operations
│   │   │   ├── user/          # User portal
│   │   │   └── RootGate.jsx   # Login screen
│   │   ├── features/          # Feature-specific components
│   │   ├── components/        # Reusable UI components
│   │   │   ├── ui/           # shadcn/ui base components
│   │   │   ├── notifications/ # Notification system
│   │   │   └── announcements/ # Announcement components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── api/               # API client calls
│   │   ├── App.jsx            # Root component
│   │   └── index.css          # Global styles
│   ├── public/                # Static assets
│   │   ├── oag-logo.png
│   │   ├── oag-favicon.png
│   │   └── manifest.json      # PWA manifest
│   ├── tailwind.config.js    # TailwindCSS configuration
│   ├── vite.config.js        # Vite build config
│   └── package.json

└── README.md                   # This file
```

---

## 🔌 API Integration

### Key REST Endpoints

**Authentication**
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout
- `POST /api/auth/refresh` - Refresh JWT token

**Tickets (CRUD)**
- `GET /api/tickets` - List tickets (filtered by role)
- `POST /api/tickets` - Create new ticket (scope: user-only)
- `GET /api/tickets/:id` - Get ticket details
- `PUT /api/tickets/:id` - Update ticket status (scope: staff)

**Knowledge Base**
- `GET /api/knowledge-base` - List articles
- `GET /api/knowledge-base/:id` - Get article details
- `POST /api/knowledge-base` - Create article (scope: admin/staff)

**Notifications**
- `GET /api/notifications` - Get user notifications
- `GET /api/announcements` - Get system announcements
- `DELETE /api/notifications/:id` - Mark as read

**Email Configuration**
- `GET /api/email-servers` - Get SMTP settings (scope: admin)
- `PUT /api/email-servers/:id` - Update SMTP config

### Response Format

```json
{
  "success": true,
  "data": { },
  "message": "Operation completed"
}
```

---

## 🔧 Setup Instructions

### 1. Database Setup

```bash
cd backend

# Create database
psql -U postgres -c "CREATE DATABASE oag_helpdesk;"

# Run migrations
npm run db:init

# Seed sample data (optional)
psql -U postgres -d oag_helpdesk -f database/seed.sql
```

**Database Initialize Script**:
- Creates all 30+ tables
- Establishes foreign key relationships
- Sets up IMMUTABLE enum casting functions
- Initializes admin user: `admin@ago.gov.zm` / `Admin@123`

### 2. Email Configuration

```bash
# In backend/.env, configure SMTP
MAIL_HOST=smtp.gmail.com           # Your SMTP server
MAIL_PORT=587
MAIL_USER=noreply@ago.gov.zm      # From address
MAIL_PASSWORD=your_app_password    # Gmail app password
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Update Tailwind CSS configuration
npx tailwindcss init -p

# Start dev server
npm run dev
```

### 4. Backend Startup

```bash
cd backend

# Install dependencies
npm install

# Start server
npm start

# Or run in watch mode (development)
npm run dev
```

---

## 🧪 Development & Testing

### Running the Development Environment

```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

### Test Database Operations

```bash
# Connect to database
psql -U postgres -d oag_helpdesk

# Check tables
\dt

# Verify admin user
SELECT email, role FROM users WHERE email='admin@ago.gov.zm';

# Check ticket count
SELECT COUNT(*) FROM tickets;
```

### API Testing

Using **curl** or **Postman**:

```bash
# Sign in
curl -X POST http://localhost:5000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ago.gov.zm","password":"Admin@123"}'

# Get tickets
curl -X GET http://localhost:5000/api/tickets \
  -H "Authorization: Bearer <token>"
```

### Frontend Development

- **Hot Module Reload (HMR)**: Automatic page refresh on code changes
- **ESLint**: Code quality checks
- **Tailwind CSS**: On-demand CSS generation

---

## 🚀 Deployment

### Production Environment

1. **Database**
   ```bash
   # Use managed PostgreSQL (AWS RDS, Azure Database)
   # Or self-hosted with backups enabled
   # Run migrations in production:
   npm run db:init
   ```

2. **Backend**
   ```bash
   # Build
   npm run build

   # Run with process manager (PM2)
   pm2 start server.js --name "oag-api"

   # Environment
   NODE_ENV=production
   JWT_SECRET=<strong-secret>
   ```

3. **Frontend**
   ```bash
   # Build
   npm run build

   # Serve dist/ folder with webserver (Nginx/Apache)
   npm run preview
   ```

4. **SSL/TLS**
   - Use Let's Encrypt certificates
   - Configure HTTPS on reverse proxy

### Environment Variables Checklist

- [ ] `JWT_SECRET` - Complex, random string (min 32 chars)
- [ ] `DB_PASSWORD` - Strong database password
- [ ] `MAIL_PASSWORD` - SMTP app-specific password
- [ ] `CORS_ORIGIN` - Production frontend URL
- [ ] `NODE_ENV=production`
- [ ] `PORT` - Non-standard port if behind reverse proxy

---

## 📝 License

Internal system for Office of the Auditor General. All rights reserved.

## 🤝 Support

For technical support, contact the OAG IT department.

---

**Last Updated**: May 2026  
**Version**: 1.0.0  
**Status**: Production Ready
