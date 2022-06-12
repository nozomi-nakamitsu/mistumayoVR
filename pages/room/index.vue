<template>
  <div v-if="rooms" class="list-room-container">
    <h1>ROOM</h1>
    <div class="list" v-for="(room, key) in rooms" :key="key">
      <div>{{ room.name }}</div>
      <div>{{ room.dateTime }}</div>
      <div class="copy" @click="copyUrl(room.name)">copy</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "@nuxtjs/composition-api";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

export default defineComponent({
  name: "ListRoomPage",
  setup() {
    const rooms = ref([]);
    const roomPath = ref();

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

      const querySnapshot = await getDocs(collection(db, "room"));
      querySnapshot.forEach((doc) => {
        // TODO:日付のフォーマットを変換したい

        rooms.value = [...rooms.value, doc.data()];
      });
    });

    const copyUrl = async (roomName) => {
      roomPath.value = createRoomPath(roomName);
      await navigator.clipboard.writeText(roomPath.value);
    };

    const createRoomPath = (roomName) => {
      return process.env.NODE_ENV === "development"
        ? `${process.env.LOCAL_URL}/room/room_video/${roomName}`
        : `${process.env.APP_URL}/room/room_video/${roomName}`;
    };

    return {
      rooms,
      copyUrl,
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

  > .list > .copy {
    display: inline-block;
    outline: 0;
    border: 0;
    cursor: pointer;
    color: #fff;
    font-weight: 500;
    border-radius: 4px;
    font-size: 14px;
    height: 30px;
    padding: 0px 15px;
    text-shadow: rgb(0 0 0 / 25%) 0px 3px 8px;
    background: linear-gradient(
      92.88deg,
      rgb(69, 94, 181) 9.16%,
      rgb(86, 67, 204) 43.89%,
      rgb(103, 63, 215) 64.72%
    );
    transition: all 0.5s ease 0s;
    &:hover {
      box-shadow: rgb(80 63 205 / 50%) 0px 1px 40px;
      transition: all 0.1s ease 0s;
    }
  }
}
</style>
