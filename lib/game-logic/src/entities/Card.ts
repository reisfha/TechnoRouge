import { CardDefinition } from '../data/cards';
import { generateId } from '../utils/helpers';

export class CardInstance {
  id: string;
  def: CardDefinition;
  upgraded: boolean;

  constructor(def: CardDefinition) {
    this.id = generateId();
    this.def = def;
    this.upgraded = false;
  }

  get name(): string {
    return this.upgraded ? `${this.def.name}+` : this.def.name;
  }

  get cost(): number {
    return this.def.cost;
  }

  get type(): string {
    return this.def.type;
  }

  get description(): string {
    return this.def.description;
  }

  get target(): string {
    return this.def.target;
  }

  get effects() {
    return this.def.effects;
  }
}
