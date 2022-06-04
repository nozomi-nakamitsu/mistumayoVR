<template>
  <div v-if="room" class="list-room-container">
    <h1>ROOM</h1>
    <div class="list">
      <div>{{ room.name }}</div>
      <div>{{ room.dateTime }}</div>
    </div>
  </div>
  <div v-else>
    <h1>作成したルームが見つからないようです...😭</h1>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "@nuxtjs/composition-api";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

export default defineComponent({
  name: "ListRoomPage",
  setup() {
    const room = ref(null);
    onMounted(async () => {
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
      const docRef = doc(db, "room", "YP3wvpNGeUe4ZKLeIfgJ");

      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        room.value = docSnap.data();
        console.log(room.value.dateTime.toLocaleString());
      }
    });

    return {
      room,
    };
  },
});
</script>

<style lang="scss">
.list-room-container {
  background: #fafafa;
  margin: 4em auto;
  padding: 6em;
  max-width: 720px;

  > .list {
    display: flex;
    gap: 10px 20px;
  }
}
</style>
