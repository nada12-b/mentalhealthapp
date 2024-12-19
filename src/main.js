// Define the base URL for the Azure Function App
const apiBaseUrl = "https://mentalhealthfunctions.azurewebsites.net/api";

// Endpoints for the functions
const uploadAttachmentEndpoint = "https://mentalhealthfunctions.azurewebsites.net/api/uploadAttachment";
const fetchDataEndpoint = "https://mentalhealthfunctions.azurewebsites.net/api/fetchData";


/**
 * Upload a file to Blob Storage via the backend.
 * @param {File} file - The file selected by the user.
 */
async function uploadFile(file) {
    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await fetch(uploadAttachmentEndpoint, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error("Failed to upload file");
        }

        const fileUrl = await response.text(); // Backend returns the file URL
        console.log("File uploaded successfully:", fileUrl);
        alert(`Fichier téléchargé avec succès ! Accédez-y ici : ${fileUrl}`);
    } catch (error) {
        console.error("Error uploading file:", error);
        alert("Erreur lors du téléchargement du fichier. Veuillez réessayer.");
    }
}

/**
 * Fetch availability for a therapist on a specific date.
 * @param {number} therapistId - The ID of the therapist.
 * @param {string} date - The date in YYYY-MM-DD format.
 */
async function fetchAvailability(therapistId, date) {
    const requestBody = {
        therapist_id: therapistId,
        date: date,
    };

    try {
        const response = await fetch(fetchDataEndpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            if (response.status === 404) {
                alert("Aucune disponibilité trouvée pour le thérapeute et la date donnés.");
            } else {
                throw new Error("Impossible de récupérer les disponibilités.");
            }
            return;
        }

        const availability = await response.json(); // Backend returns availability as JSON
        console.log("Disponibilités récupérées avec succès :", availability);

        // Display availability to the user
        const slotsList = document.getElementById("slotsList");
        slotsList.innerHTML = ""; // Clear previous results
        availability.forEach((slot) => {
            const listItem = document.createElement("li");
            listItem.textContent = `Début : ${slot.start_time}, Fin : ${slot.end_time}`;
            slotsList.appendChild(listItem);
        });
    } catch (error) {
        console.error("Error fetching availability:", error);
        alert("Erreur lors de la récupération des disponibilités. Veuillez réessayer.");
    }
}

/**
 * Handle file upload from the user.
 */
function handleFileUpload() {
    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];
    if (file) {
        uploadFile(file);
    } else {
        alert("Veuillez sélectionner un fichier à télécharger.");
    }
}

/**
 * Handle availability fetch request from the user.
 */
function handleFetchAvailability() {
    const therapistSelect = document.getElementById("therapistSelect");
    const dateInput = document.getElementById("appointmentDate");

    const therapistId = parseInt(therapistSelect.value, 10);
    const date = dateInput.value;

    if (!therapistId || !date) {
        alert("Veuillez sélectionner un thérapeute et une date.");
        return;
    }

    fetchAvailability(therapistId, date);
}

// Event Listeners for buttons
document.getElementById("uploadButton").addEventListener("click", handleFileUpload);
document.getElementById("getSlotsButton").addEventListener("click", handleFetchAvailability);
