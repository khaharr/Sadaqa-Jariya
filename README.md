@@ -1,2 +1,180 @@
# Sadaqa-Jariya
site qui permet d'acceder a toute les cagnotte en france
# 🌙 Projet : Répertoire de Cagnottes Islamiques

Un site web moderne listant et centralisant des **cagnottes islamiques** (aide, funérailles, construction de mosquée, etc.) avec modération, recherche et animations fluides.

---

## 🧩 Stack technique

### 🔹 **Frontend**

* **Framework :** Vue.js 3 (ou Nuxt 3 pour le SEO et le SSR)
* **Build Tool :** Vite ⚡ (rapide et moderne)
* **Style :** Tailwind CSS + Framer Motion (via Motion One pour les animations Vue)
* **UI Components :** shadcn-vue ou Vuetify (selon préférence)
* **Routing :** Vue Router

### 🔹 **Backend / Base de données**

* **Supabase (PostgreSQL)**
  Fournit :

  * Base de données relationnelle
  * Authentification (admin + utilisateur)
  * API REST auto-générée
  * Stockage d’images / fichiers (preuves, visuels)
  * Realtime API (pour mises à jour instantanées)

### 🔹 **Hébergement**

* **Frontend :** [Vercel](https://vercel.com) ou [Netlify](https://www.netlify.com)
* **Backend / DB :** [Supabase](https://supabase.com)
* **Nom de domaine :** OVH / Namecheap (~10 €/an)

💰 **Coût total au lancement : ~0 € / mois**  (grâce aux plans gratuits Supabase + Vercel)

---

## ⚙️ Fonctionnalités principales

* 🔍 Liste filtrable et recherchable de cagnottes
* 🧾 Page de détail (description, lien externe, tags, preuve)
* 📨 Formulaire de soumission (avec validation & modération)
* 🛡️ Système d’authentification Supabase (admin / utilisateur)
* ✅ Workflow de validation (cagnotte en attente → approuvée)
* 💬 Système de signalement (pour éviter les fraudes)
* 📸 Upload d’images via Supabase Storage
* 🌍 Multilingue (Français / Arabe / Anglais)
* 🕊️ Animations douces et transitions (Motion One + Tailwind)

---

## 🗄️ Structure du projet

```
project/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── CagnotteCard.vue
│   │   ├── CagnotteForm.vue
│   │   └── Navbar.vue
│   ├── pages/
│   │   ├── index.vue
│   │   ├── cagnottes/[id].vue
│   │   └── admin.vue
│   ├── composables/
│   │   └── useSupabase.js
│   ├── App.vue
│   └── main.js
├── public/
├── supabase/
│   └── schema.sql
├── package.json
└── README.md
```

---

## 🧠 Exemple de table `cagnottes`

```sql
CREATE TABLE cagnottes (
  id bigint generated always as identity primary key,
  titre text not null,
  description text,
  lien text not null,
  type text check (type in ('funérailles', 'mosquée', 'aide', 'autre')),
  region text,
  image_url text,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamp default now()
);
```

---

## 🔐 Authentification Supabase

* Authentification via email/password ou OAuth (Google, Facebook…)
* Rôles :

  * `admin` → peut approuver/supprimer des cagnottes
  * `user` → peut soumettre une cagnotte

---

## 💫 Animations & UX

* **Motion One** (lib anim compatible Vue 3)
* **Transitions Tailwind :** `transition-all`, `duration-300`, `ease-in-out`
* Animations d’apparition, hover, et transitions entre pages.

Exemple :

```vue
<motion.div
  v-motion="{ initial: { opacity: 0, y: 20 }, enter: { opacity: 1, y: 0 } }"
  class="p-4 bg-white rounded-2xl shadow-md hover:shadow-lg"
>
  <h2 class="text-xl font-semibold">{{ cagnotte.titre }}</h2>
</motion.div>
```

---

## 🚀 Lancement du projet

### 1️⃣ Cloner le dépôt

```bash
git clone https://github.com/votre-utilisateur/nom-du-projet.git
cd nom-du-projet
```

### 2️⃣ Installer les dépendances

```bash
npm install
```

### 3️⃣ Configurer Supabase

Crée un fichier `.env` avec :

```bash
VITE_SUPABASE_URL=https://votre-url.supabase.co
VITE_SUPABASE_KEY=votre_cle_publique
```

### 4️⃣ Lancer le serveur de dev

```bash
npm run dev
```

### 5️⃣ Déployer

* Lier ton repo GitHub à **Vercel** ou **Netlify**
* Variables d’environnement identiques à `.env`

---

## 🧱 Améliorations futures

* Pagination + recherche plein texte
* Notifications par email (via Supabase Functions)
* Dashboard admin complet
* Carte interactive des cagnottes (Leaflet / Mapbox)

---

## 📜 Licence

MIT — projet open-source à but non lucratif, destiné à faciliter la diffusion de cagnottes islamiques vérifiées.

---

### ✨ Auteur

Projet initial par [c k — conçu pour aider la communauté à centraliser les dons en toute transparence.
