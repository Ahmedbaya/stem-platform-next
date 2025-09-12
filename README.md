# STEM Platform – End of Studies Project

This project is a full-stack web application designed to promote STEM (Science, Technology, Engineering, Mathematics) education through the organization and management of **robotics competitions**. It was developed as part of my final-year project in Computer Science.

## 🚀 Features

- 🔧 Organize and manage STEM events and robotics competitions
- 👥 User authentication and role-based access (participants, organizers, admins)
- 🧠 STEM-focused content and resources
- 📊 Real-time updates and dashboard for competition tracking
- 📅 Event scheduling and registration management

## 🛠️ Tech Stack

### Frontend
- **Next.js** – React framework for server-side rendering and static site generation
- **Tailwind CSS** – For a modern and responsive UI

### Backend & Database
- **Node.js** with **API routes in Next.js**
- **MongoDB** – NoSQL database for flexible data modeling (using MongoDB Atlas)

### Tools & Services
- **Vercel** – Deployment of the Next.js app
- **MongoDB Atlas** – Cloud database hosting
- **Postman** – API testing and development
- **GitHub** – Version control and collaboration

## 📂 Project Structure

```
📁 /app            → Application pages and logic (Next.js)
📁 /components     → Reusable UI components
📁 /lib            → Utility functions and services
📁 /models         → Mongoose models for MongoDB
📁 /public         → Static assets
📁 /styles         → Global styles (Tailwind config)
📁 /api            → Backend routes (Next.js API)
```

## 🧪 Setup & Development

### Prerequisites

- Node.js and npm installed
- MongoDB Atlas account (or local MongoDB instance)
- Vercel account (for deployment)

### Installation

```bash
git clone https://github.com/Ahmedbaya/stem-platform-next.git
cd stem-platform-next
npm install
```

### Environment Variables

Create a `.env.local` file and add:

```env
MONGODB_URI=your_mongodb_connection_string
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Running Locally

```bash
npm run dev
```

### Build for Production

```bash
npm run build
npm start
```

## 📌 Future Improvements

- Add real-time chat and team collaboration
- Admin dashboard with analytics
- Support for different competition types (e.g. coding, math)

## 📸 Screenshots

> Add screenshots or screen recordings here to showcase the UI and features.

## 👤 Author

- **Ahmed Baya** – [LINKEDIN](https://www.linkedin.com/in/ahmed-baya-652b67247/)  
- GitHub: [@Ahmedbaya](https://github.com/Ahmedbaya)