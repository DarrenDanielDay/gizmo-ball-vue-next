import { defineComponent, PropType, VNodeChild } from "vue";
import {
  gridLength,
  ItemCollectionImageMap,
  OperationItemNames,
} from "../../core/constants/map-items";
import { BaffleKey } from "../../core/controller/schema";
import { setDataToTransfer } from "../../core/map-items/data-transfer";
import { createMapItem } from "../../core/map-items/factory";
import { zero } from "../../core/physics/vector";
import { Tooltip } from "../tooltip";
import styles from "./style.module.css";

const itemOrders: [OperationItemNames, OperationItemNames][] = [
  ["select", "ball"],
  ["absorber", "triangle"],
  ["circle", "square"],
  ["pipe", "pipe-turned"],
  ["baffle-alpha", "baffle-beta"],
];

export const ItemCollection = defineComponent({
  props: {
    itemName: {
      type: String as PropType<OperationItemNames>,
      required: true,
    },
    setItemName: {
      type: Function as PropType<(name: OperationItemNames) => void>,
    },
  },
  setup(props) {
    return () => {
      const { itemName, setItemName } = props;
      return (
        <div class={styles["item-zone"]}>
          <span>Item Collection</span>
          {/* @ts-ignore  But HTMLTableElement does have width attribute */}
          <table width="250px">
            <tbody>
              {itemOrders.map((pair, i) => (
                <tr key={i} class={styles["two-item"]}>
                  {pair.map((name, j) => {
                    return (
                      <td key={j}>
                        <label class={styles.item}>
                          <input
                            name="chooseItem"
                            checked={name === itemName}
                            type="radio"
                            value={name}
                            onInput={(e) => setItemName?.(name)}
                          ></input>
                          {renderMapItemOption(name)}
                        </label>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    };
  },
});
const renderMapItemOption = (name: OperationItemNames): VNodeChild => {
  if (name === "select") {
    return <img class={styles.img} src={ItemCollectionImageMap.select} />;
  }
  const mapItemImg = (
    <img
      class={styles.img}
      onDragstart={(e) => {
        setDataToTransfer(e.dataTransfer!, {
          item: createMapItem(name, zero, gridLength),
          from: "collection",
        });
      }}
      src={ItemCollectionImageMap[name]}
    />
  );
  return name === "baffle-alpha"
    ? baffleTooltip(BaffleKey.AlphaLeft, BaffleKey.AlphaRight, mapItemImg)
    : name === "baffle-beta"
    ? baffleTooltip(BaffleKey.BetaLeft, BaffleKey.BetaRight, mapItemImg)
    : mapItemImg;
};

const baffleTooltip = (k1: string, k2: string, img: VNodeChild) => {
  return (
    <Tooltip
      tooltip={
        <div class={styles["baffle-control-hint"]}>
          <p>Play Mode Control Key:</p>
          <p>
            Key <kbd>{k1.toUpperCase()}</kbd> For moving left
          </p>
          <p>
            Key <kbd>{k2.toUpperCase()}</kbd> For moving right
          </p>
        </div>
      }
    >
      {img}
    </Tooltip>
  );
};
