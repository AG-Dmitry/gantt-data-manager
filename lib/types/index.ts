import { Color } from "../constants";

export type entryNode = {
  name: string;
  duration: number;
  parents: Set<string> | null;
  children: Set<string> | null;
  color: Color;
  start: Date | null;
};

export type ganttElement = {
  name: string;
  start: Date;
  end: Date;
  parents: Set<string> | null;
  children: Set<string> | null;
  color: Color;
  overlappingStart: Date | null;
};