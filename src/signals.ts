let activeEffect: null | (() => void) = null; // Stores the currently running effect

function trackDependency(subscribers: Set<() => void>) {
  if (activeEffect) {
    subscribers.add(activeEffect); // Register the effect as a dependency
  }
}

function notifySubscribers(subscribers: Set<() => void>) {
  for (const effect of subscribers) {
    effect(); // Re-run the effect to update UI
  }
}

export type Getter<T> = () => T;
export type Setter<T> = (newValue: T) => void; 
export function createSignal<T>(initialValue: T): [Getter<T>, Setter<T>] {
  let value = initialValue;
  let subscribers: Set<() => void> = new Set();

  function getter() {
    trackDependency(subscribers);
    return value;
  }

  function setter(newValue: T) {
    if (value !== newValue) {
      value = newValue;
      notifySubscribers(subscribers);
    }
  }

  return [getter, setter];
}

export function createEffect(fn: () => void) {
    function wrappedEffect() {
        activeEffect = wrappedEffect; // Mark effect as active
        fn(); // Run the effect
        activeEffect = null; // Reset active effect
    }
    wrappedEffect();
}