import {
  computed,
  CSSProperties,
  defineComponent,
  PropType,
  ref,
  watch,
} from "vue";
import {
  itemUpdateInterval,
  moveApplyInterval,
  moveStep,
  refreshInterval,
} from "../../core/constants/play-mode";
import {
  preCompute,
  reduceNextTickWithPrecomputed,
} from "../../core/controller/play-mode";
import { BaffleKey, ComputedPolygonData } from "../../core/controller/schema";
import {
  getDataFromTransfer,
  MapItemTransferData,
} from "../../core/map-items/data-transfer";
import {
  Baffle,
  Ball,
  MapItem,
  MapItemStatus,
  MovingMapItem,
  PolygonColliderMapItem,
  StaticMapItem,
} from "../../core/map-items/schemas";
import { hasAnyCollision } from "../../core/physics/collider";
import type { Vector2D } from "../../core/physics/schema";
import { replaceItemInArray } from "../../core/physics/utils";
import { add, multiply, substract, vector } from "../../core/physics/vector";
import baffle from "../../img/baffle.png";
import ball from "../../img/ball.png";
import grid from "../../img/grid.png";
import { toVueStyle } from "../../utils/fn";
import { MapItemComponent } from "../map-item";
import { patchBaffleDOM, patchBallDOM } from "../map-item/dom-patch";
import styles from "./style.module.css";
const gridBackgroundStyle: CSSProperties = {
  backgroundImage: `url(${grid})`,
};
export interface GamePanelProps {
  mapItems: MapItem[];
  onMapItemsChange?: (mapItems: MapItem[]) => void;
  onDropItem?: (name: MapItemTransferData, offsetPosition: Vector2D) => void;
  onClick?: (offset: Vector2D) => void;
}

const preventDragOverEvent = (e: Event): void => e.preventDefault();
export const EditorGamePanel = defineComponent({
  props: {
    mapItems: {
      type: Object as PropType<MapItem[]>,
      required: true,
    },
    onMapItemsChange: {
      type: Function as PropType<(mapItems: MapItem[]) => void>,
    },
    onDropItem: {
      type: Function as PropType<
        (name: MapItemTransferData, offsetPosition: Vector2D) => void
      >,
    },
    onClick: { type: Function as PropType<(offset: Vector2D) => void> },
  },
  setup(props) {
    const panelContainerRef = ref<HTMLDivElement | null>(null);
    return () => {
      const { mapItems, onMapItemsChange, onDropItem, onClick } = props;
      const handleDrop = (e: DragEvent): void => {
        const data = getDataFromTransfer(e.dataTransfer!);
        const panelEl = panelContainerRef.value;
        if (!data || !panelEl) {
          return;
        }
        const panelOffset = vector(panelEl.offsetLeft, panelEl.offsetTop);
        const absolutePickedCenter = add(data.item.center, panelOffset);
        const { pickedUpPosition = absolutePickedCenter } = data;
        const cursorCenterOffset = substract(
          pickedUpPosition,
          absolutePickedCenter
        );
        const absoluteDropPosition = vector(e.pageX, e.pageY);
        const droppedOffset = substract(absoluteDropPosition, panelOffset);
        onDropItem?.(data, substract(droppedOffset, cursorCenterOffset));
      };
      const handlePanelClick = (e: MouseEvent): void => {
        const panelEl = panelContainerRef.value!;
        const panelOffset = vector(panelEl.offsetLeft, panelEl.offsetTop);
        const clickedAbsolutePosition = vector(e.pageX, e.pageY);
        const clickedOffset = substract(clickedAbsolutePosition, panelOffset);
        onClick?.(clickedOffset);
      };
      return (
        <div class={styles["game-panel"]}>
          <div
            ref={panelContainerRef}
            class={styles["game-grid"]}
            style={toVueStyle(gridBackgroundStyle)}
            onDragover={preventDragOverEvent}
            onDrop={handleDrop}
            onClick={handlePanelClick}
          >
            {mapItems.map((item, i) => (
              <MapItemComponent
                key={i}
                mapItem={item}
                onClick={() => {
                  onMapItemsChange?.(
                    replaceItemInArray(
                      mapItems.map((original) =>
                        original === item
                          ? item
                          : { ...original, status: MapItemStatus.Normal }
                      ),
                      item,
                      {
                        ...item,
                        status:
                          item.status === MapItemStatus.Selected
                            ? MapItemStatus.Normal
                            : MapItemStatus.Selected,
                      }
                    )
                  );
                }}
              />
            ))}
          </div>
        </div>
      );
    };
  },
});

