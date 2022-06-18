<template>
  <div>
    <div class="prepare-container" :class="{ '-is-join': isJoin }">
      <div class="container">
        <div class="left" id="body" :class="{ '-no-member': !hasMember }">
          <video class="video" id="webcam-video" style="display: none"></video>
          <canvas id="landmarks" style="display: none"></canvas>
          <p v-if="isJoin" id="maximize-screen-user-name">あなた</p>
        </div>
        <div class="right" v-if="!isJoin">
          <p class="title">{{ room.name }}</p>
          　<button class="common-button" @click="$emit('click')">
            今すぐ参加する
          </button>
          <div class="avatar-select">
            　<button class="common-button -outline" @click="onSelect">
              アバターを選ぶ
            </button>
            <!-- <div class="items">
            <div class="item">
              　<button
                class="common-button"
                @click="$emit('select-avatar', 'A')"
              >
                A
              </button>
            </div>
            <div class="item">
              <button
                class="common-button"
                @click="$emit('select-avatar', 'B')"
              >
                B
              </button>
            </div>
            　
          </div> -->
          </div>
        </div>
        <div class="remote-streams" id="js-remote-streams">
          <div class="right" v-if="hasMember"></div>
        </div>
      </div>
      <VideoFooter
        v-if="isJoin"
        :switch-scree-sharing="switchScreeSharing"
        @leave="$emit('leave')"
        @mute="$emit('mute', $event)"
        @video="$emit('video', $event)"
        @screen-sharing="$emit('screen-sharing', $event)"
      >
      </VideoFooter>
    </div>
    <AvatarSelect @click="onClickSelect" v-if="isSelecting"></AvatarSelect>
  </div>
</template>

<script>
import { defineComponent, ref } from "@nuxtjs/composition-api";
import VideoFooter from "@/components/videoFooter";
import AvatarSelect from "@/components/AvatarSelect";

export default defineComponent({
  props: {
    isJoin: {
      type: Boolean,
      required: true,
    },
    hasMember: {
      type: Boolean,
      required: true,
    },
    switchScreeSharing: {
      type: Boolean,
    },
    room: {
      type: Object,
      required: true,
    },
  },
  emits: ["click", "select-avatar", "leave", "mute", "screen-sharing", "video"],
  components: [VideoFooter, AvatarSelect],
  setup(_, { emit }) {
    isSelecting;
    const isSelecting = ref(false);
    const onSelect = () => {
      isSelecting.value = true;
    };
    const onClickSelect = (event) => {
      isSelecting.value = false;
      emit("select-avatar", event);
    };
    return {
      isSelecting,
      onSelect,
      onClickSelect,
    };
  },
});
</script>
