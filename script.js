
/* =========================================
   PERSONAL NOTES
   Vanilla JavaScript
   ========================================= */


/* =========================================
   1. DOM ELEMENTS
   ========================================= */

const notesContainer = document.getElementById("notesContainer");
const emptyState = document.getElementById("emptyState");

const noteModal = document.getElementById("noteModal");
const noteForm = document.getElementById("noteForm");

const modalTitle = document.getElementById("modalTitle");
const noteIdInput = document.getElementById("noteId");
const noteTitleInput = document.getElementById("noteTitle");
const noteContentInput = document.getElementById("noteContent");
const noteCategoryInput = document.getElementById("noteCategory");

const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");

const categoryList = document.getElementById("categoryList");
const filterList = document.getElementById("filterList");

const allCount = document.getElementById("allCount");
const favoriteCount = document.getElementById("favoriteCount");
const pinnedCount = document.getElementById("pinnedCount");
const trashCount = document.getElementById("trashCount");

const pageTitle = document.getElementById("pageTitle");
const pageDescription = document.getElementById("pageDescription");

const toastContainer = document.getElementById("toastContainer");


/* =========================================
   2. STORAGE CONFIGURATION
   ========================================= */

const STORAGE_KEYS = {
    notes: "personalNotes_data",
    categories: "personalNotes_categories",
    theme: "personalNotes_theme"
};

const DEFAULT_CATEGORIES = [
    "General",
    "Work",
    "Study",
    "Personal",
    "Ideas"
];

const CATEGORY_COLORS = [
    "#16845b",
    "#e5a126",
    "#3989d6",
    "#df6262",
    "#9563c9",
    "#dc8b45",
    "#279b9b"
];


/* =========================================
   3. APPLICATION STATE
   ========================================= */

let notes = loadStorage(STORAGE_KEYS.notes, []);
let categories = loadStorage(
    STORAGE_KEYS.categories,
    DEFAULT_CATEGORIES
);

let currentView = "all";
let currentCategory = "all";
let currentSearch = "";

let currentSort = "latest";
let currentLayout = "grid";


/* =========================================
   4. STORAGE FUNCTIONS
   ========================================= */

function loadStorage(key, fallback) {
    try {
        const data = localStorage.getItem(key);

        if (!data) {
            return fallback;
        }

        const parsed = JSON.parse(data);

        return parsed ?? fallback;

    } catch (error) {
        console.error("Storage error:", error);
        return fallback;
    }
}


function saveStorage() {
    try {
        localStorage.setItem(
            STORAGE_KEYS.notes,
            JSON.stringify(notes)
        );

        localStorage.setItem(
            STORAGE_KEYS.categories,
            JSON.stringify(categories)
        );

        return true;

    } catch (error) {
        console.error("Failed to save data:", error);

        showToast(
            "Gagal menyimpan data. Penyimpanan mungkin penuh.",
            "error"
        );

        return false;
    }
}


/* =========================================
   5. HELPER FUNCTIONS
   ========================================= */

function generateId() {
    if (window.crypto?.randomUUID) {
        return window.crypto.randomUUID();
    }

    return Date.now().toString(36) +
        Math.random().toString(36).slice(2);
}


function getCategoryColor(category) {
    const index = categories.indexOf(category);

    return CATEGORY_COLORS[
        index >= 0 ? index % CATEGORY_COLORS.length : 0
    ];
}


function formatDate(date) {
    return new Date(date).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}


function showToast(message, type = "success") {
    const toast = document.createElement("div");

    toast.className = `toast ${type}`;
    toast.textContent = message;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}


function getActiveNotes() {
    return notes.filter(note => !note.deleted);
}


/* =========================================
   6. CATEGORY MANAGEMENT
   ========================================= */

