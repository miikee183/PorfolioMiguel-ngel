# Porfolio Miguel Ángel Pascual López

> _Software Developer_

Portfolio personal con estilo terminal / hacker. Desarrollado con HTML, CSS y JavaScript vanilla.

## 🌐 Web

[https://miikee183.github.io/PorfolioMiguel-ngel/](https://miikee183.github.io/PorfolioMiguel-ngel/)

## 📄 Secciones

- **Perfil** — Presentación, estudios, certificaciones, redes y descarga de CV
- **Experiencia** — Prácticas en el IMN-CSIC (Instituto de Magnetismo Aplicado)
- **Tecnologías** — Stack técnico con logos y barras de nivel
- **Proyectos** — Side projects personales (Blood on the Clocktower WEB, Coliteus)
- **Feedback** — Sistema de comentarios con Google Sign-In, likes y respuestas
- **Aviso Legal** — Información sobre datos recogidos, finalidad, legitimación, destinatarios, conservación, derechos y cookies

## 🛠️ Tecnologías usadas

- HTML5, CSS3, JavaScript vanilla
- Diseño responsive
- Temática hacker (#00ff41 sobre #000)
- Fuente Courier New (monospace)
- SVG inline para iconos (sin emojis ni icon-fonts)

## ⚙️ Backend (Feedback API)

- **Framework:** FastAPI (Python)
- **Base de datos:** PostgreSQL
- **ORM:** SQLAlchemy
- **Autenticación:** Google OAuth 2.0 (`initTokenClient` + userinfo API)
- **Modelos:** `User`, `Comment`, `Like` (relaciones SQLAlchemy)
- **Endpoints principales:**
  - `POST /api/auth/google` — Inicio de sesión con Google
  - `GET /api/comments` — Listar comentarios (soporta `?sort=recent|top`)
  - `POST /api/comments` — Crear comentario o respuesta
  - `GET /api/comments/{id}/replies` — Obtener respuestas de un comentario
  - `POST /api/comments/{id}/like` — Toggle like (un like por usuario)
- **Despliegue:** Render (free tier)

## 🚀 Despliegue

- **Frontend:** GitHub Pages desde la rama `main` en la raíz del repositorio
- **Backend:** Render (servicio web + PostgreSQL), con `DATABASE_URL` como variable de entorno
- **API base:** Conmutación automática entre `localhost:8000` y URL de producción
