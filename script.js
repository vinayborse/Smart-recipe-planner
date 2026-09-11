let recipes = JSON.parse(localStorage.getItem("recipes_db")) || [];
let weeklyPlan = JSON.parse(localStorage.getItem("weekly_plan")) || {
    Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: []
};

let timerInterval;
let timerSeconds = 0;

// Initialize recipes on page load
document.addEventListener("DOMContentLoaded", () => {
    renderRecipes();
});

function switchTab(tab, event) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
    
    event.currentTarget.classList.add('active');
    document.getElementById(`${tab}-view`).classList.add('active');

    if(tab === 'planner') renderPlanner();
    if(tab === 'shopping') generateShoppingList();
}

function saveData() {
    localStorage.setItem("recipes_db", JSON.stringify(recipes));
    localStorage.setItem("weekly_plan", JSON.stringify(weeklyPlan));
}

document.getElementById("recipeForm").addEventListener("submit", function(e) {
    e.preventDefault();
    
    const rawPrepTime = parseInt(document.getElementById("prepTime").value);
    if (isNaN(rawPrepTime) || rawPrepTime <= 0) {
        alert("Prep time must be a valid number!");
        return;
    }

    const newRecipe = {
        id: Date.now(),
        name: document.getElementById("recipeName").value.trim(),
        diet: document.getElementById("dietPref").value,
        cuisine: document.getElementById("cuisine").value.trim(),
        prepTime: rawPrepTime,
        mealType: document.getElementById("mealType").value,
        calories: document.getElementById("calories").value,
        macros: document.getElementById("macros").value || "N/A",
        ingredients: document.getElementById("ingredients").value.split(',').map(i => i.trim()),
        instructions: document.getElementById("instructions").value.split('.').map(i => i.trim()).filter(i => i.length > 0)
    };

    recipes.push(newRecipe);
    saveData();
    renderRecipes();
    this.reset();
});

function renderRecipes(list = recipes) {
    const grid = document.getElementById("recipeCards");
    const selectPlan = document.getElementById("planRecipe");
    grid.innerHTML = "";
    selectPlan.innerHTML = "";

    if(list.length === 0) {
        grid.innerHTML = `<p style="color:var(--text-muted); grid-column: 1/-1;">No recipes saved yet.</p>`;
        return;
    }

    list.forEach(r => {
        grid.innerHTML += `
            <div class="recipe-card">
                <div class="recipe-image-wrap">
                    <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80" class="recipe-image" alt="Food">
                    <span class="meal-tag">${r.mealType}</span>
                </div>
                <div class="recipe-content">
                    <h3 style="font-size:1.15rem; font-weight:700;">${r.name}</h3>
                    <div style="display:flex; gap:6px; flex-wrap:wrap;">
                        <span class="badge badge-diet">${r.diet}</span>
                        <span class="badge badge-time"><i class="fa-regular fa-clock"></i> ${r.prepTime}m</span>
                        <span class="badge badge-cal"><i class="fa-solid fa-fire"></i> ${r.calories} kcal</span>
                    </div>
                    <p style="font-size:0.82rem; color:var(--text-muted)"><strong>Macros:</strong> ${r.macros}</p>
                    <p style="font-size:0.85rem; color:var(--text-main); flex-grow:1;"><strong>Ingredients:</strong> ${r.ingredients.join(', ')}</p>
                    <div style="display:flex; gap:10px; margin-top:10px;">
                        <button class="btn-submit" style="padding: 8px 16px; font-size: 0.85rem; flex:1;" onclick="openCookMode(${r.id})"><i class="fa-solid fa-fire-burner"></i> Start Cook</button>
                        <button class="btn-submit btn-secondary" style="padding: 8px 14px; font-size: 0.85rem; color:#ff3b5c;" onclick="deleteRecipe(${r.id})"><i class="fa-solid fa-trash-can"></i></button>
                    </div>
                </div>
            </div>
        `;

        selectPlan.innerHTML += `<option value="${r.id}">${r.name} (${r.mealType})</option>`;
    });
}

function filterRecipes() {
    const query = document.getElementById("searchInput").value.toLowerCase();
    const diet = document.getElementById("filterDiet").value;

    const filtered = recipes.filter(r => {
        const matchesName = r.name.toLowerCase().includes(query);
        const matchesDiet = (diet === "All") || (r.diet === diet);
        return matchesName && matchesDiet;
    });

    renderRecipes(filtered);
}

function deleteRecipe(id) {
    recipes = recipes.filter(r => r.id !== id);
    saveData();
    renderRecipes();
}

// Interactive Cook Mode Modal & Voice Guidance
function openCookMode(id) {
    const r = recipes.find(x => x.id === id);
    if(!r) return;

    document.getElementById("modalRecipeTitle").innerText = r.name;
    timerSeconds = r.prepTime * 60;
    updateTimerDisplay();

    const stepsContainer = document.getElementById("modalSteps");
    stepsContainer.innerHTML = r.instructions.map((step, idx) => `
        <div class="step-item">
            <span style="font-size:0.9rem;"><strong>Step ${idx+1}:</strong> ${step}</span>
            <button class="btn-submit btn-secondary" style="padding:4px 10px; font-size:0.75rem;" onclick="speakStep('${step}')">
                <i class="fa-solid fa-volume-high"></i> Listen
            </button>
        </div>
    `).join('');

    document.getElementById("cookingModal").style.display = "flex";
}

