// ══════════════════════════════════════════════
//  LEARNUP ADMIN DASHBOARD — core logic
//  Storage key: learnup_subscribers (same as landing page)
// ══════════════════════════════════════════════

// ── AUTH CHECK ──
if (sessionStorage.getItem("isAdmin") !== "true") {
  window.location.href = "index.html";
}

function logoutAdmin() {
  sessionStorage.removeItem("isAdmin");
  window.location.href = "index.html";
}

const STORAGE_KEY = "learnup_subscribers";
const PER_PAGE = 10;

let subscribers = [];
let filteredData = [];
let currentPage = 1;
let prevCount = 0;
let selectedRows = new Set();

// ── INIT ──
function init() {
  updateDateTime();
  setInterval(updateDateTime, 1000);
  loadData();
  setInterval(syncData, 3000); // Sync setiap 3 detik
}

function updateDateTime() {
  const now = new Date();
  const opts = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  document.getElementById("currentDate").textContent =
    now.toLocaleDateString("id-ID", opts) +
    " · " +
    now.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
}

// ── LOAD DATA ──
function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    subscribers = raw ? JSON.parse(raw) : [];
    // Sanitasi: pastikan semua field ada
    subscribers = subscribers
      .filter((s) => s && s.email)
      .map((s, i) => ({
        email: s.email || "",
        timestamp: s.timestamp || new Date().toISOString(),
        source: s.source || "landing_page",
        status: s.status || "waitlist",
        id: s.id || "sub_" + i + "_" + Date.now(),
      }));
  } catch (e) {
    subscribers = [];
  }
}

function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subscribers));
  } catch (e) {
    showToast("Gagal menyimpan data", "error");
  }
}

// ── AUTO SYNC ──
function syncData() {
  const prevLen = subscribers.length;
  loadData();

  // Update last sync time
  const now = new Date();
  document.getElementById("lastSync").textContent = now.toLocaleTimeString(
    "id-ID",
    { hour: "2-digit", minute: "2-digit", second: "2-digit" },
  );

  if (subscribers.length > prevLen) {
    const newCount = subscribers.length - prevLen;
    showToast(`📬 ${newCount} email baru masuk!`, "success");
  }

  renderStats();
  renderTable();
  document.getElementById("sidebarCount").textContent = subscribers.length;
}

