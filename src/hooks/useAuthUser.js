import { onMount } from "svelte";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { isLogged } from "../store/isLogged";
import { getPath } from "../store/getPath";
import { navigate } from "svelte-routing";

export const useAuthUser = () => {
  // Get the current pathname ->
  let pathname = "/";

  onMount(() => {
    // Get the current pathname ->
    pathname = window.location.pathname;
    console.log(pathname);
    onAuthStateChanged(auth, (user) => {
      let userLogged = user == null ? false : true;
      // If user is logged in, redirect to tasks ->
      if (!userLogged) {
        navigate("/login");
        isLogged.set(false);
      } else {
        isLogged.set(true);
        if (pathname === "/login") {
          navigate("/tasks");
        }
      }
    });
  });
};
