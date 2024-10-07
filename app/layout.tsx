'use client';
import { LayoutProvider } from '../layout/context/layoutcontext';
import { PrimeReactProvider } from 'primereact/api';
import 'primereact/resources/primereact.css';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import '../styles/layout/layout.scss';
import '../styles/demo/Demos.scss';
import { Cairo } from '@next/font/google'
import withAuth from '../app/(full-page)/auth/hoc/withAuth';
const cairo = Cairo({
    subsets: ['latin'],
    weight: ['800', '800'], // Use the weights you need
  });
interface RootLayoutProps {
    children: React.ReactNode;
}

 function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="ar" suppressHydrationWarning>
            <head>
                <link id="theme-css" href={`/themes/lara-light-indigo/theme.css`} rel="stylesheet"></link>
                <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap"
          rel="stylesheet"
        />
            </head>
            <body>
                <PrimeReactProvider>
                    <LayoutProvider><div className={cairo.className} >{children}</div></LayoutProvider>
                </PrimeReactProvider>
            </body>
        </html>
    );
}
export default RootLayout
