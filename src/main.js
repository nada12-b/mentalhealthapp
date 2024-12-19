document.getElementById('getSlotsButton').addEventListener('click', async function () {
    // Get therapist ID and selected date from the form
    const therapistId = document.getElementById('therapistSelect').value;
    const appointmentDate = document.getElementById('appointmentDate').value;

    // Validation
    if (!therapistId || !appointmentDate) {
        alert('Veuillez sélectionner un thérapeute et une date.');
        return;
    }

    // Fetch available slots from the Azure Function
    try {
        const response = await fetch(
            `https://mentalhealthfunctions.azurewebsites.net/api/mysqlTest?therapist_id=${therapistId}&date=${appointmentDate}`
        );

        if (!response.ok) {
            throw new Error('Impossible de récupérer les créneaux disponibles.');
        }

        const slots = await response.json();

        // Display slots in the list
        const slotsList = document.getElementById('slotsList');
        slotsList.innerHTML = ''; // Clear the list first
        if (slots.length === 0) {
            slotsList.innerHTML = '<li>Aucun créneau disponible.</li>';
        } else {
            slots.forEach(slot => {
                const listItem = document.createElement('li');
                listItem.textContent = `${slot.start_time} - ${slot.end_time}`;
                slotsList.appendChild(listItem);
            });
        }
    } catch (error) {
        console.error(error);
        alert('Une erreur est survenue lors de la récupération des créneaux.');
    }
});
