// DUMMY DATA
const SERVICES = [
  {
    mobile: "9876543210",
    category: "plumber",
    name: "Ramesh Plumber",
    area: "Tower A",
    tags: "leak repair",
  },
  {
    mobile: "9876543220",
    category: "plumber",
    name: "Suresh Plumbing",
    area: "Tower B",
    tags: "pipes",
  },
  {
    mobile: "9876543230",
    category: "electrician",
    name: "Govind Electric",
    area: "Tower A",
    tags: "wiring",
  },
  {
    mobile: "9876543240",
    category: "electrician",
    name: "Rajesh Lights",
    area: "Gate 1",
    tags: "LED",
  },
  {
    mobile: "9876543250",
    category: "food",
    name: "Maa Tiffin",
    area: "Tower C",
    tags: "veg meals",
  },
  {
    mobile: "9876543260",
    category: "food",
    name: "Sharma Dabbawala",
    area: "Tower A",
    tags: "lunch",
  },
  {
    mobile: "9876543270",
    category: "vegetable",
    name: "Sabziwala",
    area: "Market",
    tags: "fresh",
  },
  {
    mobile: "9876543280",
    category: "maid",
    name: "Sunita Cleaning",
    area: "Tower B",
    tags: "housework",
  },
];

let currentUser = null;
let currentCat = null;

// HELPERS
function q(id) {
  return document.getElementById(id);
}
function addMsg(text, isUser = false) {
  const msgs = q("chat-messages");
  const div = document.createElement("div");
  div.className = `p-4 rounded-xl max-w-xs ${isUser ? "ml-auto bg-green-400 text-white" : "bg-white shadow"}`;
  div.innerHTML = text;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

// AUTH
q("auth-submit").onclick = function () {
  const name = q("user-name").value.trim();
  const mobile = q("user-mobile").value.trim();

  if (!name || !mobile || mobile.length !== 10 || isNaN(mobile)) {
    q("auth-error").textContent = "Enter valid name & 10-digit mobile";
    q("auth-error").classList.remove("hidden");
    return;
  }

  currentUser = { name, mobile };
  localStorage.setItem("user", JSON.stringify(currentUser));
  q("auth-error").classList.add("hidden");
  q("auth-screen").style.display = "none";
  q("directory-screen").style.display = "flex";
  showCategories();
};

// TABS
q("chat-tab-btn").onclick = function () {
  q("chat-container").style.display = "flex";
  q("category-container").style.display = "none";
  q("chat-tab-btn").classList.add("bg-blue-600", "text-white");
  q("cat-tab-btn").classList.remove("bg-blue-600", "text-white");
};

q("cat-tab-btn").onclick = function () {
  q("chat-container").style.display = "none";
  q("category-container").style.display = "block";
  q("chat-tab-btn").classList.remove("bg-blue-600", "text-white");
  q("cat-tab-btn").classList.add("bg-blue-600", "text-white");
  showCategories();
};

// CHAT
q("chat-send").onclick = chatSearch;
q("chat-input").onkeypress = function (e) {
  if (e.key === "Enter") chatSearch();
};

function chatSearch() {
  const input = q("chat-input");
  const query = input.value.trim().toLowerCase();
  if (!query) return;

  addMsg(`<strong>You:</strong> ${query}`, true);
  input.value = "";

  // Simple search
  const results = SERVICES.filter(
    (s) =>
      s.name.toLowerCase().includes(query) ||
      s.mobile.includes(query) ||
      s.category.includes(query) ||
      s.area.toLowerCase().includes(query),
  );

  if (results.length === 0) {
    addMsg("No services found. Try 'plumber', 'tiffin', or a phone number.");
    return;
  }

  let msg = `Found ${results.length}:<br><br>`;
  results.slice(0, 3).forEach((s) => {
    msg += `<div class="mt-2 p-2 bg-blue-100 rounded">
      <strong>${s.name}</strong><br>
      📍 ${s.area} | ${s.category}<br>
      📱 ${s.mobile}
    </div>`;
  });
  addMsg(msg);
}

// CATEGORIES
function showCategories() {
  const grid = q("categories-grid");
  const cats = {};
  SERVICES.forEach((s) => (cats[s.category] = (cats[s.category] || 0) + 1));

  grid.innerHTML = Object.entries(cats)
    .map(
      ([cat, count]) => `
    <button class="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 hover:from-blue-500 hover:to-blue-600 hover:text-white border hover:border-blue-300 transition-all duration-300 shadow-md" onclick="showVendors('${cat}')">
      <div class="text-3xl mb-2">${getEmoji(cat)}</div>
      <div class="font-bold text-lg">${cat.charAt(0).toUpperCase() + cat.slice(1)}</div>
      <div class="text-sm opacity-75">${count} services</div>
    </button>
  `,
    )
    .join("");
  q("vendors-list").innerHTML = "";
}

function getEmoji(cat) {
  return (
    {
      plumber: "🔧",
      electrician: "⚡",
      food: "🍛",
      vegetable: "🥕",
      maid: "🧹",
    }[cat] || "👥"
  );
}

function showVendors(cat) {
  currentCat = cat;
  const vendors = SERVICES.filter((s) => s.category === cat);
  const list = q("vendors-list");

  list.innerHTML = `
    <div class="mb-8 p-4 bg-blue-50 rounded-2xl">
      <button class="text-blue-600 hover:text-blue-800 font-semibold mb-4 flex items-center" onclick="showCategories()">
        ← Back to Categories
      </button>
      <h2 class="text-2xl font-bold">${cat.toUpperCase()} (${vendors.length})</h2>
    </div>
    ${vendors
      .map(
        (v) => `
      <div class="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all border">
        <h3 class="font-bold text-xl mb-2">${v.name}</h3>
        <div class="text-sm text-gray-600 mb-4">${v.area} • ${v.tags}</div>
        <div class="flex gap-3">
          <a href="tel:+91${v.mobile}" class="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-xl text-center font-semibold">📞 Call</a>
          <a href="https://wa.me/91${v.mobile}" target="_blank" class="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl text-center font-semibold">💬 WhatsApp</a>
        </div>
      </div>
    `,
      )
      .join("")}
  `;
}

// LOAD SAVED USER
if (localStorage.getItem("user")) {
  currentUser = JSON.parse(localStorage.getItem("user"));
  document.getElementById("auth-screen").style.display = "none";
  document.getElementById("directory-screen").style.display = "flex";
  showCategories();
}
