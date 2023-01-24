import { onMounted, ref } from "vue";
import { init } from "./utils/canvas";

const vertex = `
varying vec2 vUv;

void main() {
  vUv = uv;

  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`;

const fragment = `
uniform sampler2D baseTexture;
uniform sampler2D bloomTexture;

varying vec2 vUv;

void main() {

  gl_FragColor = ( texture2D( baseTexture, vUv ) + vec4( 1.0 ) * texture2D( bloomTexture, vUv ) );

}`;

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

        window.addEventListener("resize", () => {
          setTimeout(() => {
            const bound = canvas.value.getBoundingClientRect();
            [height.value, width.value] = [bound.height, bound.width];
          }, 100);
        });
      }
    });

    return () => (
      <div>
        <canvas class="main-view" ref={canvas}></canvas>;
        <script type="x-shader/x-vertex" id="vertexshader">
          {vertex}
        </script>
        <script type="x-shader/x-fragment" id="fragmentshader">
          {fragment}
        </script>
      </div>
    );
  }
};
