// particulas de fondo animadas
(function initParticles() {
    const canvas = document.createElement('canvas');
    canvas.id = 'particles-canvas';
    document.body.prepend(canvas);
    const ctx = canvas.getContext('2d');
    let w, h, particles;

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }

    function createParticles(count) {
        particles = [];
        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                r: Math.random() * 2 + 1,
            });
        }
    }

    function draw() {
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#00ff41';
        for (const p of particles) {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0) p.x = w;
            if (p.x > w) p.x = 0;
            if (p.y < 0) p.y = h;
            if (p.y > h) p.y = 0;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
        }
        requestAnimationFrame(draw);
    }

    resize();
    createParticles(60);
    draw();
    window.addEventListener('resize', () => { resize(); createParticles(60); });
})();

// actualiza la posicion del cursor para el efecto de fondo
document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    document.documentElement.style.setProperty('--mx', x + '%');
    document.documentElement.style.setProperty('--my', y + '%');
});

document.addEventListener('DOMContentLoaded', () => {

    // efecto maquina de escribir en el saludo
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

    // resalta el boton activo de la barra de navegacion
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            navBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // modal para visualizar certificados
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

    // cierra el modal de certificados
    const closeModal = () => modal.classList.remove('show');

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    // descarga del curriculum vitae en pdf
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
