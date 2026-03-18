// Dummy data - replace with live Google Sheets later
const DUMMY_DIRECTORY = [
  { mobile_number: "9876543210", category: "plumber", name: "Ramesh Plumber", area: "Tower A", tags: "leak repair, pipes" },
  { mobile_number: "9876543220", category: "plumber", name: "Suresh Water Fix", area: "Tower B", tags: "water tank" },
  { mobile_number: "9876543230", category: "electrician", name: "Govind Electric", area: "Tower A", tags: "wiring, fan" },
  { mobile_number: "9876543240", category: "electrician", name: "Rajesh Lights", area: "Gate 1", tags: "LED lights" },
  { mobile_number: "9876543250", category: "food", name: "Maa Tiffin Service", area: "Tower C", tags: "veg, non-veg" },
  { mobile_number: "9876543260", category: "food", name: "Sharma Dabbawala", area: "Tower A", tags: "office lunch" },
  { mobile_number: "9876543270", category: "vegetable", name: "Sabziwala Bhai", area: "Main Market", tags: "fresh veggies" },
  { mobile_number: "9876543280", category: "maid", name: "Sunita Tai", area: "Tower B", tags: "cleaning, cooking" }
];

let DIRECTORY = [...DUMMY_DIRECTORY];
let currentUser = null;
let currentCategory = null;

// DOM helpers
function $(id) { return document.getElementById(id); }

// Auth logic - FIXED
function handleAuthSubmit() {
  console.log("Auth button clicked!"); // Debug log
  const name = $("#user-name").value.trim();
  const mobile = $("#user-mobile").value.trim();
  const errorEl = $("#auth-error");
  
  if (!name || !mobile || !/^\d{10}$/.test(mobile)) {
    errorEl.textContent = "Please enter valid name & 10-digit mobile.";
    errorEl.classList.remove("hidden");
    return;
  }
  
  currentUser = { name, mobile };
  localStorage.setItem("societyUser", JSON.stringify(currentUser));
  errorEl.classList.add("hidden");
  showDirectoryScreen();
  console.log("Auth successful, showing directory"); // Debug log
}

function showDirectoryScreen() {
  $("#auth-screen").classList.add("hidden");
  $("#directory-screen").classList.remove("hidden");
}

