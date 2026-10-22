
const form = document.getElementById("itemForm");

const lostBtn = document.getElementById("lostBtn");
const foundBtn = document.getElementById("foundBtn");

const selectedStatus = document.getElementById("selectedStatus");
const message = document.getElementById("message");
const result = document.getElementById("result");
const itemsList = document.getElementById("itemsList");

const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");

let status = "";

// Browser mein saved items load karo
let items = JSON.parse(localStorage.getItem("campusItems")) || [];

// Har item ko unique ID do
items.forEach(function(item) {
    if (!item.id) {
        item.id = Date.now().toString() +
            Math.random().toString(16).slice(2);
    }
});

localStorage.setItem("campusItems", JSON.stringify(items));

// Photo ko save karne layak format mein badlo
function readPhoto(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);

        reader.readAsDataURL(file);
    });
}

// Item ka card banao
function showItem(item) {
    const card = document.createElement("div");
    card.className = "item-card";

    const title = document.createElement("h3");
    title.textContent = item.name;

    const category = document.createElement("p");
    category.textContent = "Category: " + item.category;

    const location = document.createElement("p");
    location.textContent = "Location: " + item.location;

    // STATUS BADGE
    const itemStatus = document.createElement("span");
    itemStatus.textContent = item.status;
    itemStatus.className =
        item.status.toLowerCase() === "lost"
            ? "status-badge status-lost"
            : "status-badge status-found";

    const statusRow = document.createElement("p");
    statusRow.appendChild(itemStatus);

    card.append(title, category, location, statusRow);

    // Photo dikhao
    if (item.photo) {
        const image = document.createElement("img");
        image.src = item.photo;
        image.alt = item.name;
        image.width = 150;
        card.appendChild(image);
    }

    // EDIT BUTTON
    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit Item";
    editBtn.className = "edit-btn";

    editBtn.addEventListener("click", function() {
        const newName = prompt("Enter item name:", item.name);
        if (newName === null || newName.trim() === "") return;

        const newCategory = prompt(
            "Enter category:", item.category
        );
        if (newCategory === null || newCategory.trim() === "") return;

        const newLocation = prompt(
            "Enter location:", item.location
        );
        if (newLocation === null || newLocation.trim() === "") return;

        const newStatus = prompt(
            "Enter status: Lost or Found", item.status
        );
        if (newStatus === null) return;

        const normalizedStatus = newStatus.trim().toLowerCase();

        if (normalizedStatus !== "lost" &&
            normalizedStatus !== "found") {
            alert("Please enter only Lost or Found.");
            return;
        }

        const oldValues = {
            name: item.name,
            category: item.category,
            location: item.location,
            status: item.status
        };

        item.name = newName.trim();
        item.category = newCategory.trim();
        item.location = newLocation.trim();
        item.status =
            normalizedStatus === "lost" ? "Lost" : "Found";

        try {
            localStorage.setItem(
                "campusItems",
                JSON.stringify(items)
            );

            renderItems();
            message.textContent = "Item updated successfully!";
        } catch (error) {
            Object.assign(item, oldValues);
            renderItems();
            message.textContent = "Could not save changes. Try again.";
        }
    });

    card.appendChild(editBtn);

    // DELETE BUTTON
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete Item";
    deleteBtn.className = "delete-btn";

    deleteBtn.addEventListener("click", function() {
        if (!confirm("Are you sure you want to delete this item?")) {
            return;
        }

        const updatedItems = items.filter(function(existingItem) {
            return existingItem.id !== item.id;
        });

        try {
            localStorage.setItem(
                "campusItems",
                JSON.stringify(updatedItems)
            );

            items = updatedItems;
            renderItems();
            message.textContent = "Item deleted successfully!";
        } catch (error) {
            message.textContent = "Could not delete item. Try again.";
        }
    });

    card.appendChild(deleteBtn);
    itemsList.appendChild(card);
}

// Search aur Filter
function renderItems() {
    itemsList.replaceChildren();

    const searchText = searchInput.value.trim().toLowerCase();
    const selectedFilter = statusFilter.value;

    const filteredItems = items.filter(function(item) {
        const matchesName =
            item.name.toLowerCase().includes(searchText);

        const matchesStatus =
            selectedFilter === "All" ||
            item.status === selectedFilter;

        return matchesName && matchesStatus;
    });

    if (filteredItems.length === 0) {
        const noResults = document.createElement("p");
        noResults.className = "no-results";
        noResults.textContent = "No matching items found.";
        itemsList.appendChild(noResults);
        return;
    }

    filteredItems.forEach(function(item) {
        showItem(item);
    });
}

searchInput.addEventListener("input", renderItems);
statusFilter.addEventListener("change", renderItems);

// Lost button
lostBtn.addEventListener("click", function() {
    status = "Lost";
    selectedStatus.textContent = "Selected Status: Lost";
    message.textContent = "";
});

// Found button
foundBtn.addEventListener("click", function() {
    status = "Found";
    selectedStatus.textContent = "Selected Status: Found";
    message.textContent = "";
});

// Form submit
form.addEventListener("submit", async function(event) {
    event.preventDefault();

    if (status === "") {
        message.textContent = "Please select Lost or Found first.";
        return;
    }

    const itemName =
        document.getElementById("itemName").value.trim();

    const category =
        document.getElementById("itemCategory").value;

    const location =
        document.getElementById("location").value.trim();

    const photoInput = document.getElementById("itemPhoto");
    const photo = photoInput.files[0];

    if (!itemName || !category || !location) {
        message.textContent = "Please fill in all required fields.";
        return;
    }

    try {
        const photoData = photo ? await readPhoto(photo) : "";

        const newItem = {
            id: Date.now().toString() +
                Math.random().toString(16).slice(2),
            name: itemName,
            category: category,
            location: location,
            status: status,
            photo: photoData
        };

        const updatedItems = [newItem, ...items];

        localStorage.setItem(
            "campusItems",
            JSON.stringify(updatedItems)
        );

        items = updatedItems;

        // Submitted item ki details
        document.getElementById("resultName").textContent = itemName;
        document.getElementById("resultCategory").textContent = category;
        document.getElementById("resultLocation").textContent = location;
        document.getElementById("resultStatus").textContent = status;

        const resultPhoto = document.getElementById("resultPhoto");

        if (photoData) {
            resultPhoto.src = photoData;
            resultPhoto.hidden = false;
        } else {
            resultPhoto.removeAttribute("src");
            resultPhoto.hidden = true;
        }

        result.hidden = false;
        renderItems();

        message.textContent = "Item saved successfully!";

        form.reset();
        status = "";
        selectedStatus.textContent = "Please select Lost or Found.";

    } catch (error) {
        message.textContent =
            "Could not save item. Try a smaller photo or another image.";
    }
});

// Page khulte hi saved items dikhao
renderItems();
