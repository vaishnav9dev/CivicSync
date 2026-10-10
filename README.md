# CivicSync 🏙️

### Smarter Coordination for Civic Infrastructure Projects

CivicSync is a civic technology web application designed to help improve the coordination and planning of public infrastructure projects. It focuses on identifying scheduling conflicts between projects that share roads or other infrastructure, helping teams explore alternative schedules and reduce disruption.

By bringing project information and scheduling considerations into one interface, CivicSync aims to support more efficient, transparent, and coordinated infrastructure planning.

## 🌐 Project Links

- **Live Demo (Production):** https://civicsync-gold.vercel.app/
- **Additional Deployment:** https://civicsync-2a786kjah-vaishnav9dev.vercel.app/
- **GitHub Repository:** https://github.com/vaishnav9dev/CivicSync

> **Note:** The additional deployment URL may require Vercel authentication. Use the production link for public demonstrations.

## 🎯 Problem Statement

Urban infrastructure projects such as road repairs, utility maintenance, and public works can overlap in location and time. Poor coordination can result in repeated road closures, traffic disruption, inefficient resource utilization, and unnecessary inconvenience for the public.

Project teams need a better way to visualize planned work, identify overlapping schedules, and consider alternative timelines before projects are carried out.

## 💡 Our Solution

CivicSync aims to make infrastructure planning more coordinated by bringing project scheduling and conflict identification into a unified web interface.

The project explores how digital tools and map-based visualization can help teams understand where infrastructure projects may conflict and evaluate alternative schedules.

## ✨ Key Objectives

- **Infrastructure Coordination:** Organize information about public infrastructure projects.
- **Schedule Conflict Detection:** Identify potential overlaps between projects that share roads or locations.
- **Alternative Schedule Exploration:** Help users consider different project timelines to reduce conflicts.
- **Map-Based Visualization:** Use geographical context to make infrastructure planning easier to understand.
- **Improved Decision-Making:** Support more informed coordination between project teams.

*The objectives above describe the project's intended capabilities; refer to the live application for the features currently implemented.*

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| React | Frontend user interface |
| TypeScript | Type-safe application development |
| Vite | Frontend development and build tooling |
| React Leaflet | Map-based visualization |
| Supabase | Backend service integration and configuration |
| Git & GitHub | Version control and team collaboration |
| Vercel | Web application deployment |

## 🏗️ Architecture Overview

CivicSync follows a web application architecture:

1. **Frontend:** React and TypeScript provide the user interface.
2. **Map Visualization:** React Leaflet supports geographical presentation.
3. **Backend Integration:** Supabase configuration supports connected backend services.
4. **Deployment:** Vercel hosts the web application.

## 🚀 Run Locally

### Prerequisites

- Node.js and npm
- Git
- Access to the required Supabase project configuration

### 1. Clone the repository

```bash
git clone https://github.com/vaishnav9dev/CivicSync.git
cd CivicSync
```

### 2. Install dependencies

Navigate to the directory containing the frontend `package.json`. In the current repository structure, this is the nested `CivicSync` directory:

```bash
cd CivicSync
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the frontend project directory and configure the required variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Use your own Supabase project values. Never commit private credentials or service-role keys to GitHub.

### 4. Start the development server

```bash
npm run dev
```

Open the local URL printed in your terminal by Vite.

### 5. Create a production build

```bash
npm run build
```

This runs the configured TypeScript build and Vite production build.

> If you need to start the backend separately, follow the instructions and scripts provided in the relevant backend directory.

## 🔒 Security and Configuration

- Keep environment-specific configuration out of committed `.env.local` files.
- Use Vercel environment variables for deployed builds.
- Apply appropriate access controls to backend services and database operations.
- Never expose Supabase service-role keys or other privileged secrets in frontend code.

## 🔮 Future Scope

- More advanced detection of overlapping infrastructure schedules.
- Improved alternative-schedule recommendations.
- Enhanced geographical visualization of planned work.
- Better coordination workflows for multiple project teams.
- Reporting and analytics to support infrastructure planning.

## 👥 Team and Acknowledgements

Developed collaboratively for a web development hackathon at IIITDM Kancheepuram.

We thank the organizers, mentors, and everyone who contributed feedback during development.

## 📄 License

No license has been specified yet. Please add an appropriate license if you intend to permit public reuse or modification.

---

**CivicSync — Better coordination. Smarter infrastructure. More connected cities.**
