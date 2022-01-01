import classNames from "classnames";
import styles from "./style.module.css";
import {
  DOMBoostPlayingGamePanel,
  EditorGamePanel,
  PlayingGamePanel,
} from "../../components/game-panel";
import { ItemCollection } from "../../components/item-collection";
import { ToolCollection } from "../../components/tool-collection";
import { Controls } from "../../components/controls";
import { MapItem, MapItemStatus } from "../../core/map-items/schemas";
import type { Vector2D } from "../../core/physics/schema";
import {
  gridLength,
  gridXCellCounts,
  gridYCellCounts,
  OperationItemNames,
} from "../../core/constants/map-items";
import { add, multiply, substract, vector } from "../../core/physics/vector";
import {
  removeItemInArray,
  replaceItemInArray,
} from "../../core/physics/utils";
import {
  canRotate,
  canZoom,
  isMovable,
  isStatic,
  moveMapItem,
  rotateItem,
  zoomInReducer,
  zoomItem,
  zoomOutReducer,
} from "../../core/map-items/operations";
import { hasAnyCollision } from "../../core/physics/collider";
import { Mode } from "../../core/controller/schema";
import {
  createBorder,
  createMapItem,
  sizeOfMapItem,
} from "../../core/map-items/factory";
import type { MapItemTransferData } from "../../core/map-items/data-transfer";
import { SaveLoadService$$ } from "../../services/save-load";
import { computed, defineComponent, inject, watch } from "vue";
import { useReducer, useState } from "../../utils/react-hooks";

const normalizeToCenter = (
  pointer: Vector2D,
  size: Vector2D,
  length: number
) => {
  const offset = multiply(size, 0.5);
  const { x, y } = substract(pointer, offset);
  const normalized = vector(
    Math.round(x / length) * length,
    Math.round(y / length) * length
  );
  return add(normalized, offset);
};

