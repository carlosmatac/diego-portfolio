export type FontStyle = 'editorial' | 'grotesk' | 'classic';
export type PaletteStyle = 'marble' | 'charcoal' | 'stone';
export type ImageSize = 'text' | 'wide' | 'full';

export interface ImageRef {
  src: string;
  alt: string;
}

export interface ReferenceItem {
  label: string;
  source: string;
  year: string;
  url: string;
}

export type Block =
  | { id: string; type: 'heading'; level: 2 | 3; text: string }
  | { id: string; type: 'text'; text: string }
  | { id: string; type: 'list'; ordered: boolean; items: string[] }
  | { id: string; type: 'quote'; text: string; cite: string }
  | { id: string; type: 'image'; src: string; alt: string; caption: string; size: ImageSize }
  | { id: string; type: 'images'; images: ImageRef[]; caption: string }
  | { id: string; type: 'callout'; title: string; text: string }
  | { id: string; type: 'references'; title: string; items: ReferenceItem[] }
  | { id: string; type: 'divider' };

export type BlockType = Block['type'];

export interface ArticleStyle {
  font: FontStyle;
  palette: PaletteStyle;
}

export interface ArticleInput {
  slug: string;
  title: string;
  subtitle: string;
  style: ArticleStyle;
  cover: ImageRef | null;
  blocks: Block[];
}

export interface Article extends ArticleInput {
  id: string;
  status: 'draft' | 'published';
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export const FONT_STYLES: FontStyle[] = ['editorial', 'grotesk', 'classic'];
export const PALETTES: PaletteStyle[] = ['marble', 'charcoal', 'stone'];
