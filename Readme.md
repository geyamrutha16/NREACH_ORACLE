# 🌈 NREACH — Smart Attendance, Zero Effort

> 📣 Because parents should never have to ask, *“Was my child present today?”*

NREACH is an automated attendance notification system that delivers real-time, customizable attendance updates directly to parents via SMS and Email.  
All actions are secure, traceable, and fully admin-controlled.

---

## 🎯 Purpose

- Improve parent awareness of student attendance  
- Reduce manual calls and follow-ups by staff  
- Enable real-time automated communication  

---

## ✨ Key Features

### 📊 Attendance Tracking
- Daily, weekly, and monthly monitoring  
- Real-time attendance updates  
- Multi-class and multi-section support  

### 🔔 Automated Parent Notifications
- SMS and Email alerts  
- Customizable message templates  
- Scheduled and event-based triggers  

### ⚙️ Admin Customization
- Attendance threshold configuration  
- Message format and schedule control  
- Role-based access management  

### 📈 Full Traceability
- Complete notification logs  
- Delivery status tracking  
- Audit trail for all system actions  

---

## 👥 User Roles

| Role | Capabilities |
|------|-------------|
| Operator | Manage attendance and notifications |
| HOD | Monitor reports and insights |
| Parents / Students | Receive attendance alerts |

---

## 🛠 Tech Stack

### Backend
- Runtime: Node.js v16+  
- Framework: Express.js  
- Database: Oracle Database 19c+  
- ORM: oracledb  
- Authentication: JWT + bcrypt  

### Frontend
- Framework: React.js  
- UI Library: Bootstrap  
- HTTP Client: Axios  

### External Services
- SMS / Notifications: Twilio API  
- Environment Management: dotenv  
- Package Manager: npm / yarn  

---

## 📚 APIs

All protected routes require a JWT token in the request header.

1. Authentication API  
2. SMS Notification API  
3. Student Management API  

---

## 🚀 Installation Guide

### ✅ Prerequisites
- Node.js v16+  
- Oracle Database 19c+  
- SQL*Plus  
- Git  

---

### 🔹 STEP 1: Install Node.js

Download and install from:  
https://nodejs.org

Verify installation:
```bash
node -v
npm -v
