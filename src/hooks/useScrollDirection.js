import { useState, useEffect, useCallback } from "react";

/**
 * Hook to track scroll direction and provide a "force show" mechanism
 */
const useScrollDirection = (threshold = 10, isMobile = true) => {
    const [scrollDir, setScrollDir] = useState("up");
    const [forceShow, setForceShow] = useState(false);

    const handleScroll = useCallback(() => {
        if (!isMobile) {
            setScrollDir("up");
            return;
        }

        const scrollY = window.pageYOffset;
        const lastScrollY = window.lastScrollY || 0;

        if (Math.abs(scrollY - lastScrollY) < threshold) {
            return;
        }

        const newDir = scrollY > lastScrollY ? "down" : "up";

        if (newDir !== scrollDir) {
            setScrollDir(newDir);
            // When direction changes, we stop forcing show unless clicked again
            setForceShow(false);
        }

        window.lastScrollY = scrollY > 0 ? scrollY : 0;
    }, [scrollDir, threshold, isMobile]);

    useEffect(() => {
        window.lastScrollY = window.pageYOffset;
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [handleScroll]);

    const toggleForceShow = useCallback(() => {
        setForceShow((prev) => !prev);
    }, []);

    const resetForceShow = useCallback(() => {
        setForceShow(false);
    }, []);

    return {
        scrollDir: forceShow ? "up" : scrollDir,
        toggleForceShow,
        resetForceShow,
        isHiding: !forceShow && scrollDir === "down"
    };
};

export default useScrollDirection;
