// Boundless Alliance Login Protection

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzsdeVDsh3OThkWqQG_gFnmjUYpiX3kjBQWUTYn3NNKBIpasVs26yHKij_KJZSgAcscOA/exec";
const BOUNDLESS_OPERATIONS_ROLES = ["CEO", "Developer", "Operations"];

function isOperationsPage() {
  return window.location.pathname.toLowerCase().endsWith("operations.html");
}

function userCanAccessOperations(role) {
  return BOUNDLESS_OPERATIONS_ROLES.includes(String(role || "").trim());
}

function updateOperationsNavigation(role) {
  const allowed = userCanAccessOperations(role);
  const links = document.querySelectorAll('a[href="operations.html"], #operationsNavLink');

  links.forEach(link => {
    link.style.display = allowed ? "" : "none";
  });
}

function revealProtectedPage() {
  document.documentElement.classList.add("boundless-auth-complete");
  document.body.classList.add("boundless-auth-complete");
}

async function verifyLogin() {
  const token = localStorage.getItem("boundlessToken");

  if (!token) {
    window.location.replace("index.html");
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
      window.location.replace("index.html");
      return;
    }

    const role = String(result.role || "").trim();
    const status = String(result.status || "").trim();

    localStorage.setItem("boundlessUsername", result.username || "");
    localStorage.setItem("boundlessRole", role);
    localStorage.setItem("boundlessStatus", status);
    localStorage.setItem("boundlessCreatedAt", result.createdAt || "");
    localStorage.setItem("boundlessPilotId", result.pilotId || "");
    localStorage.setItem("boundlessFullName", result.fullName || "");
    localStorage.setItem("boundlessEmail", result.email || "");
    localStorage.setItem("boundlessRank", result.rank || "");
    localStorage.setItem("boundlessPreferredAircraft", result.preferredAircraft || "");
    localStorage.setItem("boundlessHomeBase", result.homeBase || "");
    localStorage.setItem("boundlessTimeZone", result.timeZone || "");
    localStorage.setItem("boundlessEmailNotifications", result.emailNotifications || "");

    updateOperationsNavigation(role);

    if (isOperationsPage() && !userCanAccessOperations(role)) {
      window.location.replace("portal.html");
      return;
    }

    document.dispatchEvent(new Event("boundlessAuthReady"));
    revealProtectedPage();

  } catch (error) {
    console.error("Login verification failed:", error);
    localStorage.clear();
    window.location.replace("index.html");
  }
}

// Hide Operations links as soon as the DOM exists, then correct them after verification.
document.addEventListener("DOMContentLoaded", () => {
  updateOperationsNavigation(localStorage.getItem("boundlessRole"));
});

verifyLogin();
