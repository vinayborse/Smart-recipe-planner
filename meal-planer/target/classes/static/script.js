const RECIPES_API = '/api/recipes';
const PLANS_API = '/api/plans';

let recipes = [];
let weeklyPlans = [];

let timerInterval;
let timerSeconds = 0;

document.addEventListener("DOMContentLoaded", () => {
    fetchRecipes();
    fetchPlans();
});

function switchTab(tab, event) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
    
    if (event) {
        event.currentTarget.classList.add('active');
    } else {
        const tabBtns = document.querySelectorAll('.tab-btn');
        if (tab === 'recipes') tabBtns[0]?.classList.add('active');
        if (tab === 'planner') tabBtns[1]?.classList.add('active');
        if (tab === 'shopping') tabBtns[2]?.classList.add('active');
    }

    document.getElementById(`${tab}-view`).classList.add('active');

    if (tab === 'planner') renderPlanner();
    if (tab === 'shopping') generateShoppingList();
}

async function fetchRecipes() {
    try {
        const response = await fetch(RECIPES_API);
        recipes = await response.json();
        renderRecipes(recipes);
    } catch (error) {
        console.error("Error fetching recipes:", error);
    }
}

async function fetchPlans() {
    try {
        const response = await fetch(PLANS_API);
        weeklyPlans = await response.json();
        renderPlanner();
    } catch (error) {
        console.error("Error fetching plans:", error);
    }
}

document.getElementById("recipeForm").addEventListener("submit", async function(e) {
    e.preventDefault();
    
    const rawPrepTime = parseInt(document.getElementById("prepTime").value);
    if (isNaN(rawPrepTime) || rawPrepTime <= 0) {
        alert("Prep time must be a valid number!");
        return;
    }

    const newRecipe = {
        name: document.getElementById("recipeName").value.trim(),
        dietPref: document.getElementById("dietPref").value,
        cuisine: document.getElementById("cuisine").value.trim(),
        prepTime: rawPrepTime,
        mealType: document.getElementById("mealType").value,
        calories: parseInt(document.getElementById("calories").value) || 0,
        macros: document.getElementById("macros").value.trim() || "N/A",
        ingredients: document.getElementById("ingredients").value.trim(),
        instructions: document.getElementById("instructions").value.trim()
    };

    try {
        const response = await fetch(RECIPES_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newRecipe)
        });

        if (response.ok) {
            this.reset();
            fetchRecipes();
        }
    } catch (error) {
        console.error("Error saving recipe:", error);
    }
});

function getRecipeImage(recipeName) {
    const cleanName = recipeName ? recipeName.toLowerCase().replace(/[^a-z0-9 ]/g, '') : '';
    
    if (cleanName.includes('fish') || cleanName.includes('machhi') || cleanName.includes('prawn')) {
        return 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500&q=80';
    } else if (cleanName.includes('paneer') || cleanName.includes('panir') || cleanName.includes('matar paneer')) {
        return 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&q=80';
    } else if (cleanName.includes('chicken') || cleanName.includes('mutton') || cleanName.includes('meat')) {
        return 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500&q=80';
    } else if (cleanName.includes('rice') || cleanName.includes('biryani') || cleanName.includes('pulao')) {
        return 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&q=80';
    } else if (cleanName.includes('pasta') || cleanName.includes('noodle') || cleanName.includes('spaghetti')) {
        return 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500&q=80';
    } else if (cleanName.includes('salad') || cleanName.includes('green') || cleanName.includes('veg')) {
        return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=80';
    } else if (cleanName.includes('cake') || cleanName.includes('sweet') || cleanName.includes('dessert')) {
        return 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&q=80';
    } else if (cleanName.includes('burger') || cleanName.includes('sandwich')) {
        return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80';
    } else if (cleanName.includes('soup')) {
        return 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500&q=80';
    } else if (cleanName.includes('egg') || cleanName.includes('bhurji') || cleanName.includes('omelette')) {
        return 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500&q=80';
    }
    
    return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80';
}

