document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById('autoForm');
    const autosTable = document.getElementById('autosTable');

    async function loadAutos() {
        const res = await fetch('/api/autos');
        const autos = await res.json();

        autosTable.innerHTML = '';
        autos.forEach(auto => {
            autosTable.innerHTML += `
                <tr>
                    <td>${auto.marca}</td>
                    <td>${auto.modelo}</td>
                    <td>${auto.año}</td>
                    <td>${auto.precio}</td>
                    <td>${auto.color}</td>
                    <td>
                        <button class="edit" onclick="editAuto(${auto.id})">Editar</button>
                        <button class="delete" onclick="deleteAuto(${auto.id})">Eliminar</button>
                    </td>
                </tr>
            `;
        });
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('autoId').value;
        const marca = document.getElementById('marca').value;
        const modelo = document.getElementById('modelo').value;
        const año = document.getElementById('año').value;
        const precio = document.getElementById('precio').value;
        const color = document.getElementById('color').value;

        const method = id ? 'PUT' : 'POST';
        const url = id ? `/api/autos/${id}` : '/api/autos';

        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ marca, modelo, año, precio, color })
        });

        form.reset();
        loadAutos();

        Swal.fire({
            icon: 'success',
            title: id ? 'Auto actualizado' : 'Auto agregado',
            showConfirmButton: false,
            timer: 1500
        });
    });

    window.editAuto = async (id) => {
        const res = await fetch(`/api/autos`);
        const autos = await res.json();
        const auto = autos.find(a => a.id === id);

        document.getElementById('autoId').value = auto.id;
        document.getElementById('marca').value = auto.marca;
        document.getElementById('modelo').value = auto.modelo;
        document.getElementById('año').value = auto.año;
        document.getElementById('precio').value = auto.precio;
        document.getElementById('color').value = auto.color;
    };

    window.deleteAuto = async (id) => {
        await fetch(`/api/autos/${id}`, { method: 'DELETE' });
        loadAutos();

        Swal.fire({
            icon: 'success',
            title: 'Auto eliminado',
            showConfirmButton: false,
            timer: 1500
        });
    };

    loadAutos();
});