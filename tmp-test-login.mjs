// Script temporal: verifica el flujo de login end-to-end. Se elimina tras usarlo.
const BASE = 'http://localhost:3000';

const jar = new Map();
function cookieHeader() {
    return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join('; ');
}
function guardarCookies(res) {
    for (const sc of res.headers.getSetCookie?.() ?? []) {
        const [par] = sc.split(';');
        const i = par.indexOf('=');
        jar.set(par.slice(0, i).trim(), par.slice(i + 1).trim());
    }
}
async function req(path, init = {}) {
    const res = await fetch(BASE + path, {
        ...init,
        redirect: 'manual',
        headers: { ...(init.headers ?? {}), cookie: cookieHeader() },
    });
    guardarCookies(res);
    return res;
}

// 1. Sin sesión, /grid_productos debe rebotar al login
let res = await req('/grid_productos');
console.log('1) GET /grid_productos sin sesion ->', res.status, res.headers.get('location'));

// 2. Token CSRF
res = await req('/api/auth/csrf');
const { csrfToken } = await res.json();
console.log('2) csrfToken obtenido ->', Boolean(csrfToken));

// 3. Credenciales incorrectas
res = await req('/api/auth/callback/credentials', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
        csrfToken,
        email: 'emendezacatz67@gmail.com',
        password: 'contrasena-mala',
        json: 'true',
    }),
});
console.log('3) login con password incorrecta ->', res.status, (await res.text()).slice(0, 120));

// 4. Credenciales correctas
res = await req('/api/auth/csrf');
const { csrfToken: csrf2 } = await res.json();
res = await req('/api/auth/callback/credentials', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
        csrfToken: csrf2,
        email: 'emendezacatz67@gmail.com',
        password: 'eze.men.mar.\u00f1%',
        json: 'true',
    }),
});
console.log('4) login correcto ->', res.status, (await res.text()).slice(0, 200));

// 5. Sesión activa
res = await req('/api/auth/session');
console.log('5) GET /api/auth/session ->', res.status, await res.text());

// 6. Acceso a /grid_productos con sesión
res = await req('/grid_productos');
const html = await res.text();
console.log('6) GET /grid_productos con sesion ->', res.status, res.headers.get('location') ?? '(sin redirect)');
console.log('   contiene el correo del admin:', html.includes('emendezacatz67@gmail.com'));
console.log('   contiene "Comparador"/catalogo:', html.includes('Paracetamol'));

// 7. Ruta hija protegida
res = await req('/grid_productos/carrito');
console.log('7) GET /grid_productos/carrito con sesion ->', res.status, res.headers.get('location') ?? '(sin redirect)');

// 8. /login con sesion debe redirigir al catalogo
res = await req('/login');
console.log('8) GET /login con sesion ->', res.status, res.headers.get('location') ?? '(sin redirect)');
