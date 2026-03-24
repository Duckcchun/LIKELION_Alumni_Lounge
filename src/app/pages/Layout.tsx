import { Outlet } from 'react-router';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
