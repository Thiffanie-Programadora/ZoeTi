# ZoeTi Personal Shopper — Plataforma Full-Stack de Importaciones

Sitio web público y sistema administrativo de gestión de pedidos para **ZoeTi personal shopper**, enfocado en importaciones internacionales desde **México, Colombia, Perú y Panamá hacia Costa Rica**.

## Identidad Visual & Diseño
- **Verde Menta Suave:** `#D1E8E2` / `#E5F3EF`
- **Vinotinto / Morado Oscuro Elegante:** `#4A2040` / `#68325B`
- **Fondo Limpio:** `#F7FCFA`
- **Tipografías:** *Cormorant Garamond* (Serif clásico para encabezados) y *Plus Jakarta Sans* (Sans-serif para lectura limpia).

---

## Arquitectura del Proyecto

```text
ZoeTi/
├── backend/                          # API REST en Node.js + Express + PostgreSQL
│   ├── database/
│   │   └── schema.sql                # Esquema relacional PostgreSQL (admins y orders)
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # Pool de conexiones PostgreSQL (pg)
│   │   ├── controllers/
│   │   │   ├── auth.controller.js    # Login JWT + validación bcrypt
│   │   │   └── orders.controller.js  # CRUD y cambio de estados de pedidos
│   │   ├── middlewares/
│   │   │   └── auth.middleware.js    # Protección de rutas privadas con JWT
│   │   ├── routes/
│   │   │   ├── auth.routes.js        # /api/auth/login, /api/auth/me
│   │   │   └── orders.routes.js      # /api/orders (público y admin)
│   │   ├── scripts/
│   │   │   └── seedAdmin.js          # Cifrado bcrypt y creación del Admin único
│   │   └── server.js                 # Punto de entrada Express
│   ├── .env.example                  # Variables de entorno de ejemplo
│   └── package.json
│
└── frontend/                         # Aplicación React + Vite + Tailwind CSS
    ├── public/
    │   └── zoeti-logo.jpg            # Logotipo oficial de ZoeTi
    ├── src/
    │   ├── assets/
    │   │   └── zoeti-logo.jpg
    │   ├── components/
    │   │   ├── boton.jsx             # Botones corporativos reutilizables
    │   │   ├── navbar.jsx            # Navegación sticky con acceso a WhatsApp y Admin
    │   │   ├── Hero.jsx              # Hero section + Formulario rápido de cotización
    │   │   ├── HowItWorks.jsx        # Sección "Cómo Funciona" en 3 pasos
    │   │   ├── galeria.jsx           # Rutas (MX, CO, PE, PA -> CR) + Rastreo por código
    │   │   ├── FaqSection.jsx        # Preguntas Frecuentes sobre pagos y envíos
    │   │   ├── WhatsAppFloatingButton.jsx # Botón flotante permanente de WhatsApp
    │   │   └── footer.jsx            # Pie de página corporativo
    │   ├── config/
    │   │   └── brand.js              # Configuración de WhatsApp, rutas y estados
    │   ├── pages/
    │   │   ├── AdminLogin.jsx        # Inicio de sesión privado con JWT
    │   │   └── AdminDashboard.jsx    # Panel de control y cambio de estados de pedidos
    │   ├── services/
    │   │   └── api.js                # Cliente HTTP hacia el Backend con fallback local
    │   ├── App.jsx
    │   └── main.jsx
    ├── tailwind.config.js            # Paleta oficial ZoeTi en Tailwind CSS
    └── package.json
```

---

## Puesta en Marcha

### 1. Base de Datos y Backend (`backend/`)
```powershell
cd backend
npm install
Copy-Item .env.example .env
# Ejecuta database/schema.sql en tu base de datos PostgreSQL (zoeti_db)
npm run seed:admin
npm run dev
```

### 2. Interfaz Web y Panel Admin (`frontend/`)
```powershell
cd frontend
npm run dev
```

### Credenciales por Defecto del Panel Administrativo
- **Correo:** `admin@zoeti.cr`
- **Contraseña:** `ZoeTiAdmin2026!`

