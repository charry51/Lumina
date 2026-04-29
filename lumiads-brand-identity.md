# 💎 Manual de Identidad Visual: LumiAds (v1.1)

**IMPORTANTE PARA EL DESARROLLADOR / AGENTE AI:** Este documento contiene las especificaciones exclusivas de **apariencia, diseño y CSS**. **ESTÁ ESTRICTAMENTE PROHIBIDO** modificar la lógica de backend, base de datos, sistema de prioridades de planes o flujos de trabajo existentes. Solo se debe actualizar la capa visual (UI/UX).

## 1. Identidad de Marca
* **Nombre de la plataforma:** LumiAds (Sustituir de forma global toda mención visible a "Lumina" por "LumiAds").
* **Logotipo:** Reemplazar los logos actuales por el isotipo de la "A" con partículas. **Nota Importante:** El color Naranja se mantiene ÚNICAMENTE en el logotipo/isotipo.
* **Atributos Visuales:** Fondo oscuro profundo, gradientes tecnológicos (Cian/Violeta) para la UI, microdetalles luminosos, tipografía geométrica.

## 2. Paleta de Colores (Sistema Cyber-Luxury)
Actualizar `tailwind.config.js` y variables CSS con los siguientes tokens. El naranja ha sido eliminado de la paleta general de la interfaz.

**Fondos y Superficies (Neutrales):**
* `bg-deep` (Deep Night - Fondo principal): `#04060F`
* `bg-night` (Night Blue - Fondo secundario): `#0A0F1F`
* `bg-card` (Card Surface - Tarjetas/Paneles): `#0E1426`
* `bg-card-2` (Variante tarjetas): `#131A2E`

**Colores de Marca para la Interfaz (UI Accents):**
* `lumi-violet`: `#7C3CFF` (Principal)
* `lumi-magenta`: `#C94BFF`
* `lumi-blue`: `#2BC8FF`
* **NO usar naranja en componentes de UI (botones, barras, iconos de estado).**

**Color Exclusivo para Logotipo:**
* `lumi-orange`: `#FF8A4C` (Solo permitido en el Logo e Isotipo).

**Textos y Líneas:**
* `text-main` (Pure Light): `#F4F6FB`
* `text-dim`: `#A6AFC4`
* `text-mute`: `#6B7590`
* `line`: `rgba(255, 255, 255, 0.08)`
* `line-strong`: `rgba(255, 255, 255, 0.16)`

**Gradientes:**
* `grad-ui` (Para botones, bordes y acentos de interfaz): `linear-gradient(95deg, #7C3CFF 0%, #C94BFF 50%, #2BC8FF 100%)`
* `grad-logo` (Solo para el logotipo): `linear-gradient(95deg, #7C3CFF 0%, #C94BFF 38%, #2BC8FF 70%, #FF8A4C 100%)`

## 3. Tipografía
Implementar mediante `next/font` de Google Fonts:
* **Títulos (Display):** `Sora` (Pesos: 400, 600, 700, 800). Letter-spacing: `-0.02em` a `-0.03em`.
* **Cuerpo (Base):** `Manrope` (Pesos: 400, 500, 600, 700).
* **Datos Técnicos (Mono):** `JetBrains Mono` (Pesos: 400, 500, 600). Usar para IDs, métricas, código y etiquetas superiores (eyebrows).

## 4. Tokens de Diseño y Estilo UI
**Border Radius:**
* `radius-sm`: `10px`
* `radius-md`: `16px`
* `radius-lg`: `22px`

**Sombras y Efectos (Glassmorphism):**
* `shadow-glow`: `0 0 60px rgba(124, 60, 255, 0.2), 0 0 100px rgba(43, 200, 255, 0.1)`
* `shadow-soft`: `0 20px 60px -20px rgba(0, 0, 0, 0.6)`
* Aplicar `backdrop-filter: blur(14px)` en navegaciones y paneles flotantes.

## 5. Componentes de Interfaz
* **Botones Primarios:** Fondo `grad-ui` (Violeta a Azul), texto `#FFFFFF`. **Sin rastro de naranja.**
* **Botones Secundarios (Ghost):** Fondo `rgba(255,255,255,0.04)`, borde `1px solid var(--line-strong)`, texto `text-main`.
* **Cards / Tarjetas:** Fondo `bg-card`, borde `1px solid var(--line)`. Radio de `16px` o `22px`.
* **Iconografía:** Usar la librería `lucide-react`. Grosor de línea fijo en `1.8px`.

## 6. Instrucción Final de Ejecución
1. Aplica estos estilos en `globals.css` y `tailwind.config.ts`.
2. Refactoriza `Navbar`, `Sidebar`, `Botones` y `Cards` usando los tokens indicados.
3. El color naranja (`#FF8A4C`) solo debe aparecer en el archivo de imagen o componente del Logo.
4. **NO modifiques** la lógica de negocio, bases de datos o el Player.
