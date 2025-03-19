// Regex לזיהוי תווים בעברית/ערבית/פרסית
const rtlRegex = /[\u0590-\u05FF\u0600-\u06FF]/

// פונקציית debounce לשיפור ביצועים
function debounce(func, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}

/**
 * הפונקציה הראשית שקובעת RTL/LTR לפי מצב alwaysRTL או זיהוי עברית
 */
function setRTLIfHebrew(element) {
  chrome.storage.sync.get(
    ["enabled", "alignRight", "excludedSites", "alwaysRTL"],
    (data) => {
      if (chrome.runtime.lastError) {
        console.warn(
          "Error fetching storage data: " + chrome.runtime.lastError.message
        );
        return;
      }

      const enabled = data.enabled ?? true;
      const alignRight = data.alignRight ?? true;
      const alwaysRTL = data.alwaysRTL ?? false;
      const excludedSites = data.excludedSites || [];

      // אם התוסף מכובה או שהאתר מוחרג – מסירים סגנונות
      if (
        !enabled ||
        excludedSites.some((site) => location.hostname.includes(site))
      ) {
        element.style.removeProperty("direction");
        element.style.removeProperty("text-align");
        return;
      }

      // אם alwaysRTL = true => כל הדף RTL
      if (alwaysRTL) {
        document.documentElement.style.setProperty(
          "direction",
          "rtl",
          "important"
        );
        document.documentElement.style.setProperty(
          "text-align",
          "right",
          "important"
        );
        return;
      }

      // אחרת, חוזרים ללוגיקה הרגילה לזיהוי עברית בשדה
      // וכמו כן מסירים directional style מה־documentElement למקרה שכיבינו AlwaysRTL
      document.documentElement.style.removeProperty("direction");
      document.documentElement.style.removeProperty("text-align");

      let text = "";
      if (element.isContentEditable) {
        text = element.textContent;
      } else if (typeof element.value === "string") {
        text = element.value;
      }

      if (rtlRegex.test(text)) {
        element.style.setProperty("direction", "rtl", "important");
        element.style.setProperty(
          "text-align",
          alignRight ? "right" : "left",
          "important"
        );
      } else {
        element.style.setProperty("direction", "ltr", "important");
        element.style.setProperty("text-align", "left", "important");
      }
    }
  );
}

const debouncedSetRTL = debounce(setRTLIfHebrew, 200);

function handleInput(event) {
  debouncedSetRTL(event.target);
}

function initFields() {
  document
    .querySelectorAll('textarea, input[type="text"], [contenteditable="true"]')
    .forEach((field) => {
      setRTLIfHebrew(field);
      field.addEventListener("input", handleInput);
    });
}

// מנטרים אלמנטים חדשים ב־DOM
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        if (
          node.matches('textarea, input[type="text"], [contenteditable="true"]')
        ) {
          setRTLIfHebrew(node);
          node.addEventListener("input", handleInput);
        } else {
          node
            .querySelectorAll(
              'textarea, input[type="text"], [contenteditable="true"]'
            )
            .forEach((field) => {
              setRTLIfHebrew(field);
              field.addEventListener("input", handleInput);
            });
        }
      }
    });
  });
});
observer.observe(document.body, { childList: true, subtree: true });

// הפעלה ראשונית
chrome.storage.sync.get("enabled", (data) => {
  if (data.enabled !== false) {
    initFields();
  }
});
