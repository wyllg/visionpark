# VisionPark Web Dashboard 🚗🅿️

Welcome to the frontend repository for **VisionPark**, our automated parking management system. This project is built using **Next.js (App Router)**, **Tailwind CSS**, and **Clerk** for secure Role-Based Access Control (RBAC).

This guide will help the team get the project up and running locally so we can all collaborate smoothly.

---

## 📋 Prerequisites

Before you begin, ensure you have **Node.js** installed on your machine (v18.x or higher is recommended for modern Next.js).

---

## 🚀 Getting Started

Follow these steps to set up the VisionPark frontend on your local machine.

### 1. Install Dependencies

Once you have pulled the repository to your machine, install all the required packages (like Clerk and Next.js) listed in our `package.json` file. Open your terminal in the project folder and run:

```bash
npm install
```

> If you prefer another package manager, you can also use `yarn install`, `pnpm install`, or `bun install`.

---

### 2. Set Up Environment Variables 🔐

Because we are utilizing Clerk to handle our Driver, Worker, and Admin logins, the application will crash if it cannot find our specific API keys. You must set up your local environment variables before running the server.

1. Create a new file named exactly **`.env.local`** in the root directory of the project.
2. Reach out to the team lead to get the live Clerk API keys, or copy them from our shared workspace.
3. Add the following keys to your `.env.local` file. Notice that our custom auth routes are specifically set to `/auth/login` and `/auth/signup`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key_here
CLERK_SECRET_KEY=your_secret_key_here

# Custom Auth Routes
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

> ⚠️ **Never commit the `.env.local` file to GitHub.** It is safely ignored in our `.gitignore` to prevent our security keys from leaking.

---

### 3. Run the Development Server

Once your dependencies are installed and your environment variables are saved, start the local Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the VisionPark dashboard in action! The page auto-updates as you edit the files in the `src/app` directory.

---

## 🏗️ Project Structure Highlights

For team members jumping into the code, here is a quick map of our most important frontend files:

| File/Folder | Description |
|---|---|
| `src/app/layout.js` | Our persistent frame — contains global UI wrappers, the custom Navbar, and the `<ClerkProvider>` that wraps the whole app for authentication. |
| `src/app/page.js` | The main dynamic content — holds unique content depending on whether the user is a guest, driver, worker, or admin. |
| `src/app/auth/` | Contains our custom Clerk routing pages for `/auth/login` and `/auth/signup`. |
| `components/` | Stores reusable UI pieces, like our smart `CustomNavbar.js`. |

---

## 📚 Learn More

To learn more about the specific technologies we are using to build VisionPark, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) — Learn about Next.js features and API.
- [Clerk Next.js Authentication Guide](https://clerk.com/docs/quickstarts/nextjs) — Learn how our authentication wrappers work.
- [Tailwind CSS Docs](https://tailwindcss.com/docs) — A quick reference guide for our styling utility classes.