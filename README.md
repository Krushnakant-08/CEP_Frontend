# CEP Frontend - College Exam Printing Service

A modern, responsive React-based web application for managing print orders in a college environment. Built with React 19, Vite, Tailwind CSS, and React Router for a seamless user experience.

## 🚀 Features

### Core Functionality
- **User Authentication**: Secure login and registration system with JWT token-based authentication
- **Dashboard**: Real-time overview of pending and completed orders with statistics
- **Order Management**: Upload PDFs, configure print settings, and track order status
- **User Profile**: Manage personal information and view order history
- **Protected Routes**: Secured pages accessible only to authenticated users

### Print Configuration Options
- Multiple copy selection
- Print type: Black & White or Color
- Binding options: None, Stapler, Spiral, Hardbound
- Paper sizes: A4, A3, Letter
- Orientation: Portrait or Landscape
- Custom notes for special instructions

## 📁 Project Structure

```
Cep_Proj/
├── public/              # Static assets
│   └── assets/         # Public images and files
├── src/
│   ├── assets/         # Application assets (images, icons)
│   ├── components/     # Reusable React components
│   │   ├── Header.jsx           # Navigation header
│   │   └── ProtectedRoute.jsx   # Route protection wrapper
│   ├── contexts/       # React Context providers
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Page components
│   │   ├── dashboard.jsx   # Main dashboard
│   │   ├── help.jsx        # Help & support
│   │   ├── login.jsx       # Login page
│   │   ├── orders.jsx      # Order management
│   │   ├── profile.jsx     # User profile
│   │   └── register.jsx    # Registration page
│   ├── services/       # API service layer
│   ├── styles/         # Additional style files
│   ├── utils/          # Utility functions
│   ├── App.jsx         # Root component
│   ├── App.css         # App-specific styles
│   ├── main.jsx        # Application entry point
│   └── index.css       # Global styles
├── API_DOCUMENTATION.md    # Complete API endpoint documentation
├── eslint.config.js        # ESLint configuration
├── vite.config.js          # Vite configuration
├── postcss.config.js       # PostCSS configuration
├── package.json            # Project dependencies
└── index.html              # HTML entry point
```

## 🛠️ Tech Stack

### Core Technologies
- **React 19.2.0** - Latest version with React Compiler enabled
- **Vite 7.2.4** - Next-generation frontend build tool
- **React Router DOM 7.11.0** - Client-side routing
- **Tailwind CSS 4.1.18** - Utility-first CSS framework
- **Axios 1.13.2** - HTTP client for API requests

### Development Tools
- **ESLint** - Code linting and quality
- **PostCSS & Autoprefixer** - CSS processing
- **React Compiler** - Automatic optimization (Babel plugin)
- **Vite Plugin React** - Fast Refresh with HMR

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher recommended)
- **npm** or **yarn** package manager
- A modern web browser (Chrome, Firefox, Edge, Safari)

## 🚀 Getting Started

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Cep_Frontend/Cep_Proj
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   or
   ```bash
   yarn install
   ```

### Development

1. **Start the development server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`

2. **Open in browser**
   Navigate to the URL shown in your terminal

### Building for Production

1. **Create production build**
   ```bash
   npm run build
   ```
   Build artifacts will be in the `dist/` directory

2. **Preview production build locally**
   ```bash
   npm run preview
   ```

### Code Quality

**Run ESLint**
```bash
npm run lint
```

## 🔐 Authentication Flow

1. **Registration** (`/register`)
   - Users create accounts with name, email, password, and phone
   - Validation ensures secure credential handling

2. **Login** (`/login`)
   - Authenticated users receive JWT tokens
   - Tokens stored for subsequent API requests

3. **Protected Routes**
   - Dashboard, Orders, Profile, and Help pages require authentication
   - Automatic redirect to login for unauthenticated users

## 📱 Application Routes

| Route | Component | Protection | Description |
|-------|-----------|------------|-------------|
| `/` | Navigate | Public | Redirects to `/login` |
| `/login` | Login | Public | User login page |
| `/register` | Register | Public | New user registration |
| `/dashboard` | Dashboard | Protected | Main dashboard with stats |
| `/orders` | Orders | Protected | Order management interface |
| `/profile` | Profile | Protected | User profile management |
| `/help` | Help | Protected | Help and support |

## 🔌 API Integration

The application is designed to integrate with a backend API. See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for complete endpoint specifications including:

- Authentication endpoints (`/api/auth/login`, `/api/auth/register`)
- Dashboard data (`/api/dashboard`)
- Order management (`/api/orders`)
- File upload (`/api/orders/upload`)
- User profile (`/api/user/profile`)
- Pricing information (`/api/pricing`)
- Notifications (`/api/notifications`)

All protected endpoints require the `Authorization: Bearer {token}` header.

## 🎨 Styling

This project uses **Tailwind CSS v4** with:
- Modern utility-first approach
- PostCSS for processing
- Autoprefixer for browser compatibility
- Custom configurations in `postcss.config.js`

## ⚙️ Configuration Files

- **`vite.config.js`** - Vite build configuration with React Compiler plugin
- **`eslint.config.js`** - ESLint rules and code quality settings
- **`postcss.config.js`** - PostCSS and Tailwind CSS configuration
- **`package.json`** - Project metadata and dependencies

## 🔧 React Compiler

This project uses the **React Compiler** (babel-plugin-react-compiler) for automatic performance optimizations:
- Automatic memoization
- Reduced re-renders
- Improved runtime performance

⚠️ **Note**: The React Compiler may impact build times. See [React Compiler Documentation](https://react.dev/learn/react-compiler) for details.

## 📦 Key Dependencies

### Production
```json
{
  "axios": "^1.13.2",
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "react-router-dom": "^7.11.0"
}
```

### Development
```json
{
  "@vitejs/plugin-react": "^5.1.1",
  "babel-plugin-react-compiler": "^1.0.0",
  "eslint": "^9.39.1",
  "tailwindcss": "^4.1.18",
  "vite": "^7.2.4"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Development Guidelines

- Follow ESLint rules for code consistency
- Use functional components with hooks
- Implement proper error handling
- Write meaningful commit messages
- Test authentication flows thoroughly
- Ensure responsive design on all pages

## 🐛 Known Issues & Notes

- React Compiler is enabled and may increase build times
- Ensure backend API is running for full functionality
- JWT tokens should be securely stored (consider using httpOnly cookies in production)

## 📄 License

This project is private and proprietary.

## 📞 Support

For issues, questions, or support:
- Check the `/help` page in the application
- Review the API documentation
- Contact the development team

---

**Built with ❤️ by Krushnakant Patil**
