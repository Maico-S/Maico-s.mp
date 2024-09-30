document.addEventListener('DOMContentLoaded', function () {
    const printerTable = document.getElementById('printerTable').querySelector('tbody');
    const addPrinterForm = document.getElementById('addPrinterForm');
    const maintenanceForm = document.getElementById('maintenanceForm');
    const printerSelect = document.getElementById('printerSelect');
    const alertsList = document.getElementById('alertsList');
    
    let printers = JSON.parse(localStorage.getItem('printers') || '[]');

    addPrinterForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const printerID = document.getElementById('printerID').value;
        const printerModel = document.getElementById('printerModel').value;
        const printerLocation = document.getElementById('printerLocation').value;

        const printer = {
            id: printerID,
            model: printerModel,
            location: printerLocation,
            lastMaintenance: null,
            nextMaintenance: null
        };

        printers.push(printer);
        localStorage.setItem('printers', JSON.stringify(printers));
        displayPrinters();
        updatePrinterSelect();
        addPrinterForm.reset();
    });

    maintenanceForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const selectedPrinterIndex = printerSelect.value;
        const maintenanceDate = document.getElementById('maintenanceDate').value;
        const maintenanceType = document.getElementById('maintenanceType').value;
        const maintenanceNotes = document.getElementById('maintenanceNotes').value;

        if (selectedPrinterIndex !== '') {
            printers[selectedPrinterIndex].lastMaintenance = maintenanceDate;
            printers[selectedPrinterIndex].nextMaintenance = calculateNextMaintenanceDate(maintenanceDate);
            printers[selectedPrinterIndex].maintenanceDetails = {
                type: maintenanceType,
                notes: maintenanceNotes
            };

            localStorage.setItem('printers', JSON.stringify(printers));
            displayPrinters();
            displayAlerts();
            maintenanceForm.reset();
        }
    });

    function displayPrinters() {
        printerTable.innerHTML = '';
        printers.forEach((printer, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${printer.id}</td>
                <td>${printer.model}</td>
                <td>${printer.location}</td>
                <td>${printer.lastMaintenance || 'N/A'}</td>
                <td>${printer.nextMaintenance || 'N/A'}</td>
                <td><button onclick="deletePrinter(${index})">Excluir</button></td>
            `;
            printerTable.appendChild(row);
        });
    }

    function updatePrinterSelect() {
        printerSelect.innerHTML = '<option value="">Selecione uma impressora</option>';
        printers.forEach((printer, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${printer.id} - ${printer.model}`;
            printerSelect.appendChild(option);
        });
    }

    function calculateNextMaintenanceDate(lastMaintenanceDate) {
        const lastDate = new Date(lastMaintenanceDate);
        lastDate.setDate(lastDate.getDate() + 45); // adiciona 45 dias
        return lastDate.toISOString().split('T')[0];
    }

    function displayAlerts() {
        alertsList.innerHTML = '';
        const today = new Date();

        printers.forEach(printer => {
            if (printer.nextMaintenance) {
                const nextMaintenanceDate = new Date(printer.nextMaintenance);
                const daysUntilMaintenance = (nextMaintenanceDate - today) / (1000 * 60 * 60 * 24);

                if (daysUntilMaintenance < 0) {
                    const listItem = document.createElement('li');
                    listItem.textContent = `A manutenção da impressora ${printer.id} está atrasada!`;
                    alertsList.appendChild(listItem);
                } else if (daysUntilMaintenance <= 7) {
                    const listItem = document.createElement('li');
                    listItem.textContent = `A manutenção da impressora ${printer.id} está próxima (${Math.ceil(daysUntilMaintenance)} dias restantes).`;
                    alertsList.appendChild(listItem);
                }
            }
        });
    }

    window.deletePrinter = function (index) {
        printers.splice(index, 1);
        localStorage.setItem('printers', JSON.stringify(printers));
        displayPrinters();
        updatePrinterSelect();
        displayAlerts();
    };

    displayPrinters();
    updatePrinterSelect();
    displayAlerts();
});
