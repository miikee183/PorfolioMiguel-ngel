// Fondo dinámico que sigue al ratón
document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    document.documentElement.style.setProperty('--mx', x + '%');
    document.documentElement.style.setProperty('--my', y + '%');
});

document.addEventListener('DOMContentLoaded', () => {

    // Efecto máquina de escribir en el greeting
    const greeting = document.querySelector('.greeting');
    if (greeting) {
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
    }

    // Resaltar botón activo en navbar
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            navBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Modal de certificados
    const modal = document.getElementById('certModal');
    const certImage = document.getElementById('certImage');
    const closeBtn = document.querySelector('.modal-close');
    const certBtns = document.querySelectorAll('.cert-btn');

    const certMap = {
        dam: 'img/CertificadoDAM.jpeg',
        csic: 'img/CertificadoCSIC.jpeg'
    };

    certBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const key = btn.dataset.cert;
            certImage.src = certMap[key];
            modal.classList.add('show');
        });
    });

    const closeModal = () => modal.classList.remove('show');

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    // Descargar CV
    const cvBtn = document.getElementById('downloadCv');
    if (cvBtn) {
        cvBtn.addEventListener('click', () => {
            const link = document.createElement('a');
            link.href = 'img/cv.pdf';
            link.download = 'Miguel_Angel_Pascual_Lopez_CV.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

});
