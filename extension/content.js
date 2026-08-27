// Content script to detect job details from web pages
function extractJobInfo() {
  const url = window.location.href;
  let jobTitle = "";
  let companyName = "";
  let location = "";
  let salary = "";
  let description = "";

  // 1. LinkedIn Job Details
  if (url.includes("linkedin.com")) {
    const titleEl =
      document.querySelector(".job-details-jobs-unified-top-card__job-title") ||
      document.querySelector(".jobs-unified-top-card__job-title") ||
      document.querySelector("h1");
    if (titleEl) jobTitle = titleEl.innerText.trim();

    const companyEl =
      document.querySelector(".job-details-jobs-unified-top-card__company-name") ||
      document.querySelector(".jobs-unified-top-card__company-name") ||
      document.querySelector(".jobs-unified-top-card__subtitle-primary-grouping a");
    if (companyEl) companyName = companyEl.innerText.trim();

    const locationEl =
      document.querySelector(".job-details-jobs-unified-top-card__bullet") ||
      document.querySelector(".jobs-unified-top-card__bullet");
    if (locationEl) location = locationEl.innerText.trim();

    const descEl =
      document.querySelector("#job-details") ||
      document.querySelector(".jobs-description__content") ||
      document.querySelector(".jobs-box__html-content");
    if (descEl) description = descEl.innerText.trim().slice(0, 1500);
  }

  // 2. Indeed Job Details
  else if (url.includes("indeed.com")) {
    const titleEl = document.querySelector("h1.jobsearch-JobInfoHeader-title") || document.querySelector("h1");
    if (titleEl) jobTitle = titleEl.innerText.trim();

    const companyEl = document.querySelector("[data-company-name='true']") || document.querySelector(".jobsearch-InlineCompanyRating-companyHeader");
    if (companyEl) companyName = companyEl.innerText.trim();

    const descEl = document.querySelector("#jobDescriptionText");
    if (descEl) description = descEl.innerText.trim().slice(0, 1500);
  }

  // 3. Fallback generic meta tags
  if (!jobTitle) {
    const ogTitle = document.querySelector("meta[property='og:title']");
    if (ogTitle) jobTitle = ogTitle.getAttribute("content") || "";
  }

  return {
    jobTitle: jobTitle || document.title || "Software Engineer",
    companyName: companyName || "Company",
    location: location || "Remote",
    salary: salary || "",
    description: description || "",
    jobUrl: url,
  };
}

// Listen for requests from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extract_job") {
    const data = extractJobInfo();
    sendResponse(data);
  }
  return true;
});
