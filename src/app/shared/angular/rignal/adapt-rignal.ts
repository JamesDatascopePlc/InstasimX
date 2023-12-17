import { Rignal, rignal } from "./rignal";

export type AdaptedRignal<T, A extends {}> = Rignal<T> & A;

export function adaptRignal<T, A extends {}>(initialValue: T, adaption: (value: Rignal<T>) => A): AdaptedRignal<T, A> {
  const value: Rignal<T> = rignal(initialValue);

  return Object.assign(value, adaption(value));
}