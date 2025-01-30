async function fetchAdminData() {
    try {
        const response = await fetch('http://127.0.0.1:5000/admin-data');
        const data = await response.json();

        // Populate user table
        const userTable = document.getElementById('userTable').querySelector('tbody');
        userTable.innerHTML = ''; // Clear existing rows
        data.users=data.users.reverse();
        data.users.forEach(user => {
            const row = `<tr>
                <td>${user._id}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
            </tr>`;
            userTable.innerHTML += row;
        });
        console.log(data.reservations)
        // Populate reservation table
        const reservationTable = document.getElementById('reservationTable').querySelector('tbody');
        reservationTable.innerHTML = ''; // Clear existing rows
        data.reservations=data.reservations.reverse();
        data.reservations.forEach(reservation => {
            const row = `<tr>
                <td>${reservation._id}</td>
                <td>${reservation.email}</td>
                <td>${reservation.check_in}</td>
                <td>${reservation.check_out}</td>
                <td>${reservation.guests}</td>
                <td>${reservation.total}</td>
            </tr>`;
            reservationTable.innerHTML += row;
        });
    } catch (error) {
        console.error('Error fetching admin data:', error);
    }
}

// Call the function when the page is loaded
window.onload = fetchAdminData;
