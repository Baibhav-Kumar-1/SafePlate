import { Inter } from 'next/font/google';
import { Providers } from './providers';
import Header from './components/Header';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: {
    template: '%s | SafePlate',
    default: 'SafePlate - Allergen-Aware Menu Scanner',
  },
  description: 'Scan restaurant menus and identify potential allergens instantly',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="flex-grow">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
