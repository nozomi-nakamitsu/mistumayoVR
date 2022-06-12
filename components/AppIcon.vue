<template>
  <fa :icon="path" class="icon-container" :class="[color, classProps]" />
</template>
<script>
import { defineComponent, computed } from "@nuxtjs/composition-api";

export default defineComponent({
  props: {
    icon: {
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    classProps: {
      type: String,
    },
  },

  setup(props) {
    // アイコン
    const path = computed(() => props.icon);
    return {
      path,
    };
  },
});
</script>