function renderRecipes(list = recipes) {
    const grid = document.getElementById("recipeCards");
    const selectPlan = document.getElementById("planRecipe");
    grid.innerHTML = "";
    selectPlan.innerHTML = '<option value="" disabled selected>Select Recipe</option>';

    if (list.length === 0) {
        grid.innerHTML = `<p style="color:var(--text-muted); grid-column: 1/-1; text-align: center;">No recipes saved yet.</p>`;
        return;
    }

    list.forEach(r => {
        const recipeImageUrl = getRecipeImage(r.name);

        grid.innerHTML += `
            <div class="recipe-card" id="recipe-card-${r.id}">
                <div class="recipe-image-wrap">
                    <img src="${recipeImageUrl}" class="recipe-image" alt="${r.name}">
                    <span class="meal-tag">${r.mealType || 'Meal'}</span>
                </div>
                <div class="recipe-content">
                    <h3 style="font-size:1.15rem; font-weight:700;">${r.name}</h3>
                    <div style="display:flex; gap:6px; flex-wrap:wrap;">
                        <span class="badge badge-diet">${r.dietPref || 'Veg'}</span>
                        <span class="badge badge-time"><i class="fa-regular fa-clock"></i> ${r.prepTime || 0}m</span>
                        <span class="badge badge-cal"><i class="fa-solid fa-fire"></i> ${r.calories || 0} kcal</span>
                    </div>
                    <p style="font-size:0.82rem; color:var(--text-muted)"><strong>Macros:</strong> ${r.macros || 'N/A'}</p>
                    <p style="font-size:0.85rem; color:var(--text-main); flex-grow:1;"><strong>Ingredients:</strong> ${r.ingredients}</p>
                    <div style="display:flex; gap:10px; margin-top:10px;">
                        <button class="btn-submit" style="padding: 8px 16px; font-size: 0.85rem; flex:1;" onclick="openCookMode(${r.id})"><i class="fa-solid fa-fire-burner"></i> Start Cook</button>
                        <button class="btn-submit btn-secondary" style="padding: 8px 14px; font-size: 0.85rem; color:#ff3b5c;" onclick="deleteRecipe(${r.id})"><i class="fa-solid fa-trash-can"></i></button>
                    </div>
                </div>
            </div>
        `;

        selectPlan.innerHTML += `<option value="${r.id}">${r.name} (${r.mealType || 'Meal'})</option>`;
    });
}

function navigateToRecipe(recipeId) {
    switchTab('recipes');

    setTimeout(() => {
        const card = document.getElementById(`recipe-card-${recipeId}`);
        if (card) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            card.style.transition = "all 0.4s ease";
            card.style.border = "2px solid var(--primary)";
            card.style.boxShadow = "0 0 20px var(--primary-glow)";
            
            setTimeout(() => {
                card.style.border = "1px solid var(--card-border)";
                card.style.boxShadow = "none";
            }, 2500);
        }
    }, 100);
}

function filterRecipes() {
    const query = document.getElementById("searchInput").value.toLowerCase();
    const diet = document.getElementById("filterDiet").value;

    const filtered = recipes.filter(r => {
        const matchesName = r.name.toLowerCase().includes(query);
        const matchesDiet = (diet === "All") || (r.dietPref === diet);
        return matchesName && matchesDiet;
    });

    renderRecipes(filtered);
}

async function deleteRecipe(id) {
    if (!confirm("Are you sure you want to delete this recipe?")) return;
    try {
        const response = await fetch(`${RECIPES_API}/${id}`, { method: 'DELETE' });
        if (response.ok) {
            fetchRecipes();
            fetchPlans();
        }
    } catch (error) {
        console.error("Error deleting recipe:", error);
    }
}

function openCookMode(id) {
    const r = recipes.find(x => x.id === id);
    if (!r) return;

    document.getElementById("modalRecipeTitle").innerText = r.name;
    timerSeconds = (r.prepTime || 10) * 60;
    updateTimerDisplay();

    const stepsContainer = document.getElementById("modalSteps");
    const steps = r.instructions ? r.instructions.split('.').map(s => s.trim()).filter(Boolean) : [];

    stepsContainer.innerHTML = steps.map((step, idx) => `
        <div class="step-item" style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:0.9rem;"><strong>Step ${idx+1}:</strong> ${step}</span>
            <button class="btn-submit btn-secondary" style="padding:4px 10px; font-size:0.8rem;" onclick="speakStep('${step.replace(/'/g, "\\'")}')">
                <i class="fa-solid fa-volume-high"></i> Read
            </button>
        </div>
    `).join('');

    document.getElementById("cookingModal").style.display = "flex";
}

function closeModal() {
    clearInterval(timerInterval);
    document.getElementById("cookingModal").style.display = "none";
    window.speechSynthesis.cancel();
}

function speakStep(text) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
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
        if (timerSeconds > 0) {
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
    timerSeconds = 0;
    updateTimerDisplay();
}

async function addToPlan() {
    const day = document.getElementById("planDay").value;
    const recipeId = parseInt(document.getElementById("planRecipe").value);

    if (!recipeId) {
        alert("Please select a recipe first!");
        return;
    }

    try {
        const response = await fetch(PLANS_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ day, recipeId })
        });

        if (response.ok) fetchPlans();
    } catch (error) {
        console.error("Error adding plan:", error);
    }
}