// Chat functionality
function appendMessage(text, sender = "bot") {
  const chatWindow = $("#chat-window");
  const div = document.createElement("div");
  div.className = `p-4 rounded-2xl ${sender === "bot" ? "bg-blue-100 text-gray-800 max-w-xs" : "bg-green-200 text-gray-900 ml-auto max-w-xs"} shadow-sm mb-3`;
  div.innerHTML = text;
  chatWindow.appendChild(div);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function normalize(text) {
  return text.toLowerCase().trim();
}

function extractIntent(query) {
  const norm = normalize(query);
  const intent = { category: null, area: null, number: null };
  
  const categoryMap = {
    plumber: ["plumber", "plambar"],
    electrician: ["electrician", "bijli"],
    food: ["food", "tiffin", "dabba"],
    vegetable: ["sabzi", "sabji"],
    maid: ["maid", "kaamwali"]
  };
  
  for (const [cat, keywords] of Object.entries(categoryMap)) {
    if (keywords.some(kw => norm.includes(kw))) {
      intent.category = cat;
      break;
    }
  }
  
  const areaMatch = norm.match(/(tower|block|gate)\s*([a-z0-9]+)/i);
  if (areaMatch) intent.area = areaMatch[2].toUpperCase();
  
  const numMatch = norm.match(/(\d{4,})/);
  if (numMatch) intent.number = numMatch[1];
  
  return intent;
}

function searchDirectory(query) {
  const intent = extractIntent(query);
  return DIRECTORY.filter(entry => {
    let matches = true;
    if (intent.number && !entry.mobile_number.includes(intent.number)) matches = false;
    if (intent.category && entry.category !== intent.category) matches = false;
    if (intent.area && !entry.area.toUpperCase().includes(intent.area)) matches = false;
    return matches;
  });
}

function handleChatMessage() {
  const input = $("#chat-input");
  const query = input.value.trim();
  if (!query) return;
  
  appendMessage(`<strong>You:</strong> ${query}`, "user");
  input.value = "";
  
  const results = searchDirectory(query);
  
  if (results.length === 0) {
    appendMessage("❌ No services found. Try 'plumber', '98765', or 'tiffin Tower A'.", "bot");
    return;
  }
  
  let reply = `<strong>✅ Found ${results.length} service(s):</strong><br><br>`;
  results.slice(0, 3).forEach(entry => {
    reply += `
      <div class="mt-3 p-3 bg-white rounded-xl shadow-md">
        <div class="font-bold">${entry.name}</div>
        <div class="text-sm text-gray-600">${entry.area} • ${entry.category.toUpperCase()}</div>
        <div class="text-xs bg-gray-100 px-2 py-1 rounded mt-1">${entry.mobile_number}</div>
      </div>`;
  });
  
  appendMessage(reply, "bot");
}

// Category browser - FIXED selectors & logic
function renderCategories() {
  const gridContainer = document.querySelector("#category-tab-content .grid");
  if (!gridContainer) return;
  
  const uniqueCats = [...new Set(DIRECTORY.map(d => d.category))];
  gridContainer.innerHTML = uniqueCats.map(cat => {
    const count = DIRECTORY.filter(d => d.category === cat).length;
    return `
      <button class="category-btn p-6 rounded-3xl bg-gradient-to-br from-gray-50 to-gray-100 hover:from-primary/10 hover:to-blue-100 border-2 border-transparent hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] text-left group" 
              data-category="${cat}">
        <div class="text-3xl mb-3">${getCategoryEmoji(cat)}</div>
        <div class="font-bold text-lg text-gray-900">${formatCategory(cat)}</div>
        <div class="text-sm text-gray-500 group-hover:text-primary mt-1">${count} vendors</div>
      </button>
    `;
  }).join('');
}

function getCategoryEmoji(cat) {
  const emojis = { plumber: "🔧", electrician: "⚡", food: "🍛", vegetable: "🥕", maid: "🧹" };
  return emojis[cat] || "👥";
}

function formatCategory(cat) {
  return cat.charAt(0).toUpperCase() + cat.slice(1);
}

function selectCategory(cat) {
  currentCategory = cat;
  const vendors = DIRECTORY.filter(d => d.category === cat);
  const list = $("#vendor-list");
  
  list.innerHTML = `
    <div class="mb-8 p-4 bg-gray-50 rounded-2xl">
      <button id="back-to-categories" class="flex items-center text-primary hover:text-primary/80 font-semibold mb-4">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
        All Categories (${Object.keys(getCategoryCounts()).length})
      </button>
      <h3 class="text-2xl font-bold text-gray-900 mb-2">${formatCategory(cat)}</h3>
      <div class="text-lg text-gray-600">${vendors.length} services available</div>
    </div>
    ${vendors.map(vendor => `
      <div class="bg-white p-6 rounded-3xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 group">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h4 class="font-bold text-xl text-gray-900 leading-tight">${vendor.name}</h4>
            <div class="inline-flex items-center bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mt-1">${vendor.area}</div>
          </div>
          <div class="text-2xl">${getCategoryEmoji(cat)}</div>
        </div>
        <div class="flex gap-3 pb-4">
          <a href="tel:+91${vendor.mobile_number}" class="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-center py-4 px-6 rounded-2xl font-bold shadow-lg transition-all duration-300 group-hover:scale-105">
            📞 Call Now
          </a>
          <a href="https://wa.me/91${vendor.mobile_number}?text=Hi%20from%20Society%20Directory" target="_blank" class="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-center py-4 px-6 rounded-2xl font-bold shadow-lg transition-all duration-300 group-hover:scale-105">
            💬 WhatsApp
          </a>
        </div>
        <div class="text-xs text-gray-500 bg-gray-50 p-3 rounded-xl">${vendor.tags}</div>
      </div>
    `).join('')}
  `;
  
  // Add back button event
  $("#back-to-categories").onclick = backToCategories;
}

function backToCategories() {
  currentCategory = null;
  $("#vendor-list").innerHTML = "";
  renderCategories();
}

function getCategoryCounts() {
  return DIRECTORY.reduce((acc, d) => {
    acc[d.category] = (acc[d.category] || 0) + 1;
    return acc;
  }, {});
}

// Tab switching - FIXED class handling
function switchToChat() {
  $("#chat-tab").classList.add("bg-primary", "text-white", "shadow-lg");
  $("#chat-tab").classList.remove("bg-transparent", "text-gray-700");
  $("#category-tab").classList.remove("bg-primary", "text-white", "shadow-lg");
  $("#category-tab").classList.add("bg-transparent", "text-gray-700");
  $("#chat-tab-content").classList.remove("hidden");
  $("#category-tab-content").classList.add("hidden");
}

function switchToCategories() {
  $("#chat-tab").classList.remove("bg-primary", "text-white", "shadow-lg");
  $("#chat-tab").classList.add("bg-transparent", "text-gray-700");
  $("#category-tab").classList.add("bg-primary", "text-white", "shadow-lg");
  $("#category-tab").classList.remove("bg-transparent", "text-gray-700");
  $("#chat-tab-content").classList.add("hidden");
  $("#category-tab-content").classList.remove("hidden");
  if (!currentCategory) renderCategories();
}

// Category button delegation (since dynamically created)
function initCategoryButtons() {
  document.addEventListener('click', function(e) {
    if (e.target.closest('.category-btn')) {
      const cat = e.target.closest('.category-btn').dataset.category;
      selectCategory(cat);
    }
  });
}

// Init everything
document.addEventListener("DOMContentLoaded", () => {
  console.log("Page loaded, initializing...");
  
  // Auth
  $("#auth-submit").addEventListener("click", handleAuthSubmit);
  
  // Check saved user
  const saved = localStorage.getItem("societyUser");
  if (saved) {
    currentUser = JSON.parse(saved);
    showDirectoryScreen();
    switchToCategories();
  }
  
  // Chat events
  $("#chat-send").addEventListener("click", handleChatMessage);
  $("#chat-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleChatMessage();
  });
  
  // Tab events
  $("#chat-tab").addEventListener("click", switchToChat);
  $("#category-tab").addEventListener("click", switchToCategories);
  
  // Category delegation
  initCategoryButtons();
  
  DIRECTORY = [...DUMMY_DIRECTORY];
  $("#last-updated").textContent = new Date().toLocaleString();
  
  console.log("Initialization complete!");
});
