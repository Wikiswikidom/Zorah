"use client";

import { useEffect, useState } from "react";

export function LandingThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("zorah-landing-theme");
    const initial = saved === "dark";
    setDark(initial);
    document.querySelector(".landing-page")?.classList.toggle("is-dark", initial);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    window.localStorage.setItem("zorah-landing-theme", next ? "dark" : "light");
    document.querySelector(".landing-page")?.classList.toggle("is-dark", next);
  };

  return <button className="landing-theme" type="button" onClick={toggle} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}>{dark ? "☼" : "◐"}</button>;
}
