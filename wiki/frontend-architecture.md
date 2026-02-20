# Frontend Architecture

The frontend is built with **Next.js 15** and **React 19**, utilizing the **App Router** for layout-based routing and server/client component optimization.

## Directory Structure

- **`app/`**: Contains all routes and layouts.
- **`app/components/`**: Reusable React components.
- **`public/`**: Static assets.

## Key Components

### `FileViewer.js`
The core component for rendering PDF and ZIP resources. It intelligently switches between:
- **`PDFViewer.js`**: Standard scrolling PDF view.
- **`FlipViewer.js`**: 3D page-flipping animation using `react-pageflip`.

### `Sidebar.js`
Dynamically renders navigation links based on the user's role and available resources fetched from the API.

### `SidebarWrapper.js`
A client component that determines whether to show the sidebar based on the current pathname and session status.

## Layout & Styling

- **`globals.css`**: Contains core variable definitions and global styles.
- **Theme**: Slate/Indigo based theme with a strong emphasis on card-based layouts and clean typography (Inter).

## Data Fetching

Client-side data fetching is primarily handled via `useEffect` and `fetch` calls to internal API routes. State management is kept local to components or handled via NextAuth's `useSession` hook.
