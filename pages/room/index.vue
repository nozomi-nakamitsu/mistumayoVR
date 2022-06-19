<template>
  <div v-if="rooms" class="list-room-container">
    <v-alert v-if="isAlertVisible" color="green" type="success"
      >URLをコピーしました</v-alert
    >
    <div class="room">
      <div class="title">ROOM</div>
      <div class="list font" @click="$router.push('/room/create')">
        Create Room
      </div>
      <div class="list" v-for="(room, key) in rooms" :key="key">
        <div class="name" @click="$router.push(`room/room_video/${room.name}`)">
          {{ room.name }}
        </div>
        <div class="date">
          {{
            room.dateTime
              ? dayjs(room.dateTime).format("YYYY-MM-DD HH:mm:ss")
              : ""
          }}
        </div>
        <div class="copy" @click="copyUrl(room.name)">copy</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  ref,
  useRouter,
  watchEffect,
} from "@nuxtjs/composition-api";
import dayjs from "dayjs";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";

export default defineComponent({
  name: "ListRoomPage",
  setup() {
    const router = useRouter();
    const rooms = ref([]);
    const roomPath = ref();
    const isAlertVisible = ref(false);
    const dialog = ref(false);

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
      const querySnapshot = await getDocs(
        query(collection(db, "room"), orderBy("dateTime", "desc"))
      );
      querySnapshot.forEach((doc) => {
        rooms.value = [...rooms.value, doc.data()];
      });
    });

    const copyUrl = async (roomName) => {
      roomPath.value = createRoomPath(roomName);
      await navigator.clipboard.writeText(roomPath.value);
      isAlertVisible.value = true;
    };

    const createRoomPath = (roomName) => {
      // TODO 本当はroutes.tsで定数管理したパスを使いたいのにファイルが呼び出せないのでべた書きしてる
      return process.env.NODE_ENV === "development"
        ? `${process.env.LOCAL_URL}/room/room_video/${roomName}`
        : `${process.env.APP_URL}/room/room_video/${roomName}`;
    };

    // NOTE: アラート非表示のタイミング
    watchEffect(() => {
      if (isAlertVisible.value) {
        setTimeout(() => {
          isAlertVisible.value = false;
        }, 5000);
      }
    });

    return {
      rooms,
      copyUrl,
      isAlertVisible,
      dialog,
      dayjs,
    };
  },
});
</script>

<style lang="scss">
.list-room-container {
  max-width: 720px;
  position: relative;
  width: 100%;
  height: 100vh;
  margin: 100px auto;

  > .room > .title {
    font-size: 24px;
    margin: 0 0 10px 0;
  }

  > .room > .list {
    display: grid;
    grid-template-columns: 350px repeat(2, 1fr);
    margin: 0 0 15px 0;
    align-items: center;
    padding: 28px;
    background-color: rgba(5, 5, 41, 0.03);
    border-radius: 24px;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    color: #050529;
    font-size: 16px;
    line-height: 22px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  > .room > .font {
    cursor: pointer;
    color: #e8374a;
    &:hover {
      opacity: 75%;
    }
  }

  > .room > .list > .name {
    cursor: pointer;

    &:hover {
      color: gray;
    }
  }

  > .room > .list > .date {
    margin-left: 50px;
  }

  > .room > .list > .copy {
    display: inline-block;
    outline: 0;
    border: 0;
    cursor: pointer;
    color: #fff;
    margin-left: auto;
    font-weight: 500;
    border-radius: 4px;
    font-size: 14px;
    height: 30px;
    padding: 0px 15px;
    text-shadow: rgb(0 0 0 / 25%) 0px 3px 8px;
    background: #e8374a;
    transition: all 0.5s ease 0s;
    &:hover {
      box-shadow: rgb(255, 0, 0, 0.25) 0px 1px 40px;
      transition: all 0.1s ease 0s;
    }
  }
}
</style>
