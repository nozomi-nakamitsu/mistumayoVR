<template>
  <div class="footer-container">
    <div class="container -w80">
      <button
        class="video-button"
        :class="{ '-isActive': isMute }"
        @click="onClick('mute')"
      >
        <div>
          <AppIcon
            :icon="isMute ? faMicrophoneSlash : faMicrophone"
            :color="isMute ? 'white' : 'gray'"
          ></AppIcon>
        </div>
      </button>
      <!-- <button
        class="video-button"
        :class="[{ '-isActive': !isVideoOn }]"
        @click="onClick('video')"
        :disabled="isScreenSharing"
      >
        <div>
          <AppIcon
            :icon="isVideoOn ? faVideo : faVideoSlash"
            :color="isVideoOn ? 'gray' : 'white'"
          ></AppIcon>
        </div>
      </button> -->
      <button
        class="video-button"
        :class="{ '-isActive': !isScreenSharing }"
        @click="onClick('screenSharing')"
      >
        <div class="icon">
          <img v-if="isScreenSharing" src="@/assets/images/screen-share.svg" />
          <img v-else src="@/assets/images/stop-screen-share.svg" />
        </div>
      </button>
      <button class="video-button -leave" @click="$emit('leave')">
        <div>
          <AppIcon :icon="faPhone" color="white" class="phone"></AppIcon>
        </div>
      </button>
    </div>
    <div class="container -w20">
      <button class="video-button" @click="onClick('users')">
        <div>
          <AppIcon :icon="faUsers" color="gray"></AppIcon>
        </div>
      </button>
      <button class="video-button" @click="onClick('comment')">
        <div>
          <AppIcon :icon="faMessage" color="gray"></AppIcon>
        </div>
      </button>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, watch } from "@nuxtjs/composition-api";
import AppIcon from "@/components/AppIcon.vue";
import {
  faMicrophone,
  faMicrophoneSlash,
  faVideo,
  faVideoSlash,
  faLaptop,
  faLaptopSlash,
  faPhone,
  faMessage,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
export default defineComponent({
  props: {
    switchScreeSharing: {
      type: Boolean,
    },
  },
  components: AppIcon,
  emits: ["leave", "mute", "video", "screen-sharing", "comment"],
  setup(props, { emit }) {
    watch(
      () => props.switchScreeSharing,
      () => {
        if (props.switchScreeSharing) {
          isScreenSharing.value = !isScreenSharing.value;
        }
      }
    );
    const isMute = ref(false);
    const isScreenSharing = ref(false);
    const isVideoOn = ref(false);
    const isComment = ref(false);
    const isUsers = ref(false);

    const onClick = (type) => {
      if (type === "mute") {
        isMute.value = !isMute.value;
        emit("mute", isMute);
      }
      if (type === "screenSharing") {
        isScreenSharing.value = !isScreenSharing.value;
        isVideoOn.value = false;
        emit("screen-sharing", isScreenSharing);
      }
      if (type === "video") {
        isVideoOn.value = !isVideoOn.value;
        emit("video", isVideoOn);
      }
      if (type === "comment") {
        isComment.value = !isComment.value;
        emit("comment", isComment);
      }
      if (type === "users") {
        isUsers.value = !isUsers.value;
        emit("users", isUsers);
      }
    };
    return {
      faMicrophone,
      faMicrophoneSlash,
      isMute,
      onClick,
      isScreenSharing,
      isVideoOn,
      faVideo,
      faVideoSlash,
      faLaptop,
      faPhone,
      faLaptopSlash,
      isComment,
      faMessage,
      faUsers,
    };
  },
});
</script>
