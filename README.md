# NovaPay Frontend

NovaPay Frontend es la interfaz web del proyecto académico NovaPay, una herramienta de gestión y revisión de transacciones orientada a perfiles de análisis operativo.

Este repositorio forma parte de un reto académico desarrollado en The Bridge School Talent Accelerator. El reto fue propuesto a la escuela por la empresa Cívica y se ha trabajado en colaboración con la promoción Marzo 2026 de Data Science y Ciberseguridad.

Este proyecto no está destinado a ser clonado, reutilizado ni desplegado como producto independiente. Su finalidad es académica, demostrativa y ligada al contexto del reto.

## Deploy

- Frontend: https://front-end-challenge-the-bridge.vercel.app/
- API backend: https://back-end-challenge-the-bridge.onrender.com/

La API desplegada permite peticiones únicamente desde el despliegue del frontend.

## Objetivo

El frontend permite a analistas autenticados revisar transacciones pendientes, consultar detalle técnico de transacciones, acceder al perfil de clientes y ejecutar acciones de revisión como aprobar, marcar fraude o bloquear clientes.

## Funcionalidades principales

- Login y persistencia de sesión de analistas.
- Dashboard principal con resumen de transacciones y ultimas transacciones pendientes.
- Vista de transacciones pendientes con filtros, paginacion y panel de previsualizacion.
- Vista avanzada de detalle de transacción con explicabilidad del modelo.
- Vista de clientes con búsqueda, estado y paginación.
- Vista de detalle de cliente con ultimas transacciones y accion de bloqueo.
- Confirmaciones de acciones críticas mediante modales.
- Interfaz responsive con foco en desktop y mobile.

## Tecnologias core

- React 19: construcción de la interfaz.
- Vite 8: entorno de desarrollo y build.
- React Router DOM 7: rutas públicas, privadas y navegación.
- Axios: cliente HTTP para comunicación con el backend.
- CSS Modules: estilos encapsulados por componente.

## Librerias importantes

- Framer Motion: animaciones y transiciones visuales.
- Lucide React: iconografía de la interfaz.
- React Spinners: estados de carga.
- SweetAlert2: confirmaciones y mensajes de acciones críticas.
- ESLint: control básico de calidad del código.

## Scripts disponibles

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Variables de entorno

El proyecto espera una URL base para consumir el backend:

```bash
VITE_API_URL=https://back-end-challenge-the-bridge.onrender.com/api
```

Para desarrollo local puede apuntar a una API local compatible:

```bash
VITE_API_URL=http://localhost:4000/api
```

## Estructura general

```text
src/
  components/
    Auth/
    Clients/
    Dashboard/
    LoadingSpinner/
    Login/
    Motion/
    PageNavigation/
    Transactions/
  context/
  services/
  utils/
```

## Autores

- Marco Guevara
- Antonio Soler

## Nota de licencia

Este proyecto declara licencia ISC en `package.json`. Su uso queda contextualizado como entrega académica del reto NovaPay en The Bridge School Talent Accelerator.
