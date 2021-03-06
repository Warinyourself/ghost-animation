import { h, onMounted, ref } from "vue";
import { init } from "./utils/canvas";

export default {
  setup() {
    const canvas = ref<any>(null);
    const height = ref(0);
    const width = ref(0);

    onMounted(() => {
      if (canvas.value != null) {

        const bound = canvas.value.getBoundingClientRect();
        [height.value, width.value] = [bound.height, bound.width];
        init(canvas.value);
        console.log({ height: height.value, canvas })

        window.addEventListener("resize", () => {
          setTimeout(() => {
            const bound = canvas.value.getBoundingClientRect();
            [height.value, width.value] = [bound.height, bound.width];
          }, 100);
        });

      }
    });

    return () => <canvas class="main-view" ref={ canvas }></canvas>
  },
};