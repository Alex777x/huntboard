document.addEventListener("DOMContentLoaded", () => {
  const jobTitleInput = document.getElementById("jobTitle");
  const companyNameInput = document.getElementById("companyName");
  const stageSelect = document.getElementById("stage");
  const salaryInput = document.getElementById("salary");
  const notesInput = document.getElementById("notes");
  const form = document.getElementById("jobForm");
  const statusDiv = document.getElementById("statusMessage");
  const saveBtn = document.getElementById("saveBtn");

  // Query active tab and send message to content script
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || !tabs[0]) return;
    const tab = tabs[0];

    chrome.tabs.sendMessage(tab.id, { action: "extract_job" }, (response) => {
      if (chrome.runtime.lastError || !response) {
        // Fallback: use tab title and URL
        jobTitleInput.value = tab.title || "";
        notesInput.value = tab.url || "";
        return;
      }

      jobTitleInput.value = response.jobTitle || "";
      companyNameInput.value = response.companyName || "";
      salaryInput.value = response.salary || "";
      notesInput.value = response.jobUrl || tab.url || "";
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    saveBtn.disabled = true;
    saveBtn.innerText = "Saving...";

    const payload = {
      job_title: jobTitleInput.value,
      company_id: companyNameInput.value,
      stage: stageSelect.value,
      target_salary: salaryInput.value ? parseInt(salaryInput.value.replace(/\D/g, "")) || 140000 : 140000,
      notes: notesInput.value,
      created_at: new Date().toISOString(),
    };

    try {
      const storage = await chrome.storage?.sync?.get(["huntboardUrl"]).catch(() => ({}));
      const baseUrl = storage?.huntboardUrl || "http://localhost:3000";

      const res = await fetch(`${baseUrl}/api/integrations/extension`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        statusDiv.className = "status success";
        statusDiv.innerText = "✓ Saved to HuntBoard Kanban!";
        setTimeout(() => window.close(), 1500);
      } else {
        throw new Error(data.error || "Failed to save");
      }
    } catch (err) {
      statusDiv.className = "status error";
      statusDiv.innerText = "Error: Make sure HuntBoard is running at localhost:3000";
      saveBtn.disabled = false;
      saveBtn.innerText = "Save to HuntBoard Kanban";
    }
  });
});
