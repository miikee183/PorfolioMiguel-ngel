document.addEventListener('DOMContentLoaded', () => {

    // Efecto de máquina de escribir en el greeting
    const greeting = document.querySelector('.greeting');
    const originalText = greeting.textContent;
    greeting.textContent = '';

    let charIndex = 0;
    const typeInterval = setInterval(() => {
        if (charIndex < originalText.length) {
            greeting.textContent += originalText[charIndex];
            charIndex++;
        } else {
            clearInterval(typeInterval);
        }
    }, 50);

    // Resaltar el botón activo en la navbar
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
        btn.addEventListener('click', function (e) {
            navBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

});
