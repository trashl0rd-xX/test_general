import { Story } from 'inkjs';
import { useGameStore } from '../store/gameStore';
import type { NarrativeResult } from '../types/narrative';

class NarrativeEngine {
  private story: Story | null = null;

  initialize(compiledStory: object, savedState?: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.story = new Story(compiledStory as any);
    if (savedState) {
      this.story.state.LoadJson(savedState);
    }
    this.bindExternalFunctions();
  }

  private bindExternalFunctions() {
    if (!this.story) return;
    const store = useGameStore.getState;

    this.story.BindExternalFunction('getSanity', () => store().sanity);
    this.story.BindExternalFunction('hasFlag', (flag: string) => store().flags[flag] ?? false);
    this.story.BindExternalFunction('hasItem', (itemId: string) =>
      store().inventory.some((i) => i.itemId === itemId)
    );
  }

  jumpToKnot(knotName: string): NarrativeResult {
    if (!this.story) throw new Error('NarrativeEngine not initialized');
    this.story.ChoosePathString(knotName);
    return this.drain();
  }

  choose(choiceIndex: number): NarrativeResult {
    if (!this.story) throw new Error('NarrativeEngine not initialized');
    this.story.ChooseChoiceIndex(choiceIndex);
    return this.drain();
  }

  private drain(): NarrativeResult {
    if (!this.story) throw new Error('NarrativeEngine not initialized');
    const paragraphs: string[] = [];

    while (this.story.canContinue) {
      const line = (this.story.Continue() ?? '').trim();
      if (line) paragraphs.push(line);
      this.processTags(this.story.currentTags ?? []);
    }

    return {
      paragraphs,
      choices: (this.story.currentChoices ?? []).map((c) => ({
        index: c.index,
        text: c.text,
      })),
    };
  }

  private processTags(tags: string[]) {
    const store = useGameStore.getState();
    for (const tag of tags) {
      if (tag.startsWith('SANITY:')) {
        store.modifySanity(parseInt(tag.slice(7)));
      } else if (tag.startsWith('SET_FLAG:')) {
        store.setFlag(tag.slice(9), true);
      } else if (tag.startsWith('CLEAR_FLAG:')) {
        store.setFlag(tag.slice(11), false);
      } else if (tag.startsWith('ADD_ITEM:')) {
        store.addToInventory(tag.slice(9));
      } else if (tag.startsWith('REMOVE_ITEM:')) {
        store.removeFromInventory(tag.slice(12));
      } else if (tag.startsWith('PHASE:')) {
        store.setPhase(tag.slice(6) as Parameters<typeof store.setPhase>[0]);
      }
    }
  }

  serializeState(): string | null {
    return this.story?.state.toJson() ?? null;
  }

  get canContinue(): boolean {
    return this.story?.canContinue ?? false;
  }

  get hasChoices(): boolean {
    return (this.story?.currentChoices?.length ?? 0) > 0;
  }
}

export const narrativeEngine = new NarrativeEngine();