function renderPlanner() {
    const calendar = document.getElementById("weeklyCalendar");
    calendar.innerHTML = "";
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    days.forEach(day => {
        const dayPlans = weeklyPlans.filter(p => p.day === day);

        let itemsHtml = dayPlans.map(p => {
            const recipe = recipes.find(r => r.id === p.recipeId);
            const recipeName = recipe ? recipe.name : `Recipe #${p.recipeId}`;
            const mealType = recipe ? recipe.mealType || 'Meal' : 'Meal';

            return `
                <div class="planned-item" style="display:flex; justify-content:space-between; align-items:center;">
                    <div style="cursor: pointer;" onclick="navigateToRecipe(${p.recipeId})" title="Click to view recipe card">
                        <strong>${mealType}:</strong> <span style="text-decoration: underline; text-underline-offset: 3px; color: #ffffff;">${recipeName}</span>
                    </div>
                    <i class="fa-solid fa-xmark" onclick="removeFromPlan(${p.id})" style="color:var(--primary); cursor:pointer; margin-left: 6px;"></i>
                </div>
            `;
        }).join('');

        calendar.innerHTML += `
            <div class="day-column">
                <h3>${day}</h3>
                ${itemsHtml || '<p style="font-size:0.75rem; color:var(--text-muted); text-align:center;">No meals</p>'}
            </div>
        `;
    });
}

async function removeFromPlan(id) {
    try {
        const response = await fetch(`${PLANS_API}/${id}`, { method: 'DELETE' });
        if (response.ok) fetchPlans();
    } catch (error) {
        console.error("Error removing plan:", error);
    }
}

async function clearFullPlan() {
    if (confirm("Are you sure you want to clear the entire weekly meal schedule?")) {
        try {
            const response = await fetch(`${PLANS_API}/clear`, { method: 'DELETE' });
            if (response.ok) fetchPlans();
        } catch (error) {
            console.error("Error clearing plans:", error);
        }
    }
}

