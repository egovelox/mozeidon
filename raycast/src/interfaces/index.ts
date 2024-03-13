import { Image } from "@raycast/api";
import { getFavicon } from "@raycast/utils";
import { ReactElement } from "react";

export interface Preferences {
  readonly searchEngine: string;
}

export class Tab {
  constructor(
    public readonly id: number,
    public readonly windowId: number,
    public readonly title: string,
    public readonly url: string,
    public readonly domain: string,
    public readonly active: boolean
  ) {}

  urlWithoutScheme(): string {
    return this.url.replace(/(^\w+:|^)\/\//, "").replace("www.", "");
  }

  googleFavicon(): Image.ImageLike {
    return getFavicon(this.url);
  }
}

export interface MozeidonTab {
  id: number;
  windowId: number;
  pinned: boolean;
  domain: string;
  title: string;
  url: string;
  active: boolean;
}

export interface HistoryEntry {
  id: number;
  url: string;
  title: string;
  lastVisited: Date;
}

export interface SearchResult<T> {
  data?: T[];
  errorView?: ReactElement;
  isLoading: boolean;
}

export type GroupedEntries = Map<string, HistoryEntry[]>;
