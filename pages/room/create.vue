<template>
  <div class="create-room-container">
    <h1>CREATE ROOM</h1>
    <form class="form" @submit.prevent="createRoom">
      <input type="text" v-model="name" class="input" />
      <input type="datetime-local" v-model="date" />
      <button type="submit" class="button">ROOMを作成</button>
    </form>
  </div>
</template>

<script>
import { defineComponent, ref, useRouter } from "@nuxtjs/composition-api";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { ROOM_ROUTES } from "@/config/routes.ts";

export default defineComponent({
  name: "CreateRoomPage",
  setup() {
    const router = useRouter();
    const name = ref(null);
    const date = ref(null);
    // TODO: 共通化する
    const firebaseConfig = {
      apiKey: process.env.API_KEY,
      authDomain: process.env.AUTH_DOMAIN,
      projectId: process.env.PROJECT_ID,
      storageBucket: process.env.STORAGE_BUCKET,
      messagingSenderId: process.env.MESSAGING_SENDER_ID,
      appId: process.env.APP_ID,
      measurementId: process.env.MEASUREMENT_ID,
    };
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const createRoom = async () => {
      try {
        const docRef = await addDoc(collection(db, "room"), {
          name: name.value,
          dateTime: date.value,
        });
        router.push(ROOM_ROUTES.index.path);
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    };

    return {
      createRoom,
      name,
      date,
    };
  },
});
</script>

<style lang="scss">
.create-room-container {
  background: #fafafa;
  margin: 4em auto;
  padding: 6em;
  max-width: 720px;

  > .form > .input {
    border: 1px solid gray;
    border-radius: 5px;
  }

  > .form > .button {
    background: #f16272;
    padding: 5px;
    font-size: 18px;
  }
}
</style>
