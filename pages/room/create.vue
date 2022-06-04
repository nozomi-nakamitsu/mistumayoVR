<template>
  <div class="create-room-container">
    <h1>CREATE ROOM</h1>
    <form>
      <input type="text" v-model="name" />
      <input type="text" v-model="day" />
      <button @click="createRoom">ROOMを作成</button>
    </form>
  </div>
</template>

<script>
import { defineComponent, ref } from "@nuxtjs/composition-api";
export default defineComponent({
  name: "CreateRoomPage",
  setup() {
    const name = ref(null);
    const day = ref(null);
    const createRoom = () => {
      // TODO 受け取ったパラメータをfirebase storeに保存する
      console.log(name.value, day.value);
    };
    return {
      createRoom,
      name,
      day,
    };
  },
});
</script>

<style lang="scss">
.create-room-container {
  background: #fafafa;
  margin: 15em auto;
  padding: 4em;
  max-width: 370px;
}
</style>
