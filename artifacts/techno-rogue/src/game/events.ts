export interface EventChoice {
  text: string;
  effectDescription: string;
  condition?: (state: any) => boolean;
  onChoose: (dispatch: any) => void;
}

export interface EventDef {
  id: string;
  title: string;
  description: string;
  image?: string;
  choices: EventChoice[];
}

// These will be wired up via context. We'll implement the actual dispatch payload in the component or context.
