let menuOpen = false;

function openMenu() {
    const bodyElement = document.querySelector('.body');
    const menuElement = document.querySelector('.menu');

    bodyElement.style.filter = "blur(5px) brightness(0.3)";
    menuElement.style.display = "block";
    menuOpen = true;
}

function closeMenu() {
    menuOpen = false;
    const bodyElement = document.querySelector('.body');
    const menuElement = document.querySelector('.menu');

    bodyElement.style.filter = "none";
    menuElement.style.display = "none";
}

document.addEventListener('click', function (event) {
    if (menuOpen && 
        !event.target.closest('.menu') && 
        !event.target.closest('.header--nb')) {
        closeMenu();
    }
});

function sendToServer(data) {
    return fetch('../../handlers/events/reg.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json());
}