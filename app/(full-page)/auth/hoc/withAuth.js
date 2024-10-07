import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { redirect } from 'next/navigation'

const withAuth = (WrappedComponent) => {
  const WithAuth = (props) => {
    const [isMounted, setIsMounted] = useState(false); // Track if the component is mounted

    useEffect(() => {
      setIsMounted(true); // Component is now mounted
    }, []);

    useEffect(() => {
      if (isMounted) {
        const isAuthenticated = !!localStorage.getItem('token'); // Check if user is authenticated
        if (!isAuthenticated) {
          redirect(`/auth/login`); // Redirect to login page if not authenticated
        }
      }
    }, [isMounted]);

    // If the component is not yet mounted, do not render anything
    if (!isMounted) {
      return null; // Return nothing while waiting for the client-side
    }

    // If authenticated, render the component
    return <WrappedComponent {...props} />;
  };

  // Add a displayName for better debugging and ESLint compliance
  WithAuth.displayName = `WithAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithAuth;
};

export default withAuth;