// ── STATS ──
function renderStats() {
  const total = subscribers.length;
  const today = subscribers.filter((s) => {
    const d = new Date(s.timestamp);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length;
  const confirmed = subscribers.filter((s) => s.status === "confirmed").length;
  const waitlist = subscribers.filter((s) => s.status === "waitlist").length;

  document.getElementById("statTotal").textContent = total;
  document.getElementById("statToday").textContent = today;
  document.getElementById("statConfirmed").textContent = confirmed;
  document.getElementById("statWaitlist").textContent = waitlist;
  document.getElementById("headerCount").textContent = total;
  document.getElementById("sidebarCount").textContent = total;

  if (prevCount > 0) {
    const diff = total - prevCount;
    if (diff > 0) {
      document.getElementById("statTrend1").innerHTML =
        `<i class="fa-solid fa-arrow-up"></i> +${diff} dari sebelumnya`;
      document.getElementById("statTrend1").className = "stat-trend";
    }
  }
  prevCount = total;

  document.getElementById("statTrend2").innerHTML =
    today > 0 ? `<i class="fa-solid fa-fire"></i> ${today} hari ini` : "—";
}

// ── TABLE RENDER ──
function renderTable() {
  const search = document.getElementById("searchInput").value.toLowerCase();
  const filterStatus = document.getElementById("filterStatus").value;
  const sort = document.getElementById("filterSort").value;

  filteredData = subscribers.filter((s) => {
    const matchSearch = !search || s.email.toLowerCase().includes(search);
    const matchStatus = !filterStatus || s.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // Sort
  filteredData.sort((a, b) => {
    if (sort === "newest") return new Date(b.timestamp) - new Date(a.timestamp);
    if (sort === "oldest") return new Date(a.timestamp) - new Date(b.timestamp);
    if (sort === "email") return a.email.localeCompare(b.email);
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(filteredData.length / PER_PAGE));
  if (currentPage > totalPages) currentPage = totalPages;

  const start = (currentPage - 1) * PER_PAGE;
  const pageData = filteredData.slice(start, start + PER_PAGE);

  const tbody = document.getElementById("tableBody");
  const empty = document.getElementById("emptyState");

  if (filteredData.length === 0) {
    tbody.innerHTML = "";
    empty.classList.add("show");
  } else {
    empty.classList.remove("show");
    tbody.innerHTML = pageData
      .map((s, i) => {
        const realIdx = subscribers.indexOf(s);
        const dt = new Date(s.timestamp);
        const dateStr = dt.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
        const timeStr = dt.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        });
        const initials = s.email.substring(0, 2).toUpperCase();
        const statusClass =
          {
            waitlist: "status-waitlist",
            confirmed: "status-confirmed",
            invited: "status-invited",
          }[s.status] || "status-waitlist";
        const statusLabel =
          {
            waitlist: "⏳ Waitlist",
            confirmed: "✅ Confirmed",
            invited: "📨 Invited",
          }[s.status] || s.status;
        const sourceLabel =
          {
            landing_page: "🌐 Landing Page",
            manual: "✍️ Manual",
            api: "🔌 API",
          }[s.source] || s.source;
        const checked = selectedRows.has(realIdx) ? "checked" : "";
        return `
          <tr id="row_${realIdx}">
            <td><input type="checkbox" ${checked} onchange="toggleRow(${realIdx},this)" style="accent-color:var(--primary);width:14px;height:14px;cursor:pointer;" /></td>
            <td>
              <div class="td-email">
                <div class="email-avatar">${initials}</div>
                ${s.email}
              </div>
            </td>
            <td class="td-date">${dateStr}</td>
            <td class="td-time">${timeStr}</td>
            <td style="font-size:0.75rem;color:var(--text-2);">${sourceLabel}</td>
            <td><span class="status-badge ${statusClass}">${statusLabel}</span></td>
            <td>
              <div class="row-actions">
                <div class="icon-btn" title="Edit" onclick="openEditModal(${realIdx})"><i class="fa-solid fa-pen"></i></div>
                <div class="icon-btn del" title="Hapus" onclick="confirmDelete(${realIdx})"><i class="fa-solid fa-trash"></i></div>
              </div>
            </td>
          </tr>`;
      })
      .join("");
  }

  // Pagination
  renderPagination(filteredData.length, totalPages);
}

function renderPagination(total, totalPages) {
  const start = (currentPage - 1) * PER_PAGE + 1;
  const end = Math.min(currentPage * PER_PAGE, total);
  document.getElementById("pageInfo").textContent =
    total === 0
      ? "Tidak ada data"
      : `Menampilkan ${start}–${end} dari ${total} subscriber`;

  const container = document.getElementById("pageBtns");
  let html = `<button class="page-btn" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? "disabled" : ""}><i class="fa-solid fa-chevron-left" style="font-size:0.65rem;"></i></button>`;

  for (let p = 1; p <= totalPages; p++) {
    if (
      totalPages > 7 &&
      Math.abs(p - currentPage) > 2 &&
      p !== 1 &&
      p !== totalPages
    ) {
      if (p === 2 || p === totalPages - 1)
        html += `<span style="color:var(--text-3);padding:0 4px;">…</span>`;
      continue;
    }
    html += `<button class="page-btn ${p === currentPage ? "active" : ""}" onclick="changePage(${p})">${p}</button>`;
  }

  html += `<button class="page-btn" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? "disabled" : ""}><i class="fa-solid fa-chevron-right" style="font-size:0.65rem;"></i></button>`;
  container.innerHTML = html;
}

function changePage(p) {
  const totalPages = Math.ceil(filteredData.length / PER_PAGE);
  if (p < 1 || p > totalPages) return;
  currentPage = p;
  renderTable();
}

// ── SELECTION ──
function toggleRow(idx, cb) {
  if (cb.checked) selectedRows.add(idx);
  else selectedRows.delete(idx);
}

function toggleSelectAll(cb) {
  const rows = document.querySelectorAll("#tableBody input[type=checkbox]");
  rows.forEach((r, i) => {
    r.checked = cb.checked;
    const start = (currentPage - 1) * PER_PAGE;
    const s = filteredData[start + i];
    const realIdx = subscribers.indexOf(s);
    if (cb.checked) selectedRows.add(realIdx);
    else selectedRows.delete(realIdx);
  });
}

// ── ADD MANUAL ──
function openAddModal() {
  document.getElementById("addEmailInput").value = "";
  document.getElementById("addStatusInput").value = "waitlist";
  document.getElementById("addModal").classList.add("open");
  setTimeout(() => document.getElementById("addEmailInput").focus(), 100);
}

function addManual() {
  const email = document.getElementById("addEmailInput").value.trim();
  const status = document.getElementById("addStatusInput").value;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast("Masukkan email yang valid!", "error");
    return;
  }
  if (subscribers.some((s) => s.email === email)) {
    showToast("Email sudah terdaftar!", "error");
    return;
  }
  subscribers.unshift({
    email,
    timestamp: new Date().toISOString(),
    source: "manual",
    status,
    id: "sub_manual_" + Date.now(),
  });
  saveData();
  closeModal("addModal");
  renderStats();
  renderTable();
  showToast("✅ Email berhasil ditambahkan!", "success");
}

// ── EDIT ──
function openEditModal(idx) {
  const s = subscribers[idx];
  document.getElementById("editEmailInput").value = s.email;
  document.getElementById("editStatusInput").value = s.status;
  document.getElementById("editIndexInput").value = idx;
  document.getElementById("editModal").classList.add("open");
}

function saveEdit() {
  const idx = parseInt(document.getElementById("editIndexInput").value);
  const email = document.getElementById("editEmailInput").value.trim();
  const status = document.getElementById("editStatusInput").value;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast("Email tidak valid!", "error");
    return;
  }
  subscribers[idx].email = email;
  subscribers[idx].status = status;
  saveData();
  closeModal("editModal");
  renderTable();
  showToast("✅ Data berhasil diperbarui!", "success");
}

// ── DELETE ──
function confirmDelete(idx) {
  document.getElementById("confirmTitle").textContent = "🗑️ Hapus Subscriber";
  document.getElementById("confirmMsg").textContent =
    `Hapus "${subscribers[idx].email}" dari daftar? Tindakan ini tidak dapat dibatalkan.`;
  document.getElementById("confirmOkBtn").onclick = () => {
    subscribers.splice(idx, 1);
    saveData();
    closeModal("confirmModal");
    renderStats();
    renderTable();
    showToast("Email dihapus.", "info");
  };
  document.getElementById("confirmModal").classList.add("open");
}

function confirmClearAll() {
  if (subscribers.length === 0) {
    showToast("Tidak ada data untuk dihapus.", "error");
    return;
  }
  document.getElementById("confirmTitle").textContent = "⚠️ Hapus Semua Data";
  document.getElementById("confirmMsg").textContent =
    `Ini akan menghapus semua ${subscribers.length} subscriber secara permanen!`;
  document.getElementById("confirmOkBtn").onclick = () => {
    subscribers = [];
    saveData();
    closeModal("confirmModal");
    renderStats();
    renderTable();
    showToast("Semua data dihapus.", "info");
  };
  document.getElementById("confirmModal").classList.add("open");
}

// ── MODAL ──
function closeModal(id) {
  document.getElementById(id).classList.remove("open");
}

document.querySelectorAll(".modal-overlay").forEach((overlay) => {
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.classList.remove("open");
  });
});

