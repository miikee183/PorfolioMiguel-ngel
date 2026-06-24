const API_BASE = "https://portfolio-feedback-api-t8q4.onrender.com";
const GOOGLE_CLIENT_ID = "201681609523-3fc81n4vsdlqhtttd0ij83vgf038ghmb.apps.googleusercontent.com";

let currentUser = null;
let currentToken = null;

function $(id) { return document.getElementById(id); }

async function loadComments(sort) {
    const container = $("commentsContainer");
    container.innerHTML = '<p class="fb-loading">Cargando comentarios...</p>';

    try {
        const res = await fetch(`${API_BASE}/api/comments?sort=${sort}`);
        if (!res.ok) throw new Error("Error al cargar");
        const comments = await res.json();

        if (comments.length === 0) {
            container.innerHTML = '<p class="fb-empty">No hay comentarios aún. ¡Sé el primero!</p>';
            return;
        }

        container.innerHTML = "";
        for (const c of comments) {
            container.appendChild(renderComment(c));
        }
    } catch (e) {
        container.innerHTML = `<p class="fb-empty">Error al cargar comentarios: ${e.message}</p>`;
    }
}

function renderComment(c, isReply = false) {
    const div = document.createElement("div");
    div.className = `fb-comment${isReply ? " is-reply" : ""}`;
    div.dataset.id = c.id;

    const d = new Date(c.created_at);
    const dateStr = d.toLocaleDateString("es-ES", {
        year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
    });

    div.innerHTML = `
        <div class="fb-comment-head">
            <img class="fb-comment-avatar" src="${c.author.picture || ''}" alt="" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22><circle cx=%2212%22 cy=%2212%22 r=%2212%22 fill=%22%23333%22/><text x=%2212%22 y=%2216%22 fill=%22%2300ff41%22 font-size=%2210%22 font-family=%22monospace%22>?</text></svg>'">
            <span class="fb-comment-author">${escHtml(c.author.name)}</span>
            <span class="fb-comment-date">${dateStr}</span>
        </div>
        <div class="fb-comment-text">${escHtml(c.content)}</div>
        <div class="fb-comment-actions">
            <button class="fb-like-btn" onclick="toggleLike(${c.id}, this)">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#00ff41" stroke-width="2">
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                </svg>
                <span class="fb-like-count">${c.likes}</span>
            </button>
            ${!isReply ? `<button class="fb-reply-btn" onclick="showReplyForm(${c.id})">Responder</button>` : ''}
        </div>
        ${!isReply ? `
            <div class="fb-reply-form" id="replyForm-${c.id}">
                <textarea placeholder="Escribe tu respuesta..." id="replyText-${c.id}"></textarea>
                <div class="fb-form-actions">
                    <button class="fb-submit-btn" onclick="submitReply(${c.id})">Responder</button>
                    <button class="fb-cancel-btn" onclick="hideReplyForm(${c.id})">Cancelar</button>
                </div>
            </div>
            <div class="fb-replies" id="replies-${c.id}"></div>
            ${c.reply_count > 0 ? `<button class="fb-view-replies" onclick="toggleReplies(${c.id}, this)">Ver respuestas (${c.reply_count})</button>` : ''}
        ` : ''}
    `;

    return div;
}

function escHtml(str) {
    const d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
}

async function toggleLike(commentId, btn) {
    if (!currentToken) {
        alert("Inicia sesión con Google para dar like");
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/api/comments/${commentId}/like`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "token": currentToken },
        });
        if (!res.ok) throw new Error("Error");
        const data = await res.json();
        btn.classList.add("liked");
        btn.querySelector(".fb-like-count").textContent = data.likes;
        btn.querySelector("svg").setAttribute("fill", "#00ff41");
    } catch (e) {
        alert("Error al dar like");
    }
}

function showReplyForm(commentId) {
    $(`replyForm-${commentId}`).classList.add("show");
}

function hideReplyForm(commentId) {
    $(`replyForm-${commentId}`).classList.remove("show");
}

async function submitReply(commentId) {
    if (!currentToken) {
        alert("Inicia sesión con Google para responder");
        return;
    }

    const textarea = $(`replyText-${commentId}`);
    const content = textarea.value.trim();
    if (!content) return;

    try {
        const res = await fetch(`${API_BASE}/api/comments`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "token": currentToken },
            body: JSON.stringify({ content, parent_id: commentId }),
        });
        if (!res.ok) throw new Error("Error");
        const reply = await res.json();
        textarea.value = "";
        hideReplyForm(commentId);

        const repliesContainer = $(`replies-${commentId}`);
        repliesContainer.appendChild(renderComment(reply, true));
        repliesContainer.classList.add("show");

        const btn = repliesContainer.parentElement.querySelector(".fb-view-replies");
        if (btn) {
            const match = btn.textContent.match(/(\d+)/);
            const count = match ? parseInt(match[1]) + 1 : 1;
            btn.textContent = `Ver respuestas (${count})`;
        }
    } catch (e) {
        alert("Error al publicar respuesta");
    }
}

async function toggleReplies(commentId, btn) {
    const container = $(`replies-${commentId}`);
    if (container.classList.contains("show")) {
        container.classList.remove("show");
        container.innerHTML = "";
        btn.textContent = btn.textContent.replace("Ocultar", "Ver");
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/api/comments/${commentId}/replies`);
        if (!res.ok) throw new Error("Error");
        const replies = await res.json();
        container.innerHTML = "";
        for (const r of replies) {
            container.appendChild(renderComment(r, true));
        }
        container.classList.add("show");
        btn.textContent = btn.textContent.replace("Ver", "Ocultar");
    } catch (e) {
        alert("Error al cargar respuestas");
    }
}

function handleCredentialResponse(response) {
    fetch(`${API_BASE}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_token: response.credential }),
    })
        .then((r) => { if (!r.ok) throw new Error("Auth falló"); return r.json(); })
        .then((data) => {
            currentToken = data.token;
            currentUser = data.user;
            $("userAvatar").src = data.user.picture || "";
            $("userName").textContent = `[${data.user.name}]`;
            $("userInfo").style.display = "flex";
            $("googleSignInBtn").style.display = "none";
            $("commentForm").classList.add("show");
        })
        .catch((e) => alert("Error de autenticación: " + e.message));
}

$("googleSignInBtn").addEventListener("click", () => {
    google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
    });
    google.accounts.id.prompt();
});

$("submitComment").addEventListener("click", async () => {
    if (!currentToken) {
        alert("Inicia sesión primero");
        return;
    }
    const textarea = $("newCommentText");
    const content = textarea.value.trim();
    if (!content) return;

    try {
        const res = await fetch(`${API_BASE}/api/comments`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "token": currentToken },
            body: JSON.stringify({ content }),
        });
        if (!res.ok) throw new Error("Error");
        textarea.value = "";
        const currentSort = document.querySelector(".fb-filter-btn.active").dataset.sort;
        loadComments(currentSort);
    } catch (e) {
        alert("Error al publicar comentario");
    }
});

$("cancelComment").addEventListener("click", () => {
    $("newCommentText").value = "";
});

document.querySelectorAll(".fb-filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".fb-filter-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        loadComments(btn.dataset.sort);
    });
});

loadComments("recent");
