import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Hook to track scroll direction and provide a "force show" mechanism
 */
const useScrollDirection = (threshold = 10, enabled = true) => {
    const [scrollDir, setScrollDir] = useState("up");
    const [forceShow, setForceShow] = useState(false);
    const lastScrollY = useRef(0);

    const handleScroll = useCallback(() => {
        if (!enabled) {
            setScrollDir("up");
            return;
        }

        const scrollY = window.pageYOffset;
        const previousScrollY = lastScrollY.current;

        if (scrollY <= 0) {
            setScrollDir("up");
            lastScrollY.current = 0;
            return;
        }

        if (Math.abs(scrollY - previousScrollY) < threshold) {
            return;
        }

        const newDir = scrollY > previousScrollY ? "down" : "up";

        if (newDir !== scrollDir) {
            setScrollDir(newDir);
            setForceShow(false);
        }

        lastScrollY.current = scrollY;
    }, [scrollDir, threshold, enabled]);

    useEffect(() => {
        lastScrollY.current = window.pageYOffset;
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
