import { Ref } from "vue";

interface ScrollStore {
  setScrollPosition: (position: number) => void;
  scrollPosition: number;
}

export function useScrollTracker(
  containerRef: Ref<HTMLElement | null>,
  store: ScrollStore,
) {
  const saveScrollPosition = (): void => {
    if (containerRef.value) {
      store.setScrollPosition(containerRef.value.scrollTop);
    }
  };

  const restoreScrollPosition = (): void => {
    if (containerRef.value) {
      containerRef.value.scrollTop = store.scrollPosition;
    }
  };

  return { saveScrollPosition, restoreScrollPosition };
}
