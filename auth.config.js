export default {
    pages: {
        signIn: "/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const hasRole = !!auth?.user?.role;
            const isLoginPage = nextUrl.pathname === '/login';
            const isApiAuthPage = nextUrl.pathname.startsWith('/api/auth');

            // Allow API auth and login page always
            if (isApiAuthPage || isLoginPage) return true;

            // If logged in but session is stale (missing role), force redirect to login
            if (isLoggedIn && !hasRole) {
                return false;
            }

            // Standard protected route check
            return isLoggedIn;
        },
    },
    providers: [], // Providers will be added in auth.js
};
