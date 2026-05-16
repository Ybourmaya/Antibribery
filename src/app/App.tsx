import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { LanguageProvider } from '../contexts/LanguageContext';
import { Toaster } from './components/ui/sonner';

export default function App() {
  return (
    <LanguageProvider>
      <RouterProvider router={router} />
      <Toaster />
    </LanguageProvider>
  );
}