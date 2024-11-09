export type Status = "start" | "win" | "game_over";
export type AutoPlayType = "on" | "off";

export interface CircleType {
  number: number;
  top: number;
  left: number;
  countdown: number;
  isActive: boolean;
}
