document.addEventListener("DOMContentLoaded", () => {
  const enableToggle = document.getElementById("enableToggle");
  const alignToggle = document.getElementById("alignToggle");
  const alwaysRTLToggle = document.getElementById("alwaysRTLToggle");
  const excludeSiteInput = document.getElementById("excludeSite");
  const addSiteButton = document.getElementById("addSite");
  const siteList = document.getElementById("siteList");

  chrome.storage.sync.get(
    ["enabled", "alignRight", "alwaysRTL", "excludedSites"],
    (data) => {
      enableToggle.checked = data.enabled !== false;
      alignToggle.checked = data.alignRight !== false;
      alwaysRTLToggle.checked = data.alwaysRTL === true;
      renderSiteList(data.excludedSites || []);
    }
  );

  enableToggle.addEventListener("change", () => {
    chrome.storage.sync.set({ enabled: enableToggle.checked });
    chrome.runtime.sendMessage({
      action: "toggleRTL",
      enabled: enableToggle.checked,
    });
  });

  alignToggle.addEventListener("change", () => {
    chrome.storage.sync.set({ alignRight: alignToggle.checked });
  });

  alwaysRTLToggle.addEventListener("change", () => {
    chrome.storage.sync.set({ alwaysRTL: alwaysRTLToggle.checked });
    chrome.runtime.sendMessage({
      action: "toggleAlwaysRTL",
      alwaysRTL: alwaysRTLToggle.checked,
    });
  });

  addSiteButton.addEventListener("click", () => {
    const newSite = excludeSiteInput.value.trim();
    if (!newSite) return;
    chrome.storage.sync.get("excludedSites", (data) => {
      const currentSites = data.excludedSites || [];
      if (!currentSites.includes(newSite)) {
        const updatedSites = [...currentSites, newSite];
        chrome.storage.sync.set({ excludedSites: updatedSites }, () => {
          renderSiteList(updatedSites);
          excludeSiteInput.value = "";
        });
      }
    });
  });

  function renderSiteList(sites) {
    siteList.innerHTML = "";
    sites.forEach((site) => {
      const li = document.createElement("li");
      li.textContent = site;
      li.title = "Click to remove";
      li.addEventListener("click", () => {
        chrome.storage.sync.get("excludedSites", (data) => {
          const updatedSites = (data.excludedSites || []).filter(
            (s) => s !== site
          );
          chrome.storage.sync.set({ excludedSites: updatedSites }, () => {
            renderSiteList(updatedSites);
          });
        });
      });
      siteList.appendChild(li);
    });
  }
});
