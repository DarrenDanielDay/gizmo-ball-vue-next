import { defineComponent, PropType, useSlots, VNodeTypes, watch } from "vue";
import styles from "./style.module.css";

export const Tooltip = defineComponent({
  props: {
    tooltip: {
      type: Object as PropType<VNodeTypes>,
      required: true
    },
  },
  setup(props) {
    const slots = useSlots();
    return () => {
      const { tooltip } = props;
      return (
        <div class={styles["tooltip-host"]}>
          <div class={styles.tooltip}>
            <div class={styles["tooltip-content"]}>{tooltip}</div>
          </div>
          {slots.default?.()}
        </div>
      );
    };
  },
});
