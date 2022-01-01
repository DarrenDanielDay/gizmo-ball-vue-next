import { defineComponent, provide } from "vue";
import "./app.css";
import { SaveLoadService$$ } from "./services/save-load";
import { browserSaveLoadService } from "./services/save-load/browser";
import { GameMainView } from "./views/game-main";
export const App = defineComponent({
  setup() {
    provide(SaveLoadService$$, browserSaveLoadService);
    return () => (
      <div id="game-container">
        <GameMainView></GameMainView>
      </div>
    );
  },
});
