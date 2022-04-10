<script>
  import { navigate } from "svelte-routing";
  import { auth, signInWithPopup, provider, GoogleAuthProvider } from "../firebase";

  const processAuth = async () => {
    try {
      signInWithPopup(auth, provider)
        .then((result) => {
          navigate('/tasks', {replace: true});
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          const email = error.email;
        });
    } catch (error) {
      console.log(error);
    }
  };
</script>

<div>
  <h1>Login with Google</h1>
  <button type="submit" on:click={processAuth}>Login with Google</button>
</div>
