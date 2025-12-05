import React, { useReducer, useCallback, useRef } from 'react';
import {
  DocumentBlock,
  BlockType,
  EditorState,
  EditorAction,
  DocumentTemplateDTO,
  DEFAULT_DOCUMENT_DATA,
  createDefaultBlock,
  HistoryState,
  AlignMode,
  DistributeDirection,
  alignBlocks,
  distributeBlocks,
} from '../components/document-builder/types';
import { Toolbar } from '../components/document-builder/Toolbar';
import { SidebarBlocks } from '../components/document-builder/SidebarBlocks';
import { SidebarFiles } from '../components/document-builder/SidebarFiles';
import { InspectorPanel } from '../components/document-builder/InspectorPanel';
import { DocumentCanvas } from '../components/document-builder/DocumentCanvas';
import {
  getTemplate,
  createTemplate,
  updateTemplate,
  uploadSourceFile,
} from '../api/documentBuilderApi';

const MAX_HISTORY = 50;

function pushHistory(state: EditorState, newBlocks: DocumentBlock[]): { history: HistoryState[]; historyIndex: number } {
  const newHistory = [
    ...state.history.slice(0, state.historyIndex + 1),
    { blocks: newBlocks, zoom: state.zoom },
  ].slice(-MAX_HISTORY);
  return {
    history: newHistory,
    historyIndex: newHistory.length - 1,
  };
}

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'SET_BLOCKS': {
      const { history, historyIndex } = pushHistory(state, action.payload);
      return {
        ...state,
        blocks: action.payload,
        isDirty: true,
        history,
        historyIndex,
      };
    }

    case 'ADD_BLOCK': {
      const newBlocks = [...state.blocks, action.payload];
      const { history, historyIndex } = pushHistory(state, newBlocks);
      return {
        ...state,
        blocks: newBlocks,
        selectedBlockId: action.payload.id,
        selectedBlockIds: [action.payload.id],
        isDirty: true,
        history,
        historyIndex,
      };
    }

    case 'UPDATE_BLOCK': {
      const newBlocks = state.blocks.map((block) =>
        block.id === action.payload.id ? { ...block, ...action.payload.updates } : block
      );
      const { history, historyIndex } = pushHistory(state, newBlocks);
      return {
        ...state,
        blocks: newBlocks,
        isDirty: true,
        history,
        historyIndex,
      };
    }

    case 'UPDATE_BLOCKS': {
      const { ids, updates } = action.payload;
      const updateMap = new Map<string, Partial<DocumentBlock>>();
      ids.forEach((id, idx) => updateMap.set(id, updates[idx]));
      
      const newBlocks = state.blocks.map((block) => {
        const blockUpdates = updateMap.get(block.id);
        return blockUpdates ? { ...block, ...blockUpdates } : block;
      });
      const { history, historyIndex } = pushHistory(state, newBlocks);
      return {
        ...state,
        blocks: newBlocks,
        isDirty: true,
        history,
        historyIndex,
      };
    }

    case 'DELETE_BLOCK': {
      const newBlocks = state.blocks.filter((block) => block.id !== action.payload);
      const { history, historyIndex } = pushHistory(state, newBlocks);
      return {
        ...state,
        blocks: newBlocks,
        selectedBlockId: state.selectedBlockId === action.payload ? null : state.selectedBlockId,
        selectedBlockIds: state.selectedBlockIds.filter(id => id !== action.payload),
        isDirty: true,
        history,
        historyIndex,
      };
    }

    case 'DELETE_BLOCKS': {
      const idsToDelete = new Set(action.payload);
      const newBlocks = state.blocks.filter((block) => !idsToDelete.has(block.id));
      const { history, historyIndex } = pushHistory(state, newBlocks);
      return {
        ...state,
        blocks: newBlocks,
        selectedBlockId: idsToDelete.has(state.selectedBlockId || '') ? null : state.selectedBlockId,
        selectedBlockIds: [],
        isDirty: true,
        history,
        historyIndex,
      };
    }

    case 'SELECT_BLOCK':
      return {
        ...state,
        selectedBlockId: action.payload,
        selectedBlockIds: action.payload ? [action.payload] : [],
      };

    case 'SELECT_BLOCKS':
      return {
        ...state,
        selectedBlockIds: action.payload,
        selectedBlockId: action.payload.length > 0 ? action.payload[0] : null,
      };

    case 'TOGGLE_BLOCK_SELECTION': {
      const blockId = action.payload;
      const isSelected = state.selectedBlockIds.includes(blockId);
      const newSelectedIds = isSelected
        ? state.selectedBlockIds.filter(id => id !== blockId)
        : [...state.selectedBlockIds, blockId];
      return {
        ...state,
        selectedBlockIds: newSelectedIds,
        selectedBlockId: newSelectedIds.length > 0 ? newSelectedIds[0] : null,
      };
    }

    case 'SET_ZOOM':
      return {
        ...state,
        zoom: action.payload,
      };

    case 'SET_TEMPLATE_INFO':
      return {
        ...state,
        templateId: action.payload.id,
        templateTitle: action.payload.title,
        templateDescription: action.payload.description,
      };

    case 'LOAD_TEMPLATE': {
      const template = action.payload;
      const data = template.data || DEFAULT_DOCUMENT_DATA;
      const initialHistory: HistoryState[] = [{ blocks: data.blocks || [], zoom: data.zoom || 100 }];
      return {
        ...state,
        blocks: data.blocks || [],
        zoom: data.zoom || 100,
        templateId: template.id,
        templateTitle: template.title,
        templateDescription: template.description,
        selectedBlockId: null,
        selectedBlockIds: [],
        isDirty: false,
        history: initialHistory,
        historyIndex: 0,
      };
    }

    case 'MARK_CLEAN':
      return {
        ...state,
        isDirty: false,
      };

    case 'UNDO': {
      if (state.historyIndex <= 0) return state;
      const prevState = state.history[state.historyIndex - 1];
      return {
        ...state,
        blocks: prevState.blocks,
        zoom: prevState.zoom,
        historyIndex: state.historyIndex - 1,
        isDirty: true,
      };
    }

    case 'REDO': {
      if (state.historyIndex >= state.history.length - 1) return state;
      const nextState = state.history[state.historyIndex + 1];
      return {
        ...state,
        blocks: nextState.blocks,
        zoom: nextState.zoom,
        historyIndex: state.historyIndex + 1,
        isDirty: true,
      };
    }

    case 'RESET': {
      const initialHistory: HistoryState[] = [{ blocks: [], zoom: 100 }];
      return {
        blocks: [],
        selectedBlockId: null,
        selectedBlockIds: [],
        zoom: 100,
        templateId: null,
        templateTitle: '',
        templateDescription: '',
        isDirty: false,
        history: initialHistory,
        historyIndex: 0,
      };
    }

    default:
      return state;
  }
}

