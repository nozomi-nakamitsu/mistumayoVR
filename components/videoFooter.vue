<template>
  <div class="footer-container">
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
    <button
      class="video-button"
      :class="{ '-isActive': isVideoOn }"
      @click="onClick('video')"
    >
      <div>
        <AppIcon
          :icon="isVideoOn ? faVideoSlash : faVideo"
          :color="isVideoOn ? 'white' : 'gray'"
        ></AppIcon>
      </div>
    </button>
    <button
      class="video-button"
      :class="{ '-isActive': isScreenSharing }"
      @click="onClick('screenSharing')"
    >
      <div>
        <!-- TODO: 後でアイコンパスを修正する -->
        <AppIcon
          :icon="faLaptop"
          :color="isScreenSharing ? 'white' : 'gray'"
        ></AppIcon>
      </div>
    </button>
    <button class="video-button -leave" @click="$emit('leave')">
      <div>
        <AppIcon :icon="faPhone" color="white" class="phone"></AppIcon>
      </div>
    </button>
  </div>
</template>

<script>
import { defineComponent, ref } from "@nuxtjs/composition-api";
import AppIcon from "@/components/AppIcon.vue";
import {
  faMicrophone,
  faMicrophoneSlash,
  faVideo,
  faVideoSlash,
  faLaptop,
  faLaptopSlash,
  faPhone,
} from "@fortawesome/free-solid-svg-icons";
export default defineComponent({
  props: {},
  components: AppIcon,
  emits: ["leave", "mute", "video", "screen-sharing"],
  setup(_, { emit }) {
    const isMute = ref(false);
    const isScreenSharing = ref(false);
    const isVideoOn = ref(false);

    const onClick = (type) => {
      if (type === "mute") {
        isMute.value = !isMute.value;
        emit("mute", isMute);
      }
      if (type === "screenSharing") {
        isScreenSharing.value = !isScreenSharing.value;
        emit("screen-sharing", isScreenSharing);
      }
      if (type === "video") {
        isVideoOn.value = !isVideoOn.value;
        emit("video", isVideoOn);
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
    };
  },
});
</script>