function renderCategories() {

    categoryList.innerHTML = "";

    categories.forEach(category => {

        const count = getActiveNotes().filter(
            note => note.category === category
        ).length;

        const button = document.createElement("button");

        button.className = "category-item";

        button.innerHTML = `
            <span class="category-color"
                style="background-color: ${getCategoryColor(category)}">
            </span>

            <span class="category-name"></span>

            <span class="category-count">${count}</span>
        `;

        button.querySelector(".category-name").textContent = category;

        button.addEventListener("click", () => {

            currentView = "all";
            currentCategory = category;

            updateNavigation();
            renderNotes();

        });

        categoryList.appendChild(button);

    });

    renderCategoryOptions();
    renderCategoryFilters();
}


function renderCategoryOptions() {

    noteCategoryInput.innerHTML = "";

    categories.forEach(category => {

        const option = document.createElement("option");

        option.value = category;
        option.textContent = category;

        noteCategoryInput.appendChild(option);

    });

}


function renderCategoryFilters() {

    filterList.innerHTML = "";

    const allButton = document.createElement("button");

    allButton.className = "filter-button";
    allButton.textContent = "All";
    allButton.dataset.category = "all";

    allButton.addEventListener("click", () => {
        currentCategory = "all";
        updateNavigation();
        renderNotes();
    });

    filterList.appendChild(allButton);

    categories.forEach(category => {

        const button = document.createElement("button");

        button.className = "filter-button";
        button.textContent = category;
        button.dataset.category = category;

        button.addEventListener("click", () => {

            currentView = "all";
            currentCategory = category;

            updateNavigation();
            renderNotes();

        });

        filterList.appendChild(button);

    });

    updateFilterActive();

}


function addCategory() {

    const category = prompt("Masukkan nama kategori baru:");

    if (!category) return;

    const name = category.trim();

    if (!name) return;

    if (name.length > 30) {
        showToast("Nama kategori maksimal 30 karakter.", "error");
        return;
    }

    const exists = categories.some(
        item => item.toLowerCase() === name.toLowerCase()
    );

    if (exists) {
        showToast("Kategori sudah tersedia.", "error");
        return;
    }

    categories.push(name);

    saveStorage();
    renderCategories();

    showToast("Kategori berhasil ditambahkan.");

}


/* =========================================
   7. NAVIGATION
   ========================================= */

function updateNavigation() {

    document.querySelectorAll(".nav-item").forEach(item => {

        item.classList.toggle(
            "active",
            item.dataset.view === currentView
        );

    });

    document.querySelectorAll(".category-item").forEach(item => {

        item.classList.toggle(
            "active",
            currentView === "all" &&
            item.querySelector(".category-name")?.textContent === currentCategory
        );

    });

    updateFilterActive();

    const navigationTitles = {
        all: {
            title: "All Notes",
            description: "Your notes, all in one place."
        },

        favorites: {
            title: "Favorites",
            description: "Your favorite notes."
        },

        pinned: {
            title: "Pinned Notes",
            description: "Your most important notes."
        },

        trash: {
            title: "Trash",
            description: "Deleted notes are stored here."
        }
    };

    const info = navigationTitles[currentView];

    if (info) {
        pageTitle.textContent = info.title;
        pageDescription.textContent = info.description;
    } else {
        pageTitle.textContent = currentCategory;
        pageDescription.textContent = "Notes in this category.";
    }

}


function updateFilterActive() {

    document.querySelectorAll(".filter-button").forEach(button => {

        button.classList.toggle(
            "active",
            currentView === "all" &&
            button.dataset.category === currentCategory
        );

    });

}


/* =========================================
   8. NOTE FORM - OPEN MODAL
   ========================================= */

function openNoteModal(note = null) {

    noteForm.reset();

    if (note) {

        modalTitle.textContent = "Edit Note";

        noteIdInput.value = note.id;
        noteTitleInput.value = note.title;
        noteContentInput.value = note.content;
        noteCategoryInput.value = note.category;

    } else {

        modalTitle.textContent = "Create New Note";

        noteIdInput.value = "";

        noteCategoryInput.value =
            categories.includes(currentCategory)
                ? currentCategory
                : categories[0];

    }

    noteModal.hidden = false;

    document.body.style.overflow = "hidden";

    noteTitleInput.focus();

}


function closeNoteModal() {

    noteModal.hidden = true;

    document.body.style.overflow = "";

    noteForm.reset();

}


