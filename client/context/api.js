let csrfToken = null;

let refreshPromise = null;

function setCsrfToken(token) {
    csrfToken = token;
}

function needCsrf(method) {
    return ['PATCH', 'PUT', 'DELETE', 'POST'].includes((method || "GET").toUpperCase());
}

export async function fetchCsrfToken () {
    const res = await fetch('/api/csrf-token', {credentials: 'include'});

    if(!res.ok) {
        throw new Error('failed to fetch CSRF Token');
    }

    const data = await res.json();

    if(!data?.csrfToken) {
        throw new Error("missing CSRF Token from server");
    }

    setCsrfToken(data.csrfToken);
    return data.csrfToken;
}

function refreshCsrfToken() {
    if(!refreshPromise) {
        refreshPromise = fetchCsrfToken().finally(() => {
            refreshPromise = null
        })
    }
    return refreshPromise;
}

function doFetch(path, options = {}) {
    const headers = new Headers(options.headers || {});

    if(options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
        headers.set("Content-Type", 'application/json');
    }

    if(needCsrf(options.method) && csrfToken) {
        headers.set("X-CSRF-Token", csrfToken);
    }

    return fetch(path, {
        ...options,
        headers,
        credentials: 'include'
    });
}

export async function apiFetch(path, onUnAuthorized, options={}) {
    let res = await doFetch(path, options);
    
    if(res.status === 403 && needCsrf(options.method)) {
        await refreshCsrfToken();
        res = await doFetch(path, options);
        return res;
    }

    if(res.status === 401 && typeof onUnAuthorized === 'function') {
        onUnAuthorized();
    }

    return res;
}