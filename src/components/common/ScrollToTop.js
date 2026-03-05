import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
    const { pathname, search } = useLocation();

    useEffect(() => {
        // Scroll to the top of the window on every route change or query change
        // Wrap in timeout to ensure it runs after React Router's internal DOM updates
        const timer = setTimeout(() => {
            window.scrollTo({
                top: 0,
                left: 0,
                behavior: "instant",
            });
        }, 0);

        return () => clearTimeout(timer);
    }, [pathname, search]);

    return null;
}
