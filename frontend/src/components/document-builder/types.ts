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
  selectedBlockIds: string[];
  zoom: number;
  templateId: number | null;
  templateTitle: string;
  templateDescription: string;
  isDirty: boolean;
  history: HistoryState[];
  historyIndex: number;
}

export type AlignMode = 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom';
export type DistributeDirection = 'horizontal' | 'vertical';

export type EditorAction =
  | { type: 'SET_BLOCKS'; payload: DocumentBlock[] }
  | { type: 'ADD_BLOCK'; payload: DocumentBlock }
  | { type: 'UPDATE_BLOCK'; payload: { id: string; updates: Partial<DocumentBlock> } }
  | { type: 'UPDATE_BLOCKS'; payload: { ids: string[]; updates: Partial<DocumentBlock>[] } }
  | { type: 'DELETE_BLOCK'; payload: string }
  | { type: 'DELETE_BLOCKS'; payload: string[] }
  | { type: 'SELECT_BLOCK'; payload: string | null }
  | { type: 'SELECT_BLOCKS'; payload: string[] }
  | { type: 'TOGGLE_BLOCK_SELECTION'; payload: string }
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

interface BoundingBox {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

function getBoundingBox(blocks: DocumentBlock[], selectedIds: string[]): BoundingBox {
  const selectedBlocks = blocks.filter(b => selectedIds.includes(b.id));
  if (selectedBlocks.length === 0) {
    return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
  }
  
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  
  for (const block of selectedBlocks) {
    minX = Math.min(minX, block.x);
    minY = Math.min(minY, block.y);
    maxX = Math.max(maxX, block.x + block.width);
    maxY = Math.max(maxY, block.y + block.height);
  }
  
  return { minX, maxX, minY, maxY };
}

export function alignBlocks(
  blocks: DocumentBlock[],
  selectedIds: string[],
  mode: AlignMode
): DocumentBlock[] {
  if (selectedIds.length < 2) return blocks;
  
  const bbox = getBoundingBox(blocks, selectedIds);
  
  return blocks.map(block => {
    if (!selectedIds.includes(block.id)) return block;
    
    let newX = block.x;
    let newY = block.y;
    
    switch (mode) {
      case 'left':
        newX = bbox.minX;
        break;
      case 'center':
        const centerX = (bbox.minX + bbox.maxX) / 2;
        newX = centerX - block.width / 2;
        break;
      case 'right':
        newX = bbox.maxX - block.width;
        break;
      case 'top':
        newY = bbox.minY;
        break;
      case 'middle':
        const centerY = (bbox.minY + bbox.maxY) / 2;
        newY = centerY - block.height / 2;
        break;
      case 'bottom':
        newY = bbox.maxY - block.height;
        break;
    }
    
    return { ...block, x: newX, y: newY };
  });
}

export function distributeBlocks(
  blocks: DocumentBlock[],
  selectedIds: string[],
  direction: DistributeDirection
): DocumentBlock[] {
  if (selectedIds.length < 3) return blocks;
  
  const selectedBlocks = blocks.filter(b => selectedIds.includes(b.id));
  
  if (direction === 'horizontal') {
    const sorted = [...selectedBlocks].sort((a, b) => a.x - b.x);
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    
    const totalWidth = sorted.reduce((sum, b) => sum + b.width, 0);
    const totalSpace = (last.x + last.width) - first.x;
    const gap = (totalSpace - totalWidth) / (sorted.length - 1);
    
    let currentX = first.x;
    const positionMap = new Map<string, number>();
    
    for (const block of sorted) {
      positionMap.set(block.id, currentX);
      currentX += block.width + gap;
    }
    
    return blocks.map(block => {
      if (!selectedIds.includes(block.id)) return block;
      const newX = positionMap.get(block.id);
      return newX !== undefined ? { ...block, x: newX } : block;
    });
  } else {
    const sorted = [...selectedBlocks].sort((a, b) => a.y - b.y);
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    
    const totalHeight = sorted.reduce((sum, b) => sum + b.height, 0);
    const totalSpace = (last.y + last.height) - first.y;
    const gap = (totalSpace - totalHeight) / (sorted.length - 1);
    
    let currentY = first.y;
    const positionMap = new Map<string, number>();
    
    for (const block of sorted) {
      positionMap.set(block.id, currentY);
      currentY += block.height + gap;
    }
    
    return blocks.map(block => {
      if (!selectedIds.includes(block.id)) return block;
      const newY = positionMap.get(block.id);
      return newY !== undefined ? { ...block, y: newY } : block;
    });
  }
}
