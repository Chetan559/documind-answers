import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import Lenis from "@studio-freight/lenis";

// Smooth scroll — inertia feel without hijacking native scroll position
const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
const raf = (time: number) => {
  lenis.raf(time);
  requestAnimationFrame(raf);
};
requestAnimationFrame(raf);

createRoot(document.getElementById("root")!).render(<App />);
