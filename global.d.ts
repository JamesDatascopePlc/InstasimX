export {};

declare global {
  interface String {
    toNumber(): number;
  }
}