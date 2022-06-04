<template>
  <div class="create-room-container">
    <h1>CREATE ROOM</h1>
  </div>
</template>

<script>
import { defineComponent } from "@nuxtjs/composition-api";
export default defineComponent({
  name: "CreateRoomPage",
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