/* =========================================
   9. CREATE & UPDATE NOTE
   ========================================= */

function saveNote(event) {

    event.preventDefault();

    const id = noteIdInput.value;

    const title = noteTitleInput.value.trim();
    const content = noteContentInput.value.trim();
    const category = noteCategoryInput.value;

    if (!title) {
        showToast("Judul catatan wajib diisi.", "error");
        return;
    }

    if (!categories.includes(category)) {
        showToast("Kategori tidak valid.", "error");
        return;
    }

    const now = new Date().toISOString();

    if (id) {

        const index = notes.findIndex(
            note => note.id === id
        );

        if (index === -1) {
            showToast("Catatan tidak ditemukan.", "error");
            return;
        }

        notes[index] = {
            ...notes[index],
            title,
            content,
            category,
            updatedAt: now
        };

        showToast("Catatan berhasil diperbarui.");

    } else {

        const newNote = {
            id: generateId(),
            title,
            content,
            category,

            favorite: false,
            pinned: false,
            deleted: false,

            createdAt: now,
            updatedAt: now
        };

        notes.unshift(newNote);

        showToast("Catatan berhasil dibuat.");

    }

    if (!saveStorage()) return;

    closeNoteModal();

    renderAll();

}


/* =========================================
   10. GET FILTERED NOTES
   ========================================= */

function getFilteredNotes() {

    let result = [...notes];

    // Filter berdasarkan halaman

    if (currentView === "trash") {

        result = result.filter(note => note.deleted);

    } else {

        result = result.filter(note => !note.deleted);

    }


    if (currentView === "favorites") {

        result = result.filter(note => note.favorite);

    }


    if (currentView === "pinned") {

        result = result.filter(note => note.pinned);

    }


    // Filter kategori

    if (
        currentView === "all" &&
        currentCategory !== "all"
    ) {

        result = result.filter(
            note => note.category === currentCategory
        );

    }


    // Search

    if (currentSearch) {

        result = result.filter(note => {

            const title = note.title.toLowerCase();
            const content = note.content.toLowerCase();
            const category = note.category.toLowerCase();

            return (
                title.includes(currentSearch) ||
                content.includes(currentSearch) ||
                category.includes(currentSearch)
            );

        });

    }


    // Sorting

    if (currentSort === "latest") {

        result.sort(
            (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        );

    } else if (currentSort === "oldest") {

        result.sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );

    } else if (currentSort === "alphabetical") {

        result.sort(
            (a, b) => a.title.localeCompare(b.title)
        );

    }


    // Pinned notes appear first outside Trash

    if (currentView !== "trash") {

        result.sort(
            (a, b) => Number(b.pinned) - Number(a.pinned)
        );

    }

    return result;

}


/* =========================================
   11. RENDER NOTES
   ========================================= */

function renderNotes() {

    const filteredNotes = getFilteredNotes();

    notesContainer.innerHTML = "";

    notesContainer.classList.toggle(
        "list-view",
        currentLayout === "list"
    );


    filteredNotes.forEach(note => {

        const card = createNoteCard(note);

        notesContainer.appendChild(card);

    });


    emptyState.hidden = filteredNotes.length !== 0;

    if (filteredNotes.length === 0) {

        const heading = emptyState.querySelector("h2");
        const description = emptyState.querySelector("p");
        const button = document.getElementById("emptyNewNoteBtn");

        if (currentView === "trash") {

            heading.textContent = "Trash is empty";
            description.textContent = "No deleted notes found.";

            button.hidden = true;

        } else {

            heading.textContent = currentSearch
                ? "No notes found"
                : "Your notebook is empty";

            description.textContent = currentSearch
                ? "Try another search keyword."
                : "Create your first note and start writing.";

            button.hidden = false;

        }

    }

}


/* =========================================
   12. CREATE NOTE CARD
   ========================================= */

