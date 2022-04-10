<script>
    // 🔶 Svelte:
    import { onDestroy } from "svelte";
    
    // 📦 Firebase config:
    import { addDoc, collection, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";
    import { db } from "../firebase";

    // 🖌️ Import hook:
    import { useAuthUser } from "../hooks/useAuthUser";
    useAuthUser();
    
    // 🔨 Task object:
    let task = {
      title: "",
      description: "",
    };
  
    let tasks = [];
    let editStatus = false;
    let currentId = "";
  
    // 🔨 Add new task:
    const saveTask = async () => {
      try {
        await addDoc(collection(db, "tasks"), task);
        console.log("task saved!");
      } catch (error) {
        console.log(error);
      }
    };
  
    const handleSubmit = async () => {
      try {
        if (editStatus) {
          updateTask();
        } else {
          saveTask();
        }
      } catch (error) {
        console.log(error);
      }
  
      task = {
        title: "",
        description: "",
      };
  
      editStatus = false;
      currentId = "";
    };
  
    // 🔨 Get all tasks:
    const unsub = onSnapshot(
      collection(db, "tasks"),
      (querySnapshot) => {
        tasks = querySnapshot.docs.map((doc) => {
          return { ...doc.data(), id: doc.id };
        });
      },
      (err) => {
        console.log(err);
      }
    );
  
    // 🔨 Remove task:
    const deleteTask = async (id) => {
      try {
        await deleteDoc(doc(db, "tasks", id));
        console.log("task deleted!");
      } catch (error) {
        console.log(error);
      }
    };
  
    // 🔨 Edit task:
    const editTask = (currentTask) => {
      task.title = currentTask.title;
      task.description = currentTask.description;
      currentId = currentTask.id;
      editStatus = true;
    };
  
    // 🔨 Update task:
    const updateTask = async () => {
      try {
        await updateDoc(doc(db, "tasks", currentId), task);
      } catch (error) {
        console.log(error);
      }
    };
  
    onDestroy(unsub);
  </script>
  
  <main>
    <form on:submit|preventDefault={handleSubmit}>
      <label for="title">Title:</label>
      <input bind:value={task.title} type="text" placeholder="Write here..." />
  
      <label for="description">Description:</label>
      <textarea
        id="description"
        bind:value={task.description}
        rows="3"
        placeholder="Write a description"
      />
  
      <button>Save</button>
    </form>
  
    {#each tasks as task}
      <div>
        <h3>{task.title}</h3>
        <p>{task.description}</p>
        <button on:click={editTask(task)}>edit</button>
        <button on:click={deleteTask(task.id)}>delete</button>
      </div>
    {/each}
  </main>