function generateShoppingList() {
    const listContainer = document.getElementById("shoppingList");
    listContainer.innerHTML = "";

    if (weeklyPlans.length === 0) {
        listContainer.innerHTML = `<li style="color: var(--text-muted); list-style: none;">No meals assigned in weekly planner. Please add meals to the planner tab first!</li>`;
        return;
    }

    const recipeMap = {};

    weeklyPlans.forEach(plan => {
        const recipe = recipes.find(r => r.id === plan.recipeId);
        if (recipe && recipe.ingredients) {
            if (!recipeMap[recipe.name]) {
                recipeMap[recipe.name] = new Set();
            }
            
            recipe.ingredients.split(',').forEach(ing => {
                let cleaned = ing.trim().replace(/\.$/, '');
                if (cleaned) {
                    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
                    recipeMap[recipe.name].add(cleaned);
                }
            });
        }
    });

    Object.keys(recipeMap).forEach(recipeName => {
        const ingredientsList = Array.from(recipeMap[recipeName]);

        if (ingredientsList.length > 0) {
            const recipeSection = document.createElement("div");
            recipeSection.className = "recipe-shopping-block";
            recipeSection.style.marginBottom = "22px";

            let itemsHtml = ingredientsList.map(item => `
                <li style="margin-bottom: 8px;">
                    <input type="checkbox" onchange="toggleItemStrike(this)">
                    <span class="ingredient-item-text" style="transition: all 0.2s;">${item}</span>
                </li>
            `).join('');

            const safeName = recipeName.replace(/'/g, "\\'");

            recipeSection.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
                    <h4 class="recipe-block-title" style="color: var(--primary); font-size: 1.05rem; display: flex; align-items: center; gap: 8px; margin: 0;">
                        <i class="fa-solid fa-utensils"></i> ${recipeName}
                    </h4>
                    <div style="display: flex; gap: 6px;">
                        <button class="btn-submit btn-secondary" onclick="shareParticularRecipe('${safeName}')" style="padding: 4px 8px; font-size: 0.75rem; background: #25D366; color: #fff; border: none;">
                            <i class="fa-brands fa-whatsapp"></i> Share
                        </button>
                        <button class="btn-submit btn-secondary" onclick="copyParticularRecipe('${safeName}')" style="padding: 4px 8px; font-size: 0.75rem;">
                            <i class="fa-regular fa-copy"></i> Copy
                        </button>
                        <button class="btn-submit btn-secondary" onclick="downloadParticularTxt('${safeName}')" style="padding: 4px 8px; font-size: 0.75rem;">
                            <i class="fa-solid fa-file-arrow-down"></i> TXT
                        </button>
                    </div>
                </div>
                <ul class="recipe-items-list" style="list-style: none; padding-left: 0;">
                    ${itemsHtml}
                </ul>
            `;

            listContainer.appendChild(recipeSection);
        }
    });
}

function toggleItemStrike(checkbox) {
    const spanText = checkbox.nextElementSibling;
    if (checkbox.checked) {
        spanText.style.textDecoration = "line-through";
        spanText.style.opacity = "0.5";
    } else {
        spanText.style.textDecoration = "none";
        spanText.style.opacity = "1";
    }
}

function shareParticularRecipe(recipeName) {
    const text = getParticularRecipeText(recipeName);
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

function copyParticularRecipe(recipeName) {
    const text = getParticularRecipeText(recipeName);
    navigator.clipboard.writeText(text);
    alert(`Shopping list for ${recipeName} copied!`);
}

function downloadParticularTxt(recipeName) {
    const text = getParticularRecipeText(recipeName);
    const blob = new Blob([text], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${recipeName.replace(/\s+/g, '_')}_Shopping_List.txt`;
    a.click();
}

function getParticularRecipeText(recipeName) {
    let text = `🛒 *Ingredients for ${recipeName}*:\n\n`;
    document.querySelectorAll(".recipe-shopping-block").forEach(block => {
        const title = block.querySelector(".recipe-block-title").innerText.trim();
        if (title.includes(recipeName)) {
            block.querySelectorAll(".ingredient-item-text").forEach(item => {
                text += `• ${item.innerText}\n`;
            });
        }
    });
    return text;
}

function shareWhatsApp() {
    let text = "🛒 *My Weekly Shopping List*:\n\n";
    document.querySelectorAll(".recipe-shopping-block").forEach(block => {
        const title = block.querySelector(".recipe-block-title").innerText.trim();
        text += `🍲 *${title}*:\n`;
        block.querySelectorAll(".ingredient-item-text").forEach(item => {
            text += `  • ${item.innerText}\n`;
        });
        text += `\n`;
    });
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

function copyShoppingList() {
    let text = "🛒 My Weekly Shopping List:\n\n";
    document.querySelectorAll(".recipe-shopping-block").forEach(block => {
        const title = block.querySelector(".recipe-block-title").innerText.trim();
        text += `🍲 ${title}:\n`;
        block.querySelectorAll(".ingredient-item-text").forEach(item => {
            text += `  - ${item.innerText}\n`;
        });
        text += `\n`;
    });
    navigator.clipboard.writeText(text);
    alert("Full Shopping List copied to clipboard!");
}

function downloadTxtList() {
    let text = "My Weekly Shopping List:\n\n";
    document.querySelectorAll(".recipe-shopping-block").forEach(block => {
        const title = block.querySelector(".recipe-block-title").innerText.trim();
        text += `[${title}]\n`;
        block.querySelectorAll(".ingredient-item-text").forEach(item => {
            text += `- ${item.innerText}\n`;
        });
        text += `\n`;
    });
    
    const blob = new Blob([text], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "Full_Shopping_List.txt";
    a.click();
}

// LOCAL DATABASE GENERATOR (WITH SUBSET MATCHING LOGIC)
function generateFromDatabase() {
    const inputVal = document.getElementById("findIngredientsInput").value.trim().toLowerCase();
    const area = document.getElementById("foundRecipesArea");
    area.innerHTML = "";

    if (!inputVal) return alert("Please enter ingredients!");

    const searchTerms = inputVal.split(',').map(i => i.trim().toLowerCase()).filter(Boolean);

    // Filter local saved recipes where recipe contains ALL search terms (subset match)
    const matched = recipes.filter(r => {
        const ingStr = r.ingredients ? r.ingredients.toLowerCase() : '';
        const nameStr = r.name ? r.name.toLowerCase() : '';
        return searchTerms.every(term => ingStr.includes(term) || nameStr.includes(term));
    });

    if (matched.length === 0) {
        area.innerHTML = `<p style="color:var(--text-muted); padding: 10px 0;">No matching recipe found in your collection for: "<strong>${inputVal}</strong>".</p>`;
        return;
    }

    area.innerHTML = `<h5 style="color:var(--primary); margin-bottom:10px;">Matching Collection Recipes (${matched.length})</h5>`;

    matched.forEach(r => {
        area.innerHTML += `
            <div class="card-box" style="padding:16px; margin-bottom:12px; background:rgba(255,255,255,0.03); border-color: rgba(255,59,92,0.3); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                <div>
                    <h4 style="color:var(--primary); font-size: 1.05rem; margin-bottom: 4px;">🍲 ${r.name} <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: normal;">(${r.mealType || 'Meal'} • ${r.prepTime || 0} mins)</span></h4>
                    <p style="font-size:0.85rem; color:var(--text-main); margin-bottom: 2px;"><strong>Ingredients:</strong> ${r.ingredients}</p>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="btn-submit" style="padding: 6px 14px; font-size: 0.8rem;" onclick="openCookMode(${r.id})">
                        <i class="fa-solid fa-fire-burner"></i> Start Cook
                    </button>
                    <button class="btn-submit btn-secondary" style="padding: 6px 14px; font-size: 0.8rem;" onclick="navigateToRecipe(${r.id})">
                        <i class="fa-solid fa-eye"></i> View Card
                    </button>
                </div>
            </div>
        `;
    });
}