import { defineComponent, ref } from "vue";
import "./hello-world.css";
export const HelloWorld = defineComponent({
  props: {
    msg: {
      type: String,
    },
  },
  setup(props) {
    const count = ref(0);
    return () => {
      const { msg } = props;
      return (
        <>
          <h1>{msg}</h1>
          <p>
            Recommended IDE setup:
            <a href="https://code.visualstudio.com/" target="_blank">
              VSCode
            </a>
            +
            <a href="https://github.com/johnsoncodehk/volar" target="_blank">
              Volar
            </a>
          </p>
          <p>
            See <code>README.md</code> for more information.
          </p>
          <p>
            <a href="https://vitejs.dev/guide/features.html" target="_blank">
              Vite Docs
            </a>
            |
            <a href="https://v3.vuejs.org/" target="_blank">
              Vue 3 Docs
            </a>
          </p>
          <button
            type="button"
            onClick={() => {
              count.value++;
            }}
          >
            count is: {count.value}
          </button>
          <p>
            Edit
            <code>components/HelloWorld.vue</code> to test hot module
            replacement.
          </p>
        </>
      );
    };
  },
});