const initialState: EditorState = {
  blocks: [],
  selectedBlockId: null,
  selectedBlockIds: [],
  zoom: 100,
  templateId: null,
  templateTitle: '',
  templateDescription: '',
  isDirty: false,
  history: [{ blocks: [], zoom: 100 }],
  historyIndex: 0,
};

export const DocumentBuilderPage: React.FC = () => {
  const [state, dispatch] = useReducer(editorReducer, initialState);
  const filesRef = useRef<{ loadFiles: () => void } | null>(null);

  const selectedBlock = state.blocks.find((b) => b.id === state.selectedBlockId) || null;

  const handleAddBlock = useCallback((type: BlockType) => {
    const newBlock = createDefaultBlock(type);
    dispatch({ type: 'ADD_BLOCK', payload: newBlock });
  }, []);

  const handleSelectBlock = useCallback((id: string | null, addToSelection: boolean = false) => {
    if (addToSelection && id) {
      dispatch({ type: 'TOGGLE_BLOCK_SELECTION', payload: id });
    } else {
      dispatch({ type: 'SELECT_BLOCK', payload: id });
    }
  }, []);

  const handleUpdateBlock = useCallback((id: string, updates: Partial<DocumentBlock>) => {
    dispatch({ type: 'UPDATE_BLOCK', payload: { id, updates } });
  }, []);

  const handleUpdateSelectedBlock = useCallback(
    (updates: Partial<DocumentBlock>) => {
      if (state.selectedBlockId) {
        dispatch({ type: 'UPDATE_BLOCK', payload: { id: state.selectedBlockId, updates } });
      }
    },
    [state.selectedBlockId]
  );

  const handleDeleteBlock = useCallback(() => {
    if (state.selectedBlockIds.length > 1) {
      dispatch({ type: 'DELETE_BLOCKS', payload: state.selectedBlockIds });
    } else if (state.selectedBlockId) {
      dispatch({ type: 'DELETE_BLOCK', payload: state.selectedBlockId });
    }
  }, [state.selectedBlockId, state.selectedBlockIds]);

  const handleTitleChange = useCallback((title: string) => {
    dispatch({
      type: 'SET_TEMPLATE_INFO',
      payload: { id: state.templateId, title, description: state.templateDescription },
    });
  }, [state.templateId, state.templateDescription]);

  const handleDescriptionChange = useCallback((description: string) => {
    dispatch({
      type: 'SET_TEMPLATE_INFO',
      payload: { id: state.templateId, title: state.templateTitle, description },
    });
  }, [state.templateId, state.templateTitle]);

  const handleSave = useCallback(async () => {
    try {
      const data = {
        blocks: state.blocks,
        zoom: state.zoom,
        pageWidth: DEFAULT_DOCUMENT_DATA.pageWidth,
        pageHeight: DEFAULT_DOCUMENT_DATA.pageHeight,
      };

      if (state.templateId) {
        await updateTemplate(state.templateId, {
          title: state.templateTitle || 'Без названия',
          description: state.templateDescription,
          data,
        });
        alert('Шаблон успешно обновлён!');
      } else {
        const newTemplate = await createTemplate({
          title: state.templateTitle || 'Без названия',
          description: state.templateDescription,
          data,
        });
        dispatch({
          type: 'SET_TEMPLATE_INFO',
          payload: {
            id: newTemplate.id,
            title: newTemplate.title,
            description: newTemplate.description,
          },
        });
        alert('Шаблон успешно создан!');
      }
      dispatch({ type: 'MARK_CLEAN' });
    } catch (error) {
      alert(`Ошибка сохранения: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }, [state.blocks, state.zoom, state.templateId, state.templateTitle, state.templateDescription]);

  const handleLoadTemplate = useCallback(async (templateId: number) => {
    try {
      const template = await getTemplate(templateId);
      dispatch({ type: 'LOAD_TEMPLATE', payload: template });
    } catch (error) {
      alert(`Ошибка загрузки шаблона: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }, []);

  const handleUploadFile = useCallback(async (file: File) => {
    try {
      await uploadSourceFile(file, state.templateId || undefined);
      alert(`Файл "${file.name}" успешно загружен и распарсен!`);
    } catch (error) {
      alert(`Ошибка загрузки файла: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }, [state.templateId]);

  const handleUndo = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, []);

  const handleRedo = useCallback(() => {
    dispatch({ type: 'REDO' });
  }, []);

  const handleZoomChange = useCallback((zoom: number) => {
    dispatch({ type: 'SET_ZOOM', payload: zoom });
  }, []);

  const handleNewTemplate = useCallback(() => {
    if (state.isDirty) {
      const confirmed = window.confirm('У вас есть несохранённые изменения. Создать новый шаблон?');
      if (!confirmed) return;
    }
    dispatch({ type: 'RESET' });
  }, [state.isDirty]);

  const handleAlign = useCallback((mode: AlignMode) => {
    if (state.selectedBlockIds.length < 2) return;
    const newBlocks = alignBlocks(state.blocks, state.selectedBlockIds, mode);
    dispatch({ type: 'SET_BLOCKS', payload: newBlocks });
  }, [state.blocks, state.selectedBlockIds]);

  const handleDistribute = useCallback((direction: DistributeDirection) => {
    if (state.selectedBlockIds.length < 3) return;
    const newBlocks = distributeBlocks(state.blocks, state.selectedBlockIds, direction);
    dispatch({ type: 'SET_BLOCKS', payload: newBlocks });
  }, [state.blocks, state.selectedBlockIds]);

  const canUndo = state.historyIndex > 0;
  const canRedo = state.historyIndex < state.history.length - 1;
  const canAlign = state.selectedBlockIds.length >= 2;
  const canDistribute = state.selectedBlockIds.length >= 3;

  return (
    <div className="flex flex-col h-screen bg-[var(--color-sidebar)] text-gray-100 font-sans">
      <Toolbar
        templateTitle={state.templateTitle}
        templateDescription={state.templateDescription}
        zoom={state.zoom}
        canUndo={canUndo}
        canRedo={canRedo}
        isDirty={state.isDirty}
        canAlign={canAlign}
        canDistribute={canDistribute}
        selectedCount={state.selectedBlockIds.length}
        onTitleChange={handleTitleChange}
        onDescriptionChange={handleDescriptionChange}
        onSave={handleSave}
        onLoadTemplate={handleLoadTemplate}
        onUploadFile={handleUploadFile}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onZoomChange={handleZoomChange}
        onNewTemplate={handleNewTemplate}
        onAlignLeft={() => handleAlign('left')}
        onAlignCenter={() => handleAlign('center')}
        onAlignRight={() => handleAlign('right')}
        onAlignTop={() => handleAlign('top')}
        onAlignMiddle={() => handleAlign('middle')}
        onAlignBottom={() => handleAlign('bottom')}
        onDistributeHorizontal={() => handleDistribute('horizontal')}
        onDistributeVertical={() => handleDistribute('vertical')}
      />

      <div className="flex flex-1 overflow-hidden">
        <SidebarBlocks onAddBlock={handleAddBlock} />

        <DocumentCanvas
          blocks={state.blocks}
          selectedBlockId={state.selectedBlockId}
          selectedBlockIds={state.selectedBlockIds}
          zoom={state.zoom}
          pageWidth={DEFAULT_DOCUMENT_DATA.pageWidth}
          pageHeight={DEFAULT_DOCUMENT_DATA.pageHeight}
          onSelectBlock={handleSelectBlock}
          onUpdateBlock={handleUpdateBlock}
        />

        <div className="flex flex-col">
          <InspectorPanel
            selectedBlock={selectedBlock}
            onUpdateBlock={handleUpdateSelectedBlock}
            onDeleteBlock={handleDeleteBlock}
          />
          <SidebarFiles />
        </div>
      </div>
    </div>
  );
};

export default DocumentBuilderPage;
