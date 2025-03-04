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

let activeRemoteContext: "controlled" | "remote" | null = null;
let settersRemote: Setter<number | string>[] = [];
let gettersRemote: Getter<number | string>[] = [];
export function createRemoteSignal<T extends number | string>(initialValue: T): [Getter<T>, Setter<T>] {
    if (activeRemoteContext === null) {
        throw new Error("Must be in remote signal context to create remote Signal");
    }

    const [getValue, setValue] = createSignal<T>(initialValue);
    let setValueRet = setValue;
    if (activeRemoteContext === "remote") {
        settersRemote.push(setValue as Setter<string | number>); // No clue why as is needed
        setValueRet = (_: T) => {;};
    }
    if (activeRemoteContext === "controlled") {
        gettersRemote.push(getValue as Getter<string | number>); // No clue why as is needed
    }
    return [
        getValue,
        setValueRet
    ];
}

export function remoteContextControlled(func: () => void): Getter<number | string>[] {
    gettersRemote = [];
    if (activeRemoteContext !== null) {
        throw new Error("tried creating remote context in remote context");
    }
    activeRemoteContext = "controlled";
    func();
    activeRemoteContext = null;

    return gettersRemote;
}
export function remoteContextRemote(func: () => void): Setter<number | string>[] {
    settersRemote = [];
    if (activeRemoteContext !== null) {
        throw new Error("tried creating remote context in remote context");
    }
    activeRemoteContext = "remote";
    func();
    activeRemoteContext = null;
    return settersRemote;
}