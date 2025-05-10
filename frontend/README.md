# Frontend (VertiFast)

This directory contains the frontend React application for VertiFast, built with modern web technologies and best practices.

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- ESLint
- PostCSS

## Directory Structure

```
src/
├── components/     # Reusable React components
├── types/         # TypeScript type definitions
├── App.tsx        # Main application component
├── config.ts      # Application configuration
├── index.css      # Global styles
├── main.tsx       # Application entry point
└── vite-env.d.ts  # Vite environment types
```

## Getting Started

1. Make sure you're in the root directory of the project
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`
4. Start the development server:
   ```bash
   npm run dev
   ```

## Development

- The application uses TypeScript for type safety
- Styling is handled through Tailwind CSS
- Components are organized in the `components/` directory
- Type definitions are kept in the `types/` directory

## Building for Production

To create a production build:

```bash
npm run build
```

The build output will be in the `dist/` directory.

## Code Style

- The project uses ESLint for code linting
- Follow the existing code style and component structure
- Use TypeScript types for all components and functions
- Keep components small and focused on a single responsibility
- Use Tailwind CSS for styling

## Environment Variables

Make sure to set up the following environment variables in your `.env` file:

- Required environment variables can be found in `.env.example` in the root directory

## Related Documentation

- [Main Project README](../README.md)
- [Architecture Documentation](../ARCHITECTURE.md)
