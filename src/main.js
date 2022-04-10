// 🔶 Svelte ->
import App from './App.svelte';

// 🎨 Styles ->
import 'bootswatch/dist/lux/bootstrap.min.css';

const app = new App({
	target: document.body,
	props: {
		name: 'world'
	}
});

export default app;