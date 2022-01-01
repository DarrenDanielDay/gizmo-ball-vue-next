import zoomIn from "../../img/zoom-in.png";
import remove from "../../img/remove.png";
import rotate from "../../img/rotate.png";
import zoomOut from "../../img/zoom-out.png";
import styles from "./style.module.css";
import { Tooltip } from "../tooltip";
import { defineComponent, PropType } from "vue";

export interface ToolCollectionProps {
  onRotate?: () => void;
  onRemove?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
}

export const ToolCollection = defineComponent({
  props: {
    onRotate: { type: Function as PropType<() => void> },
    onRemove: { type: Function as PropType<() => void> },
    onZoomIn: { type: Function as PropType<() => void> },
    onZoomOut: { type: Function as PropType<() => void> },
  },
  setup(props) {
    return () => {
      const { onRotate, onRemove, onZoomIn, onZoomOut } = props;
      return (
        <div>
          <span>Tool Collection</span>
          {/* @ts-ignore  But HTMLTableElement does have width attribute */}
          <table width="250px">
            <tbody>
              <tr>
                <td>
                  <Tooltip tooltip={<kbd>R</kbd>}>
                    <img class={styles.tool} src={rotate} onClick={onRotate} />
                  </Tooltip>
                </td>
                <td>
                  <Tooltip tooltip={<kbd>Del</kbd>}>
                    <img class={styles.tool} src={remove} onClick={onRemove} />
                  </Tooltip>
                </td>
              </tr>
              <tr>
                <td>
                  <Tooltip tooltip={<kbd>=</kbd>}>
                    <img class={styles.tool} src={zoomIn} onClick={onZoomIn} />
                  </Tooltip>
                </td>
                <td>
                  <Tooltip tooltip={<kbd>-</kbd>}>
                    <img
                      class={styles.tool}
                      src={zoomOut}
                      onClick={onZoomOut}
                    />
                  </Tooltip>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    };
  },
});
