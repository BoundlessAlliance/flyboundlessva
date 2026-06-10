// Boundless Alliance Login Protection

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzsdeVDsh3OThkWqQG_gFnmjUYpiX3kjBQWUTYn3NNKBIpasVs26yHKij_KJZSgAcscOA/exec";

async function verifyLogin() {
  const token = localStorage.getItem("boundlessToken");

  if (!token) {
    window.location.href = "index.html";
    return;
  }

  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "verifySession",
        token: token
      })
    });

    const result = await response.json();

    if (!result.success) {
      localStorage.clear();
      window.location.href = "index.html";
      return;
    }

    localStorage.setItem("boundlessUsername", result.username || "");
    localStorage.setItem("boundlessRole", result.role || "");
    localStorage.setItem("boundlessCreatedAt", result.createdAt || "");
    localStorage.setItem("boundlessPilotId", result.pilotId || "");
    localStorage.setItem("boundlessFullName", result.fullName || "");
    localStorage.setItem("boundlessEmail", result.email || "");
    localStorage.setItem("boundlessRank", result.rank || "");
    localStorage.setItem("boundlessPreferredAircraft", result.preferredAircraft || "");
    localStorage.setItem("boundlessHomeBase", result.homeBase || "");
    localStorage.setItem("boundlessTimeZone", result.timeZone || "");
    localStorage.setItem("boundlessEmailNotifications", result.emailNotifications || "");

    document.dispatchEvent(new Event("boundlessAuthReady"));

  } catch (error) {
    console.error("Login verification failed:", error);
    localStorage.clear();
    window.location.href = "index.html";
  }
}

verifyLogin();