export interface Thing {
    position: THREE.Vector3,
    rotation: THREE.Euler,
}

export interface Body {
    public head: Getter<Thing>,
    leftHand: Getter<Thing>,
    rightHand: Getter<Thing>
};