export interface Thing {
    public position: THREE.Vector3,
    public rotation: THREE.Euler,
}

export interface Body {
    public head: Getter<Thing>,
    public leftHand: Getter<Thing>,
    public rightHand: Getter<Thing>
};