# AI Support Engineering Platform

A full-stack MERN-based support ticket management platform with role-based access, ticket lifecycle management, real-time updates, attachments, activity tracking, and AI-assisted support capabilities.

## Live Demo

Frontend:
https://ai-support-engineering-platform-client.onrender.com

Backend API:
https://ai-support-engineering-platform.onrender.com

## GitHub

https://github.com/amankumar848/ai-support-engineering-platform

---

## Features

### Authentication & Authorization
- JWT-based authentication
- Customer, Engineer and Admin roles
- Role-based route protection
- Secure password hashing with bcrypt

### Ticket Management
- Create and manage support tickets
- Ticket categories
- Priority and severity levels
- Ticket status lifecycle
- Engineer assignment
- Resolution tracking
- SLA tracking

### Comments & Activity Timeline
- Customer and engineer comments
- Ticket activity history
- Tracks status, priority, severity, category and assignment changes
- Real-time activity updates using Socket.IO

### File Attachments
- Upload ticket attachments
- File type validation
- 5 MB upload limit
- Attachment history
- Customer and engineer access control

### Dashboards

#### Customer
- View own tickets
- Create tickets
- View ticket details
- Comments and attachments

#### Engineer
- View assigned and unassigned tickets
- Assign tickets to self
- Update ticket status
- Update priority, severity and category
- Add comments and attachments

#### Admin
- View all tickets
- Assign tickets to engineers
- Ticket analytics
- Engineer workload analytics
- Monitor SLA information

### AI Support

The platform includes AI-assisted ticket analysis and response generation.

AI capabilities include:
- Ticket classification
- Priority/severity analysis
- Ticket summary
- Root-cause suggestions
- Customer response generation
- Knowledge-base assisted analysis

---

## Tech Stack

### Frontend
- React
- Vite
- React Router
- Axios
- Tailwind CSS
- Socket.IO Client

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- Multer
- Socket.IO
- OpenAI API

### Deployment
- Render
- MongoDB Atlas

---

## Architecture

```text
React + Vite
     |
     | REST API
     v
Node.js + Express
     |
     +---- JWT Authentication
     |
     +---- Ticket Management
     |
     +---- Comments
     |
     +---- Attachments
     |
     +---- AI Services
     |
     +---- Socket.IO
     |
     v
MongoDB Atlas
