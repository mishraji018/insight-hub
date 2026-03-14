import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

async function enableMocking() {
    if (import.meta.env.VITE_MOCK !== 'true') {
        return;
    }
    const { worker } = await import('./mocks/browser');
    // FIXED: Starting MSW worker for standalone demo
    return worker.start({
        onUnhandledRequest: 'bypass',
    });
}

enableMocking().then(() => {
    ReactDOM.createRoot(document.getElementById("root")!).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );

    // Register service worker
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').then(() => {
                // SW registered
            }).catch(() => {
                // SW registration failed
            });
        });
    }
});
