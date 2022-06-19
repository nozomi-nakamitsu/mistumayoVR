<template>
  <div class="comment-container">
    <div class="header">
      <p class="title">ユーザー</p>
      <div class="close" @click="$emit('close')">X</div>
    </div>
    <div class="users" v-if="users.length">
      <div v-for="(user, index) in users" :key="index" class="items">
        <div class="user">
          <div class="image">
            <img :src="user.icon" class="img" />
          </div>
          <p>{{ user.name }}</p>
          <button class="video-button -isActive button" disabled>
            <div>
              <AppIcon :icon="faMicrophoneSlash" color="white"></AppIcon>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { defineComponent, ref } from "@nuxtjs/composition-api";
import AppIcon from "@/components/AppIcon.vue";
import { faMicrophoneSlash } from "@fortawesome/free-solid-svg-icons";
export default defineComponent({
  props: {
    users: {
      type: Array,
      required: true,
    },
  },
  emits: ["close", "submit"],
  components: { AppIcon },
  setup(_, { emit }) {
    return { faMicrophoneSlash };
  },
});
</script>