function speakStep(text) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
}

function closeModal() {
    clearInterval(timerInterval);
    window.speechSynthesis.cancel();
    document.getElementById("cookingModal").style.display = "none";
}

function updateTimerDisplay() {
    const mins = Math.floor(timerSeconds / 60);
    const secs = timerSeconds % 60;
    document.getElementById("timerDisplay").innerText = 
        `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if(timerSeconds > 0) {
            timerSeconds--;
            updateTimerDisplay();
        } else {
            clearInterval(timerInterval);
            alert("Timer Complete!");
        }
    }, 1000);
}

function resetTimer() {
    clearInterval(timerInterval);
    updateTimerDisplay();
}

// Planner Functions
function addToPlan() {
    const day = document.getElementById("planDay").value;
    const recipeId = parseInt(document.getElementById("planRecipe").value);
    const recipe = recipes.find(r => r.id === recipeId);
    if(!recipe) return;

    weeklyPlan[day].push(recipe);
    saveData();
    renderPlanner();
}

function renderPlanner() {
    const calendar = document.getElementById("weeklyCalendar");
    calendar.innerHTML = "";
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    days.forEach(day => {
        let itemsHtml = weeklyPlan[day].map((r, index) => `
            <div class="planned-item" style="display:flex; justify-content:space-between; align-items:center;">
                <div><strong>${r.mealType}:</strong> ${r.name}</div>
                <i class="fa-solid fa-xmark" onclick="removeFromPlan('${day}', ${index})" style="color:var(--primary); cursor:pointer;"></i>
            </div>
        `).join('');

        calendar.innerHTML += `
            <div class="day-column">
                <h3>${day}</h3>
                ${itemsHtml || '<p style="font-size:0.75rem; color:var(--text-muted); text-align:center;">No meals</p>'}
            </div>
        `;
    });
}

function removeFromPlan(day, index) {
    weeklyPlan[day].splice(index, 1);
    saveData();
    renderPlanner();
}

function clearFullPlan() {
    if(confirm("Are you sure you want to clear the entire weekly meal schedule?")) {
        weeklyPlan = { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: [] };
        saveData();
        renderPlanner();
    }
}

// Shopping List & Exporters
function generateShoppingList() {
    const listContainer = document.getElementById("shoppingList");
    listContainer.innerHTML = "";

    let allIngredients = [];
    Object.keys(weeklyPlan).forEach(day => {
        weeklyPlan[day].forEach(recipe => {
            allIngredients = allIngredients.concat(recipe.ingredients);
        });
    });

    let uniqueIngredients = [...new Set(allIngredients)];

    if(uniqueIngredients.length === 0) {
        listContainer.innerHTML = `<li style="color: var(--text-muted);">No items in shopping list. Assign meals in planner first!</li>`;
        return;
    }

    uniqueIngredients.forEach(item => {
        listContainer.innerHTML += `
            <li>
                <input type="checkbox">
                <span style="text-transform: capitalize;">${item}</span>
            </li>
        `;
    });
}

function shareWhatsApp() {
    let text = "🛒 *My Weekly Shopping List*:\n\n";
    document.querySelectorAll("#shoppingList li span").forEach(item => {
        text += `• ${item.innerText}\n`;
    });
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

function copyShoppingList() {
    let text = "🛒 My Weekly Shopping List:\n\n";
    document.querySelectorAll("#shoppingList li span").forEach(item => {
        text += `• ${item.innerText}\n`;
    });
    navigator.clipboard.writeText(text);
    alert("Shopping List copied to clipboard!");
}

function downloadTxtList() {
    let text = "My Weekly Shopping List:\n\n";
    document.querySelectorAll("#shoppingList li span").forEach(item => {
        text += `- ${item.innerText}\n`;
    });
    
    const blob = new Blob([text], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "Shopping_List.txt";
    a.click();
}

function generateFromDatabase() {
    const inputVal = document.getElementById("findIngredientsInput").value.trim().toLowerCase();
    const area = document.getElementById("foundRecipesArea");
    area.innerHTML = "";

    if (!inputVal) return alert("Please enter ingredients!");

    const search = inputVal.split(',').map(i => i.trim().toLowerCase());
    const matched = recipes.filter(r => search.some(s => r.ingredients.some(ing => ing.toLowerCase().includes(s))));

    if(matched.length === 0) {
        area.innerHTML = `<p style="color:var(--text-muted)">No matching recipe found in your collection.</p>`;
        return;
    }

    matched.forEach(r => {
        area.innerHTML += `
            <div class="card-box" style="padding:16px; margin-bottom:10px; background:rgba(255,255,255,0.03); border-color: rgba(255,59,92,0.3);">
                <h4 style="color:var(--primary)">🍲 ${r.name}</h4>
                <p style="font-size:0.85rem; color:var(--text-main)"><strong>Ingredients:</strong> ${r.ingredients.join(', ')}</p>
            </div>
        `;
    });
}