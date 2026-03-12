const eventForm = document.querySelector("#event-form");
const filtersForm = document.querySelector("#filters-form");
const analyticsForm = document.querySelector("#analytics-form");
const eventsList = document.querySelector("#events-list");
const eventTypes = document.querySelector("#event-types");
const dauValue = document.querySelector("#dau-value");
const rangeValue = document.querySelector("#range-value");
const feedback = document.querySelector("#feedback");

document.addEventListener("DOMContentLoaded", () => {
    seedAnalyticsRange();
    loadEvents();
    loadAnalytics();
});

eventForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(eventForm);
    const payload = {
        userId: formData.get("userId")?.toString().trim(),
        eventType: formData.get("eventType")?.toString().trim(),
        metadata: formData.get("metadata")?.toString().trim() || null,
        eventTime: toIsoString(formData.get("eventTime"))
    };

    try {
        await apiFetch("/api/events", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
        eventForm.reset();
        showFeedback("Событие сохранено.", "success");
        await loadEvents();
    } catch (error) {
        showFeedback(error.message, "error");
    }
});

filtersForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await loadEvents();
});

analyticsForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await loadAnalytics();
});

async function loadEvents() {
    const formData = new FormData(filtersForm);
    const params = new URLSearchParams({
        size: "12"
    });

    addParam(params, "userId", formData.get("userId"));
    addParam(params, "eventType", formData.get("eventType"));
    addParam(params, "from", toIsoString(formData.get("from")));
    addParam(params, "to", toIsoString(formData.get("to")));

    try {
        const response = await apiFetch(`/api/events?${params.toString()}`);
        renderEvents(response.content || []);
        if (!feedback.classList.contains("error")) {
            showFeedback(`Загружено событий: ${response.content?.length ?? 0}.`, "success");
        }
    } catch (error) {
        renderEvents([]);
        showFeedback(error.message, "error");
    }
}

async function loadAnalytics() {
    const formData = new FormData(analyticsForm);
    const from = toIsoString(formData.get("from"));
    const to = toIsoString(formData.get("to"));
    const params = new URLSearchParams();
    addParam(params, "from", from);
    addParam(params, "to", to);

    try {
        const [dauResponse, typesResponse] = await Promise.all([
            apiFetch(`/api/analytics/dau?${params.toString()}`),
            apiFetch(`/api/analytics/event-types?${params.toString()}`)
        ]);

        dauValue.textContent = dauResponse.dau;
        rangeValue.textContent = `${formatDate(dauResponse.from)} - ${formatDate(dauResponse.to)}`;
        renderEventTypes(typesResponse);
        showFeedback("Аналитика обновлена.", "success");
    } catch (error) {
        dauValue.textContent = "-";
        rangeValue.textContent = "-";
        renderEventTypes([]);
        showFeedback(error.message, "error");
    }
}

function renderEvents(items) {
    if (!items.length) {
        eventsList.innerHTML = "<div class=\"event-item\"><strong>Нет данных</strong><span class=\"event-meta\">Попробуй изменить фильтры или создать событие.</span></div>";
        return;
    }

    eventsList.innerHTML = items.map((item) => `
        <article class="event-item">
            <header>
                <strong>${escapeHtml(item.eventType)}</strong>
                <span class="event-meta">${escapeHtml(item.userId)}</span>
            </header>
            <span class="event-meta">${formatDate(item.eventTime)}</span>
            <pre>${escapeHtml(item.metadata || "metadata: null")}</pre>
        </article>
    `).join("");
}

function renderEventTypes(items) {
    if (!items.length) {
        eventTypes.innerHTML = "<div class=\"event-type-item\"><span>Нет агрегатов для выбранного периода.</span></div>";
        return;
    }

    eventTypes.innerHTML = items.map((item) => `
        <article class="event-type-item">
            <strong>${escapeHtml(item.eventType)}</strong>
            <span>${item.count}</span>
        </article>
    `).join("");
}

function addParam(params, key, value) {
    if (value) {
        params.set(key, value);
    }
}

function toIsoString(value) {
    if (!value) {
        return null;
    }
    return new Date(value).toISOString();
}

function seedAnalyticsRange() {
    const to = new Date();
    const from = new Date(to.getTime() - 24 * 60 * 60 * 1000);
    analyticsForm.elements.from.value = toLocalInputValue(from);
    analyticsForm.elements.to.value = toLocalInputValue(to);
}

function toLocalInputValue(date) {
    const shifted = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return shifted.toISOString().slice(0, 16);
}

function formatDate(value) {
    if (!value) {
        return "-";
    }
    return new Intl.DateTimeFormat("ru-RU", {
        dateStyle: "medium",
        timeStyle: "short"
    }).format(new Date(value));
}

function showFeedback(message, type) {
    feedback.textContent = message;
    feedback.className = `feedback visible ${type}`;
}

function escapeHtml(value) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll("\"", "&quot;")
        .replaceAll("'", "&#39;");
}

async function apiFetch(url, options = {}) {
    const response = await fetch(url, options);
    const isJson = response.headers.get("content-type")?.includes("application/json");
    const payload = isJson ? await response.json() : null;

    if (!response.ok) {
        throw new Error(payload?.message || `Request failed with status ${response.status}`);
    }
    return payload;
}