export interface IPlayingGamePanelProp {
  statics: StaticMapItem[];
  movables: MovingMapItem[];
  paused: boolean;
}

export const PlayingGamePanel = defineComponent({
  props: {
    statics: { type: Array as PropType<StaticMapItem[]>, required: true },
    movables: { type: Array as PropType<MovingMapItem[]>, required: true },
    paused: { type: Boolean, required: true },
  },
  setup(props) {
    const movables = ref(props.movables);
    const paused = computed(() => props.paused);
    watch(
      paused,
      (paused, _, onInvalidate) => {
        if (!paused) {
          onInvalidate(
            createGizmoballPlayingEffectCleanUp(
              movables.value,
              props.statics,
              (baffles, balls) => {
                movables.value = [...baffles, ...balls];
              }
            )
          );
        }
      },
      { immediate: true }
    );
    return () => {
      const { statics } = props;
      return (
        <div class={styles["game-panel"]}>
          <div
            class={styles["game-grid"]}
            style={toVueStyle(gridBackgroundStyle)}
          >
            {[...statics, ...movables.value].map((item, i) => (
              <MapItemComponent mapItem={item} key={i}></MapItemComponent>
            ))}
          </div>
        </div>
      );
    };
  },
});

const StaticPanel = defineComponent({
  props: {
    items: {
      type: Array as PropType<StaticMapItem[]>,
      required: true,
    },
  },
  setup(props) {
    return () => {
      const { items } = props;
      <>
        {items.map((item, i) => (
          <MapItemComponent key={i} mapItem={item} />
        ))}
      </>;
    };
  },
});

const MovingsPanel = defineComponent({
  props: {
    items: {
      type: Array as PropType<MovingMapItem[]>,
      required: true,
    },
  },
  setup(props) {
    return () => {
      const { items } = props;
      <>
        {items.map((item, i) => {
          return <MapItemComponent key={i} mapItem={item} />;
        })}
      </>;
    };
  },
});

export const DOMBoostPlayingGamePanel = defineComponent({
  props: {
    statics: { type: Array as PropType<StaticMapItem[]>, required: true },
    movables: { type: Array as PropType<MovingMapItem[]>, required: true },
    paused: { type: Boolean, required: true },
  },
  setup(props) {
    const gridRef = ref<HTMLDivElement | null>(null);
    const paused = computed(() => props.paused);
    watch(
      [paused, gridRef],
      ([paused, grid], _, onInvalidate) => {
        if (!paused && grid) {
          const nodes = Array.from(grid.querySelectorAll("img"));
          const ballNodes = nodes.filter((node) => node.src.includes(ball));
          const baffleNodes = nodes.filter((node) => node.src.includes(baffle));
          onInvalidate(
            createGizmoballPlayingEffectCleanUp(
              props.movables,
              props.statics,
              (baffles, balls) => {
                for (let i = 0; i < baffleNodes.length; i++) {
                  const baffleEl = baffleNodes[i]!;
                  const baffleItem = baffles[i]!;
                  patchBaffleDOM(baffleItem, baffleEl);
                }
                for (let i = 0; i < ballNodes.length; i++) {
                  const ballEl = ballNodes[i]!;
                  const ballItem = balls[i];
                  if (ballItem) {
                    patchBallDOM(ballItem, ballEl);
                  } else {
                    ballEl.style.display = "none";
                  }
                }
              }
            )
          );
        }
      },
      { immediate: true }
    );
    return () => {
      const { movables, statics } = props;
      return (
        <div class={styles["game-panel"]}>
          <div
            class={styles["game-grid"]}
            style={toVueStyle(gridBackgroundStyle)}
            ref={gridRef}
          >
            {[...statics, ...movables].map((item, i) => <MapItemComponent mapItem={item} key={i}></MapItemComponent>)}
          </div>
        </div>
      );
    };
  },
});