// ── SECTION NAV ──
function showSection(name) {
  document.getElementById("section-subscribers").style.display =
    name === "subscribers" ? "" : "none";
  document.getElementById("section-analytics").style.display =
    name === "analytics" ? "" : "none";
  document
    .querySelectorAll(".nav-item")
    .forEach((n) => n.classList.remove("active"));
  if (name === "analytics") renderAnalytics();
}

// ── ANALYTICS ──
function renderAnalytics() {
  // 7-day chart
  const days = [];
  const labels = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const ds = d.toDateString();
    const count = subscribers.filter(
      (s) => new Date(s.timestamp).toDateString() === ds,
    ).length;
    days.push(count);
    labels.push(d.toLocaleDateString("id-ID", { weekday: "short" }));
  }
  const maxDay = Math.max(...days, 1);
  document.getElementById("weekChart").innerHTML = days
    .map(
      (c, i) =>
        `<div class="mini-bar" style="height:${Math.max(4, (c / maxDay) * 90)}px;" title="${labels[i]}: ${c}"></div>`,
    )
    .join("");
  document.getElementById("weekLabels").innerHTML = labels
    .map((l) => `<span class="chart-label">${l}</span>`)
    .join("");

  // Status pie
  const statusCounts = { waitlist: 0, confirmed: 0, invited: 0 };
  subscribers.forEach((s) => {
    if (statusCounts[s.status] !== undefined) statusCounts[s.status]++;
  });
  const total = subscribers.length || 1;
  const statusColors = {
    waitlist: "#6c63ff",
    confirmed: "#43e6c5",
    invited: "#ffd166",
  };
  const statusLabels = {
    waitlist: "⏳ Waitlist",
    confirmed: "✅ Confirmed",
    invited: "📨 Invited",
  };
  document.getElementById("statusPie").innerHTML = Object.entries(statusCounts)
    .map(
      ([k, v]) => `
      <div style="display:flex;align-items:center;gap:0.8rem;">
        <div style="flex:1;background:rgba(255,255,255,0.05);border-radius:99px;height:10px;overflow:hidden;">
          <div style="height:100%;width:${Math.round((v / total) * 100)}%;background:${statusColors[k]};border-radius:99px;transition:width 0.8s;"></div>
        </div>
        <span style="font-size:0.72rem;font-weight:700;color:${statusColors[k]};min-width:80px;">${statusLabels[k]}</span>
        <span style="font-size:0.72rem;color:var(--text-3);min-width:40px;text-align:right;">${v} (${Math.round((v / total) * 100)}%)</span>
      </div>`,
    )
    .join("");

  // Recent list
  const recent = [...subscribers]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5);
  document.getElementById("recentList").innerHTML =
    recent
      .map((s) => {
        const dt = new Date(s.timestamp);
        const initials = s.email.substring(0, 2).toUpperCase();
        return `
        <div style="display:flex;align-items:center;gap:0.8rem;padding:0.6rem;background:var(--card);border-radius:10px;border:1px solid var(--border);">
          <div class="email-avatar">${initials}</div>
          <div style="flex:1;min-width:0;">
            <div style="font-size:0.82rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${s.email}</div>
            <div style="font-size:0.65rem;color:var(--text-3);">${dt.toLocaleString("id-ID")}</div>
          </div>
          <span class="status-badge ${s.status === "confirmed" ? "status-confirmed" : s.status === "invited" ? "status-invited" : "status-waitlist"}" style="font-size:0.6rem;">${s.status}</span>
        </div>`;
      })
      .join("") ||
    '<div style="color:var(--text-3);font-size:0.8rem;text-align:center;padding:1rem;">Belum ada data.</div>';
}

