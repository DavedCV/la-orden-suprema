# 🥷 La Orden Suprema - Frontend

Sistema de gestión moderno para asesinos profesionales inspirado en el universo de John Wick.

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Running backend server (see backend README)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# From the client directory
npm install
```

### 2. Environment Setup (Optional)

The frontend is pre-configured to connect to the backend at `http://localhost:3001/api`. If you need to change this:

Create a `.env.local` file in the client directory:

```env
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME="La Orden Suprema"
```

### 3. Run Development Server

```bash
# Start the development server
npm run dev
```

The application will be available at: **http://localhost:5173**

### 4. Build for Production

```bash
# Create production build
npm run build

# Preview production build locally
npm run preview
```

## 📦 Available Scripts

```bash
npm run dev          # Start development server (port 5173)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🔧 Configuration

### Vite Configuration

- **Development Port**: 5173
- **Auto Browser Open**: Enabled
- **Hot Module Replacement**: Enabled
- **TypeScript**: Strict mode enabled

### API Configuration

The API endpoint is configured in `src/shared/services/api.ts`:

```typescript
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api";
```

## 🎨 UI/UX Features

### Tema John Wick

- **Paleta de colores**: Tonos oscuros inspirados en el universo cinematográfico
- **Tipografía**: Fonts elegantes y profesionales
- **Animaciones**: Sutiles y fluidas para mejorar la UX
- **Componentes**: Diseño minimalista pero sofisticado

### Colores Principales

- **Orden**: Grises oscuros (#0d1117 - #6c757d)
- **Gold**: Dorado para elementos importantes (#f59e0b - #78350f)

## 🏗️ Project Structure

```
client/
├── src/
│   ├── features/           # Feature modules
│   │   ├── auth/          # Authentication
│   │   ├── dashboard/     # Dashboard views
│   │   ├── missions/      # Mission management
│   │   ├── assassins/     # Assassin management
│   │   ├── blood-markers/ # Blood marker system
│   │   └── reports/       # Reports and analytics
│   ├── shared/            # Shared resources
│   │   ├── components/    # Reusable components
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API services
│   │   ├── store/         # Zustand stores
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Utilities
│   ├── App.tsx            # Main app component
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles
├── public/                # Static assets
├── index.html             # HTML template
├── package.json           # Dependencies
├── vite.config.ts         # Vite configuration
├── tailwind.config.js     # Tailwind configuration
└── tsconfig.json          # TypeScript configuration
```

## 🔑 Key Features

### Authentication System

- JWT-based authentication
- Automatic token management
- Protected routes
- Role-based access (Admin/Assassin)
- First login password change flow

### State Management

- **Zustand** for global state (auth, user preferences)
- **TanStack Query** for server state
- Optimistic updates
- Real-time data synchronization

### Form Handling

- React Hook Form for performance
- Zod schema validation
- Real-time validation feedback
- Error handling

### UI Components

- Reusable component library
- Consistent design system
- Loading states
- Error boundaries
- Toast notifications

## 🛠️ Technology Stack

### Stack Principal

- **React 19** - Framework de UI con las últimas características
- **TypeScript** - Tipado estático para mayor seguridad
- **Vite** - Build tool extremadamente rápido
- **Tailwind CSS** - Utility-first CSS framework
- **TanStack Query** - Manejo avanzado de estado del servidor
- **Zustand** - State management simple y potente
- **React Hook Form + Zod** - Manejo de formularios con validación
- **Lucide React** - Iconos modernos y consistentes

### Arquitectura de Carpetas

```
src/
├── components/          # Componentes reutilizables
│   ├── ui/             # Componentes de UI básicos
│   └── features/       # Componentes específicos de funcionalidad
├── pages/              # Páginas de la aplicación
├── hooks/              # Custom hooks reutilizables
├── store/              # Estado global (Zustand)
├── services/           # Servicios de API y externos
├── types/              # Definiciones de TypeScript
├── utils/              # Funciones utilitarias
└── layouts/            # Layouts de página
```

## 🧩 Dependencies

### Production Dependencies

- `react` & `react-dom`: ^19.1.0
- `typescript`: ~5.8.3
- `@tanstack/react-query`: ^5.81.2
- `zustand`: ^5.0.5
- `react-hook-form`: ^7.58.1
- `zod`: ^3.25.67
- `tailwindcss`: ^3.4.0
- `lucide-react`: ^0.523.0

### Development Dependencies

- `vite`: ^7.0.0
- `@vitejs/plugin-react`: ^4.5.2
- `eslint`: ^9.29.0
- Various TypeScript type definitions

## 🚨 Troubleshooting

### Common Issues

1. **API Connection Error**

   - Ensure backend is running on port 3001
   - Check CORS settings in backend
   - Verify API URL in environment variables

2. **Build Errors**

   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Port Already in Use**

   ```bash
   # Kill process on port 5173
   lsof -ti:5173 | xargs kill -9
   ```

4. **TypeScript Errors**
   - Ensure all types are properly imported
   - Run `npm run type-check` to verify

## 🚨 Consideraciones de Seguridad

- Validación de entrada en cliente y servidor
- Sanitización de datos
- Protección contra XSS
- Tokens JWT seguros
- HTTPS en producción

## 🎯 Development Tips

1. **Use the Component Library**

   - Import from `@/shared/components`
   - Maintain consistent styling

2. **Follow Feature Structure**

   - Keep related code in feature folders
   - Export through index files

3. **Type Everything**

   - Use TypeScript interfaces
   - Avoid `any` types

4. **Use Hooks**
   - Custom hooks for logic reuse
   - Keep components clean

## 📱 Responsive Design

La aplicación está diseñada para funcionar perfectamente en:

- **Desktop**: Experiencia completa
- **Tablet**: Interfaz adaptada
- **Mobile**: Navegación optimizada

---