const createGizmoballPlayingEffectCleanUp = (
  movables: MovingMapItem[],
  statics: StaticMapItem[],
  updateMovables: (baffles: Baffle[], balls: Ball[]) => void
) => {
  let currentBalls = movables.filter(
    (movable): movable is Ball => movable.name === "ball"
  );
  let currentBaffles = movables.filter(
    (movable): movable is Baffle =>
      movable.name === "baffle-alpha" || movable.name === "baffle-beta"
  );
  const preComputed = statics.reduce((acc, item) => {
    if (item.name !== "circle") {
      acc.set(item, preCompute(item.collider));
    }
    return acc;
  }, new Map<PolygonColliderMapItem, ComputedPolygonData>());
  const itemTimer = setInterval(() => {
    currentBalls = reduceNextTickWithPrecomputed(
      currentBalls,
      currentBaffles,
      statics,
      preComputed
    );
  }, itemUpdateInterval);

  const keyStatus: Record<BaffleKey, boolean> = {
    [BaffleKey.AlphaLeft]: false,
    [BaffleKey.AlphaRight]: false,
    [BaffleKey.BetaLeft]: false,
    [BaffleKey.BetaRight]: false,
  };
  const isBaffleKey = (key: string): key is BaffleKey => key in keyStatus;
  const toggleKeyStateFactory = (targetState: boolean) => {
    return (e: KeyboardEvent) => {
      const { key } = e;
      if (isBaffleKey(key)) {
        keyStatus[key] = targetState;
      }
    };
  };
  const handleKeyDown = toggleKeyStateFactory(true);
  const handleKeyUp = toggleKeyStateFactory(false);
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
  const movedBaffle = (baffle: Baffle, l: boolean, r: boolean): Baffle => {
    const { center, collider } = baffle;
    const moveOffset = multiply(vector(moveStep, 0), +r - +l);
    const movedBaffleCenter = add(center, moveOffset);
    const movedColliderCenter = add(collider.center, moveOffset);
    return {
      ...baffle,
      center: movedBaffleCenter,
      collider: {
        ...collider,
        center: movedColliderCenter,
      },
    };
  };
  const baffleMoveTimer = setInterval(() => {
    const { a, d, j, l } = keyStatus;
    const combinations: [
      left: boolean,
      right: boolean,
      name: Baffle["name"]
    ][] = [
      [a, d, "baffle-alpha"],
      [j, l, "baffle-beta"],
    ];
    for (const [left, right, name] of combinations) {
      if (left !== right) {
        const newBaffles = currentBaffles.map((item) =>
          item.name === name ? movedBaffle(item, left, right) : item
        );
        if (
          !hasAnyCollision(
            [...newBaffles, ...statics].map((item) => item.collider)
          ) &&
          !hasAnyCollision(
            [...newBaffles, ...currentBalls].map((item) => item.collider)
          )
        ) {
          currentBaffles = newBaffles;
        }
      }
    }
  }, moveApplyInterval);
  const refreshTimer = setInterval(() => {
    updateMovables(currentBaffles, currentBalls);
  }, refreshInterval);
  return () => {
    clearInterval(itemTimer);
    clearInterval(refreshTimer);
    clearInterval(baffleMoveTimer);
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("keyup", handleKeyUp);
  };
};