// ── EXPORT ──
function toggleExport() {
  document.getElementById("exportMenu").classList.toggle("open");
}

document.addEventListener("click", (e) => {
  if (!e.target.closest(".export-wrap")) {
    document.getElementById("exportMenu").classList.remove("open");
  }
});

function exportCSV() {
  const header = "Email,Tanggal,Waktu,Sumber,Status";
  const rows = subscribers.map((s) => {
    const dt = new Date(s.timestamp);
    return `${s.email},${dt.toLocaleDateString("id-ID")},${dt.toLocaleTimeString("id-ID")},${s.source},${s.status}`;
  });
  const csv = [header, ...rows].join("\n");
  download("learnup_subscribers.csv", "text/csv", csv);
  showToast("✅ CSV berhasil diexport!", "success");
  document.getElementById("exportMenu").classList.remove("open");
}

function exportJSON() {
  download(
    "learnup_subscribers.json",
    "application/json",
    JSON.stringify(subscribers, null, 2),
  );
  showToast("✅ JSON berhasil diexport!", "success");
  document.getElementById("exportMenu").classList.remove("open");
}

function copyEmails() {
  const emails = subscribers.map((s) => s.email).join("\n");
  navigator.clipboard.writeText(emails).then(() => {
    showToast(`📋 ${subscribers.length} email disalin!`, "success");
  });
  document.getElementById("exportMenu").classList.remove("open");
}

function download(filename, mime, content) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([content], { type: mime }));
  a.download = filename;
  a.click();
}

// ── TOAST ──
function showToast(msg, type = "success") {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className = `toast ${type}`;
  void t.offsetWidth;
  t.classList.add("show");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove("show"), 3500);
}

// ── KEYBOARD ──
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document
      .querySelectorAll(".modal-overlay.open")
      .forEach((m) => m.classList.remove("open"));
  }
  if (
    e.key === "Enter" &&
    document.getElementById("addModal").classList.contains("open")
  ) {
    addManual();
  }
  if (
    e.key === "Enter" &&
    document.getElementById("editModal").classList.contains("open")
  ) {
    saveEdit();
  }
});

// ── START ──
init();
// ── THEME TOGGLE ──
document.addEventListener("DOMContentLoaded", () => {
  const themeBtn = document.getElementById("themeBtn");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const current =
        document.documentElement.getAttribute("data-theme") || "dark";
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("learnup-theme", next);
    });
  }
});