function createNoteCard(note) {

    const card = document.createElement("article");

    card.className = "note-card";

    const colors = [
        "color-green",
        "color-yellow",
        "color-blue",
        "color-pink",
        "color-purple"
    ];

    const colorIndex = Math.abs(
        note.title.length + note.category.length
    ) % colors.length;

    card.classList.add(
        colors[colorIndex]
    );


    // Card Header

    const top = document.createElement("div");

    top.className = "note-card-top";


    const label = document.createElement("span");

    label.className = "note-label";

    label.textContent = note.deleted
        ? "Deleted"
        : note.pinned
            ? "📌 Pinned"
            : note.category;


    const actions = document.createElement("div");

    actions.className = "note-actions";

    
    if (!note.deleted) {

        // Pin Button
        actions.appendChild(
            createActionButton(
                note.pinned ? "📌" : "⌖",
                "Pin",
                "pin",
                note.id,
                note.pinned
            )
        );

        // Favorite Button
        actions.appendChild(
            createActionButton(
                note.favorite ? "★" : "☆",
                "Favorite",
                "favorite",
                note.id,
                note.favorite
            )
        );

        // Edit Button
        actions.appendChild(
            createActionButton(
                "✎",
                "Edit",
                "edit",
                note.id
            )
        );

        // Delete Button
        actions.appendChild(
            createActionButton(
                "🗑",
                "Delete",
                "delete",
                note.id
            )
        );

    } else {

        actions.appendChild(
            createActionButton(
                "↶",
                "Restore",
                "restore",
                note.id
            )
        );

        actions.appendChild(
            createActionButton(
                "×",
                "Delete permanently",
                "permanent-delete",
                note.id
            )
        );

    }

    top.appendChild(label);
    top.appendChild(actions);


    // Card Title

    const title = document.createElement("h3");

    title.className = "note-title";
    title.textContent = note.title;


    // Card Content

    const content = document.createElement("p");

    content.className = "note-content";
    content.textContent = note.content || "No content";


    // Card Footer

    const footer = document.createElement("div");

    footer.className = "note-card-footer";


    const category = document.createElement("span");

    category.className = "note-category";
    category.textContent = note.category;


    const date = document.createElement("span");

    date.className = "note-date";

    date.textContent = note.deleted
        ? `Deleted: ${formatDate(note.updatedAt)}`
        : formatDate(note.updatedAt);


    footer.appendChild(category);
    footer.appendChild(date);


    // Assemble Card

    card.appendChild(top);
    card.appendChild(title);
    card.appendChild(content);
    card.appendChild(footer);


    // Click card to edit

    if (!note.deleted) {

        card.addEventListener("dblclick", () => {
            openNoteModal(note);
        });

    }

    return card;

}


/* =========================================
   13. ACTION BUTTON
   ========================================= */

function createActionButton(
    icon,
    label,
    action,
    id,
    active = false
) {

    const button = document.createElement("button");

    button.className = "note-action-btn";

    if (active) {
        button.classList.add("is-active");
    }

    button.textContent = icon;

    button.title = label;
    button.setAttribute("aria-label", label);

    button.addEventListener("click", () => {

        handleNoteAction(action, id);

    });

    return button;

}


/* =========================================
   14. HANDLE NOTE ACTIONS
   ========================================= */

function handleNoteAction(action, id) {

    const note = notes.find(item => item.id === id);

    if (!note) return;


    switch (action) {

        case "pin":

            togglePin(id);

            break;

        case "edit":

            openNoteModal(note);

            break;


        case "favorite":

            note.favorite = !note.favorite;

            saveStorage();
            renderAll();

            showToast(
                note.favorite
                    ? "Added to favorites."
                    : "Removed from favorites."
            );

            break;


        case "delete":

            if (!confirm("Move this note to Trash?")) return;

            note.deleted = true;
            note.updatedAt = new Date().toISOString();

            saveStorage();
            renderAll();

            showToast("Note moved to Trash.");

            break;


        case "restore":

            note.deleted = false;
            note.updatedAt = new Date().toISOString();

            saveStorage();
            renderAll();

            showToast("Note restored successfully.");

            break;


        case "permanent-delete":

            if (!confirm("Delete this note permanently?")) return;

            notes = notes.filter(
                item => item.id !== id
            );

            saveStorage();
            renderAll();

            showToast("Note permanently deleted.");

            break;

    }

}


