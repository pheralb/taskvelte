import { writable } from "svelte/store";
export const getPath = writable(window.location.pathname);