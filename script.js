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

// Auth logic (same as before)
function handleAuthSubmit() {
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
}

function showDirectoryScreen() {
  $("#auth-screen").classList.add("hidden");
  $("#directory-screen").classList.remove("hidden");
  if (localStorage.getItem("societyUser")) {
    $("#user-name").value = "";
    $("#user-mobile").value = "";
  }
}

// Chat functionality
function appendMessage(text, sender = "bot") {
  const chatWindow = $("#chat-window");
  const div = document.createElement("div");
  div.className = `p-4 rounded-2xl ${sender === "bot" ? "bg-bot text-gray-800 max-w-xs" : "bg-success text-gray-900 ml-auto max-w-xs"} shadow-sm`;
  div.innerHTML = text;
  chatWindow.appendChild(div);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function extractIntent(query) {
  const norm = query.toLowerCase().trim();
  const intent = { category: null, area: null, number: null };
  
  // Category detection
  const categoryMap = {
    plumber: ["plumber", "plambar", "नल"],
    electrician: ["electrician", "bijli", "बिजली"],
    food: ["food", "tiffin", "dabba", "खाना"],
    vegetable: ["sabzi", "sabji", "vegetable"],
    maid: ["maid", "kaamwali"]
  };
  
  for (const [cat, keywords] of Object.entries(categoryMap)) {
    if (keywords.some(kw => norm.includes(kw))) {
      intent.category = cat;
      break;
    }
  }
  
  // Area detection
  const areaMatch = norm.match(/(tower|block|gate)\s*([a-z0-9]+)/i);
  if (areaMatch) intent.area = areaMatch[2].toUpperCase();
  
  // Number detection
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
  
  let reply = `<strong>✅ Found ${results.length} service(s):</strong><br>`;
  results.slice(0, 3).forEach(entry => {
    reply += `
      <div class="mt-2 p-2 bg-white/50 rounded-xl">
        <div class="font-semibold">${entry.name}</div>
        <div class="text-sm text-gray-600">${entry.area} • ${entry.category}</div>
        <div class="text-xs text-gray-500">${entry.mobile_number}</div>
      </div>`;
  });
  
  if (results.length > 3) reply += `<div class="text-sm mt-1">...and ${results.length - 3} more</div>`;
  appendMessage(reply, "bot");
}

// Category browser functionality
function renderCategories() {
  const catContainer = $(" .grid"); // Wait, fix selector
  wait, the grid is inside category-tab-content
  const grid = $("#category-tab-content .grid");
  const uniqueCats = [...new Set(DIRECTORY.map(d => d.category))];
  
  grid.innerHTML = uniqueCats.map(cat => `
    <button onclick="selectCategory('${cat}')" 
            class="group p-6 rounded-3xl bg-gradient-to-br hover:from-primary/10 hover:to-blue-100 border-2 border-transparent hover:border-primary/30 transition-all duration-300 hover:scale-105 hover:shadow-xl text-left">
      <div class="text-3xl mb-2">${getCategoryEmoji(cat)}</div>
      <div class="font-bold text-lg">${cat.charAt(0).toUpperCase() + cat.slice(1)}</div>
      <div class="text-sm text-gray-500 group-hover:text-primary">${getVendorCount(cat)} vendors</div>
    </button>
  `).join('');
}

function getCategoryEmoji(cat) {
  const emojis = { plumber: "🔧", electrician: "⚡", food: "🍛", vegetable: "🥕", maid: "🧹" };
  return emojis[cat] || "👥";
}

function getVendorCount(cat) {
  return DIRECTORY.filter(d => d.category === cat).length;
}

function selectCategory(cat) {
  currentCategory = cat;
  const vendors = DIRECTORY.filter(d => d.category === cat);
  const list = $("#vendor-list");
  
  list.innerHTML = `
    <div class="mb-8">
      <button onclick="backToCategories()" class="flex items-center text-primary hover:text-primary/80 mb-6">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
        Back to Categories
      </button>
      <h3 class="text-2xl font-bold text-gray-900 mb-4">${cat.charAt(0).toUpperCase() + cat.slice(1)} (${vendors.length})</h3>
    </div>
    ${vendors.map(vendor => `
      <div class="bg-white p-6 rounded-3xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-gray-100">
        <div class="flex justify-between items-start mb-3">
          <h4 class="font-bold text-xl text-gray-900">${vendor.name}</h4>
          <div class="text-sm bg-${vendor.category === 'food' ? 'green' : 'yellow'}-100 px-3 py-1 rounded-full font-medium">${vendor.area}</div>
        </div>
        <div class="flex gap-3 pt-4 border-t border-gray-100">
          <a href="tel:${vendor.mobile_number}" class="flex-1 bg-green-500 hover:bg-green-600 text-white text-center py-3 px-4 rounded-2xl font-semibold shadow-lg transition-all duration-200">
            📞 Call
          </a>
          <a href="https://wa.me/91${vendor.mobile_number}" target="_blank" class="flex-1 bg-green-600 hover:bg-green-700 text-white text-center py-3 px-4 rounded-2xl font-semibold shadow-lg transition-all duration-200">
            💬 WhatsApp
          </a>
        </div>
        <div class="mt-3 text-xs text-gray-500">${vendor.tags}</div>
      </div>
    `).join('')}
  `;
}

function backToCategories() {
  currentCategory = null;
  $("#vendor-list").innerHTML = "";
  renderCategories();
}

// Tab switching
function switchToChat() {
  $("#chat-tab").classList.add("bg-primary", "text-white");
  $("#category-tab").classList.remove("bg-primary", "text-white");
  $("#chat-tab-content").classList.remove("hidden");
  $("#category-tab-content").classList.add("hidden");
}

function switchToCategories() {
  $("#chat-tab").classList.remove("bg-primary", "text-white");
  $("#category-tab").classList.add("bg-primary", "text-white");
  $("#chat-tab-content").classList.add("hidden");
  $("#category-tab-content").classList.remove("hidden");
  renderCategories();
}

// Init everything
document.addEventListener("DOMContentLoaded", () => {
  // Auth
  $("#auth-submit").onclick = handleAuthSubmit;
  
  // Check saved user
  const saved = localStorage.getItem("societyUser");
  if (saved) {
    currentUser = JSON.parse(saved);
    showDirectoryScreen();
    switchToCategories(); // Default to categories
  }
  
  // Chat events
  $("#chat-send").onclick = handleChatMessage;
  $("#chat-input").onkeydown = (e) => e.key === "Enter" && handleChatMessage();
  
  // Tab events
  $("#chat-tab").onclick = switchToChat;
  $("#category-tab").onclick = switchToCategories;
  
  DIRECTORY = [...DUMMY_DIRECTORY]; // Load dummy data
  $("#last-updated").textContent = new Date().toLocaleString();
});
