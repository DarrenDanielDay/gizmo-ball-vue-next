import { defineComponent } from "vue";
import { HelloWorld } from "./components/hello-world";
import "./app.css";
import logo from './assets/logo.png';
export const App = defineComponent({
  setup() {
    return () => (
      <>
        <img alt="Vue logo" src={logo} />
        <HelloWorld msg="Hello Vue 3 + TypeScript + Vite" />
      </>
    );
  },
});
