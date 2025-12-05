export type BlockType = 'text' | 'table' | 'image' | 'signature' | 'rectangle';

export interface BlockStyle {
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  color?: string;
  padding?: number;
}

export interface TableCell {
  content: string;
  colspan?: number;
  rowspan?: number;
}

export interface TableData {
  rows: TableCell[][];
  headerRows?: number;
}

export interface DocumentBlock {
  id: string;
  type: BlockType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  content: string;
  style: BlockStyle;
  tableData?: TableData;
  imageUrl?: string;
  zIndex: number;
}

export interface DocumentData {
  blocks: DocumentBlock[];
  zoom: number;
  pageWidth: number;
  pageHeight: number;
}

export interface DocumentTemplateDTO {
  id: number;
  owner?: number;
  owner_username?: string;
  title: string;
  description: string;
  data: DocumentData;
  created_at: string;
  updated_at: string;
}

export interface DocumentTemplateListDTO {
  id: number;
  owner_username: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentTemplateCreatePayload {
  title: string;
  description?: string;
  data: DocumentData;
}

export interface DocumentTemplateUpdatePayload {
  title?: string;
  description?: string;
  data?: DocumentData;
}

export interface ParsedPage {
  page: number;
  text: string;
}

export interface SourceFileDTO {
  id: number;
  owner?: number;
  owner_username?: string;
  template?: number | null;
  template_title?: string | null;
  file?: string;
  file_url?: string | null;
  original_name: string;
  mime_type: string;
  file_size: number;
  parsed_content: ParsedPage[];
  uploaded_at: string;
}

export interface SourceFileListDTO {
  id: number;
  owner_username: string;
  template?: number | null;
  template_title?: string | null;
  original_name: string;
  mime_type: string;
  file_size: number;
  uploaded_at: string;
}

export interface HistoryState {
  blocks: DocumentBlock[];
  zoom: number;
}

export interface EditorState {
  blocks: DocumentBlock[];
  selectedBlockId: string | null;
  zoom: number;
  templateId: number | null;
  templateTitle: string;
  templateDescription: string;
  isDirty: boolean;
  history: HistoryState[];
  historyIndex: number;
}

export type EditorAction =
  | { type: 'SET_BLOCKS'; payload: DocumentBlock[] }
  | { type: 'ADD_BLOCK'; payload: DocumentBlock }
  | { type: 'UPDATE_BLOCK'; payload: { id: string; updates: Partial<DocumentBlock> } }
  | { type: 'DELETE_BLOCK'; payload: string }
  | { type: 'SELECT_BLOCK'; payload: string | null }
  | { type: 'SET_ZOOM'; payload: number }
  | { type: 'SET_TEMPLATE_INFO'; payload: { id: number | null; title: string; description: string } }
  | { type: 'LOAD_TEMPLATE'; payload: DocumentTemplateDTO }
  | { type: 'MARK_CLEAN' }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'RESET' };

export const DEFAULT_BLOCK_STYLE: BlockStyle = {
  backgroundColor: 'transparent',
  borderColor: '#000000',
  borderWidth: 1,
  borderRadius: 0,
  fontFamily: 'Arial',
  fontSize: 14,
  fontWeight: 'normal',
  fontStyle: 'normal',
  textAlign: 'left',
  color: '#000000',
  padding: 8,
};

export const DEFAULT_DOCUMENT_DATA: DocumentData = {
  blocks: [],
  zoom: 100,
  pageWidth: 794,
  pageHeight: 1123,
};

export function createDefaultBlock(type: BlockType, x: number = 50, y: number = 50): DocumentBlock {
  const id = `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const baseBlock: DocumentBlock = {
    id,
    type,
    x,
    y,
    width: 200,
    height: 100,
    rotation: 0,
    content: '',
    style: { ...DEFAULT_BLOCK_STYLE },
    zIndex: Date.now(),
  };

  switch (type) {
    case 'text':
      return {
        ...baseBlock,
        content: 'Введите текст...',
        width: 200,
        height: 60,
      };
    case 'table':
      return {
        ...baseBlock,
        width: 300,
        height: 150,
        tableData: {
          rows: [
            [{ content: 'Ячейка 1' }, { content: 'Ячейка 2' }],
            [{ content: 'Ячейка 3' }, { content: 'Ячейка 4' }],
          ],
          headerRows: 1,
        },
      };
    case 'image':
      return {
        ...baseBlock,
        width: 200,
        height: 150,
        content: 'Изображение',
        imageUrl: '',
      };
    case 'signature':
      return {
        ...baseBlock,
        content: 'Подпись: ________________',
        width: 250,
        height: 50,
        style: {
          ...DEFAULT_BLOCK_STYLE,
          borderWidth: 0,
        },
      };
    case 'rectangle':
      return {
        ...baseBlock,
        width: 150,
        height: 100,
        style: {
          ...DEFAULT_BLOCK_STYLE,
          backgroundColor: '#f0f0f0',
          borderWidth: 2,
        },
      };
    default:
      return baseBlock;
  }
}
