import classNames from "classnames";
import { CSSProperties, defineComponent, PropType } from "vue";
import { ItemImageMap } from "../../core/constants/map-items";
import { setDataToTransfer } from "../../core/map-items/data-transfer";
import { canRotate, getPosition } from "../../core/map-items/operations";
import { MapItem, MapItemStatus, Rotation } from "../../core/map-items/schemas";
import { vector } from "../../core/physics/vector";
import { toVueStyle } from "../../utils/fn";
import styles from "./style.module.css";

export interface IMapItemComponentProp {
  mapItem: MapItem;
  onClick?: () => void;
}

const rotationMap: Record<Rotation, string> = {
  [Rotation.Up]: styles["rotate-up"],
  [Rotation.Down]: styles["rotate-down"],
  [Rotation.Right]: styles["rotate-right"],
  [Rotation.Left]: styles["rotate-left"],
};

export const MapItemComponent = defineComponent({
  props: {
    mapItem: {
      type: Object as PropType<MapItem>,
      required: true,
    },
    onClick: {
      type: Function as PropType<() => void>,
    },
  },
  setup(props) {
    return () => {
      const { mapItem: item, onClick } = props;
      const { center, size, status, name } = item;
      const position = getPosition(center, size);
      const rotation = canRotate(item) ? item.rotation : Rotation.Up;
      const geometryStyle: CSSProperties = {
        left: position.x,
        top: position.y,
        width: size.x,
        height: size.y,
      };
      const selected = status === MapItemStatus.Selected;
      const handleDragStart = (e: DragEvent): void => {
        setDataToTransfer(e.dataTransfer!, {
          item,
          from: "panel",
          pickedUpPosition: vector(e.pageX, e.pageY),
        });
      };
      return name === "border" ? null : (
        <img
          draggable={selected}
          class={classNames(
            styles["map-item-boarder"],
            status === MapItemStatus.Selected && styles.selected,
            styles["map-item"],
            rotationMap[rotation]
          )}
          onClick={onClick}
          style={toVueStyle(geometryStyle)}
          onDragstart={handleDragStart}
          src={ItemImageMap[name]}
        ></img>
      );
    };
  },
});
