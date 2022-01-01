import pause from "../../img/pause.png";
import resume from "../../img/resume.png";
import { Mode } from "../../core/controller/schema";
import arrow from "../../img/arrow.png";
import styles from "./style.module.css";
import classNames from "classnames";
import { defineComponent, PropType } from "vue";

export interface ControlsProps {
  mode: Mode;
  domMode: boolean;
  paused: boolean;
  toggleDomMode?: () => void;
  togglePaused?: () => void;
  handleLayoutMode?: () => void;
  handlePlayMode?: () => void;
  handleSave?: () => void;
  handleLoad?: () => void;
}

export const Controls = defineComponent({
  props: {
    mode: {
      type: Number,
      required: true,
    },
    domMode: {
      type: Boolean,
      required: true,
    },
    paused: {
      type: Boolean,
      required: true,
    },
    toggleDomMode: {
      type: Function as PropType<() => void>,
    },
    togglePaused: {
      type: Function as PropType<() => void>,
    },
    handleLayoutMode: {
      type: Function as PropType<() => void>,
    },
    handlePlayMode: {
      type: Function as PropType<() => void>,
    },
    handleSave: {
      type: Function as PropType<() => void>,
    },
    handleLoad: {
      type: Function as PropType<() => void>,
    },
  },
  setup(props) {
    return () => {
      const {
        mode,
        domMode,
        paused,
        toggleDomMode,
        togglePaused,
        handleLayoutMode,
        handlePlayMode,
        handleSave,
        handleLoad,
      } = props;
      const isPlaying = mode === Mode.Play;
      return (
        <div class={styles["mode-zone"]}>
          <span>Controls</span>
          <div>
            <div class={styles["control-row"]}>
              <img
                src={arrow}
                class={isPlaying ? styles.hide : styles.show}
                height="20"
              />
              <button class={styles.button} onClick={handleLayoutMode}>
                Layout Mode
              </button>
              <div></div>
            </div>
            <div class={styles["control-row"]}>
              <img
                src={arrow}
                class={isPlaying ? styles.show : styles.hide}
                height="20"
              />
              <button class={styles.button} onClick={handlePlayMode}>
                Play Mode
              </button>
              <img
                class={classNames(
                  styles["controll-img"],
                  isPlaying ? styles.show : styles.hide
                )}
                height="30"
                src={paused ? resume : pause}
                onClick={togglePaused}
              />
            </div>
            <div class={styles["control-row"]}>
              <div></div>
              <button class={styles.button} onClick={handleSave}>
                Save
              </button>
              <div></div>
            </div>
            <div class={styles["control-row"]}>
              <div></div>
              <button class={styles.button} onClick={handleLoad}>
                Load
              </button>
              <div></div>
            </div>
          </div>
          {
            <span onClick={toggleDomMode} class={styles.span}>
              {domMode ? "GIZMO BALL DOM" : "GIZMO BALL VUE"}
            </span>
          }
        </div>
      );
    };
  },
});
