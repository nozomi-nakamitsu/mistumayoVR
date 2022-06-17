<template>
  <div class="loading-container">
    <div class="spinner">
      <div class="bounce1"></div>
      <div class="bounce2"></div>
      <div class="bounce3"></div>
    </div>
  </div>
</template>
<script>
import { defineComponent } from "@nuxtjs/composition-api";

export default defineComponent({
  setup() {},
});
</script>
<style scoped lang="scss">
.loading-container {
  height: 100%;
  position: fixed;
  top: 0;
  z-index: 100;
  width: 100%;
  background: white;
  display: flex;
}
.spinner {
  margin: auto;
}

.spinner > div {
  width: 18px;
  height: 18px;
  background-color: #e8374a;

  border-radius: 100%;
  display: inline-block;
  -webkit-animation: sk-bouncedelay 1.4s infinite ease-in-out both;
  animation: sk-bouncedelay 1.4s infinite ease-in-out both;
}

.spinner .bounce1 {
  -webkit-animation-delay: -0.32s;
  animation-delay: -0.32s;
}

.spinner .bounce2 {
  -webkit-animation-delay: -0.16s;
  animation-delay: -0.16s;
}

@-webkit-keyframes sk-bouncedelay {
  0%,
  80%,
  100% {
    -webkit-transform: scale(0);
  }
  40% {
    -webkit-transform: scale(1);
  }
}

@keyframes sk-bouncedelay {
  0%,
  80%,
  100% {
    -webkit-transform: scale(0);
    transform: scale(0);
  }
  40% {
    -webkit-transform: scale(1);
    transform: scale(1);
  }
}
</style>
