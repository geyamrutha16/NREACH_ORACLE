import { useEffect, useState } from "react";

function usePwaInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showInstallReminder, setShowInstallReminder] = useState(false);

    useEffect(() => {
        const handler = (e) => {
            e.preventDefault(); // prevent default mini prompt
            setDeferredPrompt(e);
            setShowInstallReminder(true); // show custom reminder
        };

        window.addEventListener("beforeinstallprompt", handler);

        return () => window.removeEventListener("beforeinstallprompt", handler);
    }, []);

    const promptInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt(); // show native prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log("User choice:", outcome);
        setShowInstallReminder(false); // hide reminder
        setDeferredPrompt(null);
    };

    return { showInstallReminder, promptInstall };
}

export default usePwaInstallPrompt;
