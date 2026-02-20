import './globals.css';
import AuthProvider from './components/SessionProvider';
import SidebarWrapper from './components/SidebarWrapper';

export const metadata = {
  title: 'eBook Portal | Quipper & Phoenix',
  description: 'Access educational resources from Quipper and Phoenix eBook libraries.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <meta name="google" content="notranslate" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-slate-50 text-slate-800 antialiased">
        <AuthProvider>
          <SidebarWrapper>
            {children}
          </SidebarWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
