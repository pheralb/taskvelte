<p align="center">
<img src="https://i.ibb.co/F011pHV/banner.png" width="100%"/>
</p>

**taskvelte** (beta) is a simple CRUD application created with [Svelte](https://svelte.dev/), [Firebase v9](https://firebase.google.com/) & [Tailwind CSS](https://tailwindcss.com/).

## 📦 Feautures

- [Svelte](https://svelte.dev/).
- [Firebase](https://firebase.google.com/).
- [Tailwind CSS with PostCSS](https://tailwindcss.com/).
- [@rollup/plugin-replace](https://github.com/rollup/plugins).
- [svelte-routing](https://github.com/EmilTholin/svelte-routing).
- [dotenv](https://github.com/motdotla/dotenv).


## 🚀 Get Started

You need:
- [Git](https://git-scm.com/downloads)
- [Nodejs 16+](https://nodejs.org/en/download/)
- [Firebase Database](https://firebase.google.com/)

Clone the repository & install dependencies:

```bash
git@github.com:pheralb/taskvelte.git
cd taskvelte
npm install
```

*📢 If you're using [Visual Studio Code](https://code.visualstudio.com/) we recommend installing the official extension [Svelte for VS Code](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode).*

## ⚙️ [Firebase](https://firebase.google.com/) Configuration

1. [Create](https://console.firebase.google.com/u/0/) a database with Firebase. Then, in the project configuration click on "Add app" -> "</>" and copy the keys in a .env file:

```bash
APP_ENV_FIREBASE_API_KEY=
APP_ENV_FIREBASE_AUTH_DOMAIN=
APP_ENV_FIREBASE_PROJECT_ID=
APP_ENV_FIREBASE_STORAGE_BUCKET=
APP_ENV_FIREBASE_MESSAGING_SENDER_ID=
APP_ENV_FIREBASE_APP_ID=
```

2. Enable in the Authentication (/authentication/providers) section the possibility of logging in with Google.

3. Run the project with [Rollup](https://rollupjs.org):

```bash
npm run dev
```

and open [localhost:8080](http://localhost:8080) 🎉.