const toggleBoolean = (p: boolean): boolean => !p;
const noop = () => {};
export const GameMainView = defineComponent({
  setup() {
    const saveLoad = inject(SaveLoadService$$)!;
    const [itemName, setItemName] = useState<OperationItemNames>("select");
    const [mapItems, _setMapItems] = useState<MapItem[]>(
      createBorder(gridLength, gridXCellCounts, gridYCellCounts)
    );
    const setMapItems: typeof _setMapItems = (action) =>
      _setMapItems((items) => {
        const pendingItems =
          typeof action === "function" ? action(items) : action;
        const has = hasAnyCollision(pendingItems.map((item) => item.collider));
        return has ? items : pendingItems;
      });
    const [mode, setMode] = useState(Mode.Layout);
    const [paused, setPaused] = useState(false);
    const handleLayoutMode = () => {
      setMode(Mode.Layout);
      setPaused(false);
    };
    const handlePlayMode = () => {
      setMode(Mode.Play);
    };
    const [domMode, toggleDomMode] = useReducer(toggleBoolean, false);
    const handleLoad = () => {
      saveLoad
        .load()
        .then((items) => {
          setMapItems(items);
        })
        .catch((error) => {
          alert(error);
        });
    };
    const handleSave = () => {
      saveLoad.save(mapItems.value).catch((error) => {
        alert(error);
      });
    };
    const togglePaused = () => setPaused(toggleBoolean);
    const handleGridClick = (offset: Vector2D) => {
      const name = itemName.value;
      name !== "select" &&
        setMapItems((items) => [
          ...items,
          createMapItem(
            name,
            normalizeToCenter(
              offset,
              sizeOfMapItem(name, gridLength),
              gridLength
            ),
            gridLength
          ),
        ]);
    };

    const isEditing = computed(() => mode.value === Mode.Layout);
    const selected = computed(() => mapItems.value.find(
      (item) => item.status === MapItemStatus.Selected
    ));
    const createToolHandler = (callBack: () => void) => () =>
      isEditing.value ? callBack() : noop();
    const handleRotateItem = createToolHandler(() => {
      setMapItems((items) =>
        selected.value && canRotate(selected.value)
          ? replaceItemInArray(items, selected.value, rotateItem(selected.value))
          : items
      );
    });
    const handleDropItem = (
      data: MapItemTransferData,
      offset: Vector2D
    ): void => {
      const { item, from } = data;
      setMapItems((items) => {
        const center = normalizeToCenter(offset, item.size, gridLength);
        const droppedItem = moveMapItem(item, center);
        return [
          ...(from === "panel" && selected.value
            ? removeItemInArray(items, selected.value)
            : items),
          droppedItem,
        ];
      });
    };
    const handleRemoveItem = createToolHandler(() => {
      setMapItems((items) =>
        selected.value ? removeItemInArray(items, selected.value) : items
      );
    });
    const handleZoomInItem = createToolHandler(() => {
      setMapItems((items) =>
        selected.value && canZoom(selected.value)
          ? replaceItemInArray(
              items,
              selected.value,
              zoomItem(selected.value, zoomInReducer)
            )
          : items
      );
    });
    const handleZoomOutItem = createToolHandler(() => {
      setMapItems((items) =>
        selected.value && canZoom(selected.value)
          ? replaceItemInArray(
              items,
              selected.value,
              zoomItem(selected.value, zoomOutReducer)
            )
          : items
      );
    });
    watch(isEditing, (isEditing, _, onInvalidate) => {
      if (isEditing) {
        const handler = (e: KeyboardEvent): void => {
          const action = e.key.toLocaleLowerCase();
          switch (action) {
            case "delete":
              handleRemoveItem();
              break;
            case "r":
              handleRotateItem();
              break;
            case "=":
              handleZoomInItem();
              break;
            case "-":
              handleZoomOutItem();
              break;
          }
        };
        window.addEventListener("keydown", handler);
        onInvalidate(() => {
          window.removeEventListener("keydown", handler);
        });
      }
      return;
    });
    return () => {
      return (
        <div class={styles["game"]}>
          <div class={styles.border}>
            {isEditing.value ? (
              <EditorGamePanel
                mapItems={mapItems.value}
                onMapItemsChange={setMapItems}
                onClick={handleGridClick}
                onDropItem={handleDropItem}
              />
            ) : (
              renderPlaying(domMode.value, paused.value, mapItems.value)
            )}
          </div>
          <div class={classNames(styles["right-side"], styles.border)}>
            <div class={classNames(styles["right-top"], styles.border)}>
              <ItemCollection
                itemName={itemName.value}
                setItemName={setItemName}
              />
            </div>
            <div class={classNames(styles["right-middle"], styles.border)}>
              <ToolCollection
                onRotate={handleRotateItem}
                onRemove={handleRemoveItem}
                onZoomIn={handleZoomInItem}
                onZoomOut={handleZoomOutItem}
              />
            </div>
            <div class={classNames(styles["right-bottom"], styles.border)}>
              <Controls
                mode={mode.value}
                domMode={domMode.value}
                paused={paused.value}
                toggleDomMode={toggleDomMode}
                togglePaused={togglePaused}
                handleLayoutMode={handleLayoutMode}
                handlePlayMode={handlePlayMode}
                handleLoad={handleLoad}
                handleSave={handleSave}
              />
            </div>
          </div>
        </div>
      );
    };
  },
});

const renderPlaying = (
  domMode: boolean,
  paused: boolean,
  mapItems: MapItem[]
) => {
  const movables = mapItems
    .filter(isMovable)
    .map((item) => ({ ...item, status: MapItemStatus.Normal }));
  const statics = mapItems
    .filter(isStatic)
    .map((item) => ({ ...item, status: MapItemStatus.Normal }));
  return domMode ? (
    <DOMBoostPlayingGamePanel
      paused={paused}
      movables={movables}
      statics={statics}
    />
  ) : (
    <PlayingGamePanel paused={paused} movables={movables} statics={statics} />
  );
};