/* =========================================
   15. PINNED NOTES
   ========================================= */

function togglePin(id) {

    const note = notes.find(item => item.id === id);

    if (!note || note.deleted) return;

    note.pinned = !note.pinned;

    saveStorage();
    renderAll();

    showToast(
        note.pinned
            ? "Note pinned."
            : "Note unpinned."
    );

}


/* =========================================
   16. COUNTERS
   ========================================= */

function updateCounters() {

    const activeNotes = getActiveNotes();

    allCount.textContent = activeNotes.length;

    favoriteCount.textContent = activeNotes.filter(
        note => note.favorite
    ).length;

    pinnedCount.textContent = activeNotes.filter(
        note => note.pinned
    ).length;

    trashCount.textContent = notes.filter(
        note => note.deleted
    ).length;

}


/* =========================================
   17. SEARCH
   ========================================= */

searchInput.addEventListener("input", () => {

    currentSearch = searchInput.value
        .trim()
        .toLowerCase();

    renderNotes();

});


/* =========================================
   18. SORT
   ========================================= */

sortSelect.addEventListener("change", () => {

    currentSort = sortSelect.value;

    renderNotes();

});


/* =========================================
   19. GRID & LIST VIEW
   ========================================= */

function setLayout(layout) {

    currentLayout = layout;

    document.getElementById("gridViewBtn")
        .classList.toggle("active", layout === "grid");

    document.getElementById("listViewBtn")
        .classList.toggle("active", layout === "list");

    renderNotes();

}


/* =========================================
   20. DARK MODE
   ========================================= */

function toggleTheme() {

    document.body.classList.toggle("dark-mode");

    const isDark = document.body.classList.contains("dark-mode");

    localStorage.setItem(
        STORAGE_KEYS.theme,
        isDark ? "dark" : "light"
    );

    document.getElementById("themeToggle").textContent =
        isDark ? "☾" : "☼";

}


function loadTheme() {

    const savedTheme = localStorage.getItem(
        STORAGE_KEYS.theme
    );

    if (savedTheme === "dark") {

        document.body.classList.add("dark-mode");

        document.getElementById("themeToggle").textContent = "☾";

    }

}


/* =========================================
   21. EXPORT JSON
   ========================================= */

function exportNotes() {

    const backupData = {
        app: "Personal Notes",
        version: 1,
        exportedAt: new Date().toISOString(),
        categories,
        notes
    };

    const json = JSON.stringify(
        backupData,
        null,
        4
    );

    const blob = new Blob(
        [json],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download =
        `personal-notes-backup-${Date.now()}.json`;

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);

    showToast("Backup berhasil diekspor.");

}


/* =========================================
   22. IMPORT JSON
   ========================================= */

function importNotes(file) {

    if (!file) return;

    const reader = new FileReader();

    reader.onload = event => {

        try {

            const backup = JSON.parse(event.target.result);

            if (
                !backup ||
                !Array.isArray(backup.notes) ||
                !Array.isArray(backup.categories)
            ) {

                throw new Error("Invalid backup format.");

            }


            const validNotes = backup.notes.every(note => {

                return (
                    note &&
                    typeof note.id === "string" &&
                    typeof note.title === "string" &&
                    typeof note.content === "string" &&
                    typeof note.category === "string" &&
                    typeof note.favorite === "boolean" &&
                    typeof note.pinned === "boolean" &&
                    typeof note.deleted === "boolean" &&
                    typeof note.createdAt === "string" &&
                    typeof note.updatedAt === "string"
                );

            });


            if (!validNotes) {
                throw new Error("Invalid note data.");
            }


            if (
                !backup.categories.every(
                    category =>
                        typeof category === "string" &&
                        category.trim() &&
                        category.length <= 30
                )
            ) {

                throw new Error("Invalid category data.");

            }


            if (!confirm(
                "Import backup akan mengganti semua catatan dan kategori saat ini. Lanjutkan?"
            )) return;


            const importedCategories = [
                ...new Set([
                    ...DEFAULT_CATEGORIES,
                    ...backup.categories
                ])
            ];

            const categorySet = new Set(importedCategories);

            const importedNotes = backup.notes.map(note => ({

                ...note,

                category: categorySet.has(note.category)
                    ? note.category
                    : "General"

            }));


            const oldNotes = notes;
            const oldCategories = categories;

            notes = importedNotes;
            categories = importedCategories;


            if (!saveStorage()) {

                notes = oldNotes;
                categories = oldCategories;

                return;

            }


            currentView = "all";
            currentCategory = "all";
            currentSearch = "";

            searchInput.value = "";

            updateNavigation();
            renderAll();

            showToast("Backup berhasil dipulihkan.");

        } catch (error) {

            console.error("Import error:", error);

            showToast(
                "File backup tidak valid atau rusak.",
                "error"
            );

        }

    };

    reader.onerror = () => {
        showToast("Gagal membaca file.", "error");
    };

    reader.readAsText(file);

}


