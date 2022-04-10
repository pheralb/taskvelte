<script>
  // 🔶 Svelte:
  import { Router, Link, Route } from "svelte-routing";

  // ✈️ Web pages:
  import Home from "./views/Home.svelte";
  import Tasks from "./views/tasks.svelte";
  import Login from "./views/login.svelte";

  // 🚀 Check if auth:
  import { useAuthUser } from "./hooks/useAuthUser";
  import { isLogged } from "./store/isLogged";
  useAuthUser();
  let isLoggedUser = false;
  isLogged.subscribe((data) => {
    isLoggedUser = data;
  });
</script>

<main>
  <Router>
    <!-- Nav links: -->
    <div class="navbar bg-base-100">
      <div class="flex-1">
        <Link to="/" class="btn btn-ghost">taskvelte</Link>
      </div>
      <div class="flex-none m-2">
        <ul class="menu menu-horizontal p-0">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/tasks">Tasks</Link></li>
          {#if !isLoggedUser}
            <li><Link to="/login">Login</Link></li>
          {/if}
        </ul>
      </div>
    </div>
    <!-- -->
    <Route path="/"><Home /></Route>
    <Route path="/tasks"><Tasks /></Route>
    <Route path="/login"><Login /></Route>
  </Router>
</main>

<style lang="postcss" global>
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
</style>
