import { useEffect, useRef } from "react";

const useClickOutside = (handler, { enabled = true } = {}) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event) => {
      // Ignorar clicks en elementos de Material-UI
      const ignoredSelectors = [
        ".MuiPopover-root",
        ".MuiMenu-root",
        ".MuiSelect-root",
        ".MuiAutocomplete-popper",
        ".MuiModal-root",
      ];

      const isIgnored = ignoredSelectors.some((selector) =>
        event.target.closest(selector),
      );

      if (isIgnored) return;

      if (ref.current && !ref.current.contains(event.target)) {
        handler(event);
      }
    };

    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 10);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handler, enabled]);

  return ref; // ✅ Retornar la ref
};

export default useClickOutside;