/* =========================================
   23. MOBILE SIDEBAR
   ========================================= */

function toggleSidebar() {

    document.getElementById("sidebar")
        .classList.toggle("show");

}


function closeSidebar() {

    document.getElementById("sidebar")
        .classList.remove("show");

}


/* =========================================
   24. RENDER ALL
   ========================================= */

function renderAll() {

    renderCategories();

    renderNotes();

    updateCounters();

    updateNavigation();

}


/* =========================================
   25. EVENT LISTENERS
   ========================================= */

// Navigation

document.querySelectorAll(".nav-item").forEach(item => {

    item.addEventListener("click", () => {

        currentView = item.dataset.view;
        currentCategory = "all";

        closeSidebar();

        renderAll();

    });

});


// New Note

document.getElementById("newNoteBtn")
    .addEventListener("click", () => {

        openNoteModal();

    });


document.getElementById("emptyNewNoteBtn")
    .addEventListener("click", () => {

        openNoteModal();

    });


// Close Modal

document.getElementById("closeModalBtn")
    .addEventListener("click", closeNoteModal);


document.getElementById("cancelModalBtn")
    .addEventListener("click", closeNoteModal);


noteModal.addEventListener("click", event => {

    if (event.target === noteModal) {
        closeNoteModal();
    }

});


// Save Note

noteForm.addEventListener("submit", saveNote);


// Add Category

document.getElementById("addCategoryBtn")
    .addEventListener("click", addCategory);


// Grid / List

document.getElementById("gridViewBtn")
    .addEventListener("click", () => setLayout("grid"));


document.getElementById("listViewBtn")
    .addEventListener("click", () => setLayout("list"));


// Theme

document.getElementById("themeToggle")
    .addEventListener("click", toggleTheme);


// Export

document.getElementById("exportBtn")
    .addEventListener("click", exportNotes);


// Import

document.getElementById("importBtn")
    .addEventListener("click", () => {

        document.getElementById("importFile").click();

    });


document.getElementById("importFile")
    .addEventListener("change", event => {

        const file = event.target.files[0];

        importNotes(file);

        event.target.value = "";

    });


// Mobile Menu

document.getElementById("mobileMenuBtn")
    .addEventListener("click", toggleSidebar);


// Keyboard Shortcuts

document.addEventListener("keydown", event => {

    if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k"
    ) {

        event.preventDefault();

        searchInput.focus();

    }


    if (event.key === "Escape" && !noteModal.hidden) {

        closeNoteModal();

    }

});


/* =========================================
   26. INITIALIZE APPLICATION
   ========================================= */

function initApp() {

    // Validate stored data

    if (!Array.isArray(notes)) {
        notes = [];
    }

    if (!Array.isArray(categories)) {
        categories = [...DEFAULT_CATEGORIES];
    }

    categories = [
        ...new Set([
            ...DEFAULT_CATEGORIES,
            ...categories.filter(
                category =>
                    typeof category === "string" &&
                    category.trim() &&
                    category.length <= 30
            )
        ])
    ];


    loadTheme();

    saveStorage();

    renderAll();

    console.log("Personal Notes initialized successfully!");

}


// Start Application

initApp();
