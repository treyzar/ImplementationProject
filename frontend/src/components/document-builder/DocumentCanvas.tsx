import React, { useRef, useState, useCallback } from 'react';
import { DocumentBlock, TableData } from './types';

interface DocumentCanvasProps {
  blocks: DocumentBlock[];
  selectedBlockId: string | null;
  selectedBlockIds: string[];
  zoom: number;
  pageWidth: number;
  pageHeight: number;
  onSelectBlock: (id: string | null, addToSelection?: boolean) => void;
  onUpdateBlock: (id: string, updates: Partial<DocumentBlock>) => void;
}

export const DocumentCanvas: React.FC<DocumentCanvasProps> = ({
  blocks,
  selectedBlockId,
  selectedBlockIds,
  zoom,
  pageWidth,
  pageHeight,
  onSelectBlock,
  onUpdateBlock,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizing, setResizing] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const scale = zoom / 100;

  const isBlockSelected = (blockId: string) => selectedBlockIds.includes(blockId);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).classList.contains('canvas-page')) {
      onSelectBlock(null);
    }
  };

  const handleBlockMouseDown = (e: React.MouseEvent, block: DocumentBlock) => {
    e.stopPropagation();
    
    const isShiftPressed = e.shiftKey;
    onSelectBlock(block.id, isShiftPressed);

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const offsetX = (e.clientX - rect.left) / scale - block.x;
    const offsetY = (e.clientY - rect.top) / scale - block.y;

    setDragging(block.id);
    setDragOffset({ x: offsetX, y: offsetY });
  };

  const handleResizeMouseDown = (e: React.MouseEvent, block: DocumentBlock) => {
    e.stopPropagation();
    onSelectBlock(block.id, false);

    setResizing(block.id);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: block.width,
      height: block.height,
    });
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (dragging) {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const newX = (e.clientX - rect.left) / scale - dragOffset.x;
        const newY = (e.clientY - rect.top) / scale - dragOffset.y;

        const clampedX = Math.max(0, Math.min(pageWidth - 50, newX));
        const clampedY = Math.max(0, Math.min(pageHeight - 50, newY));

        onUpdateBlock(dragging, { x: clampedX, y: clampedY });
      }

      if (resizing) {
        const deltaX = (e.clientX - resizeStart.x) / scale;
        const deltaY = (e.clientY - resizeStart.y) / scale;

        const newWidth = Math.max(50, resizeStart.width + deltaX);
        const newHeight = Math.max(30, resizeStart.height + deltaY);

        onUpdateBlock(resizing, { width: newWidth, height: newHeight });
      }
    },
    [dragging, resizing, dragOffset, resizeStart, scale, pageWidth, pageHeight, onUpdateBlock]
  );

  const handleMouseUp = () => {
    setDragging(null);
    setResizing(null);
  };

  const renderBlockContent = (block: DocumentBlock) => {
    switch (block.type) {
      case 'text':
      case 'signature':
        return (
          <div
            style={{
              width: '100%',
              height: '100%',
              padding: block.style.padding || 8,
              boxSizing: 'border-box',
              overflow: 'hidden',
              fontFamily: block.style.fontFamily,
              fontSize: block.style.fontSize,
              fontWeight: block.style.fontWeight,
              fontStyle: block.style.fontStyle,
              textAlign: block.style.textAlign as React.CSSProperties['textAlign'],
              color: block.style.color,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {block.content}
          </div>
        );

      case 'table':
        return renderTable(block.tableData);

      case 'image':
        return (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f5f5f5',
              color: '#999',
              fontSize: '12px',
            }}
          >
            {block.imageUrl ? (
              <img
                src={block.imageUrl}
                alt="Image"
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              />
            ) : (
              'Изображение'
            )}
          </div>
        );

      case 'rectangle':
        return null;

      default:
        return <div>{block.content}</div>;
    }
  };

  const renderTable = (tableData?: TableData) => {
    if (!tableData || !tableData.rows.length) {
      return (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#999',
            fontSize: '12px',
          }}
        >
          Пустая таблица
        </div>
      );
    }

    return (
      <table style={{ width: '100%', height: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          {tableData.rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  colSpan={cell.colspan}
                  rowSpan={cell.rowspan}
                  style={{
                    border: '1px solid #333',
                    padding: '4px 8px',
                    fontSize: '12px',
                    backgroundColor:
                      tableData.headerRows && rowIndex < tableData.headerRows ? '#e0e0e0' : 'transparent',
                    fontWeight: tableData.headerRows && rowIndex < tableData.headerRows ? 'bold' : 'normal',
                  }}
                >
                  {cell.content}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const getBlockSelectionStyles = (block: DocumentBlock): React.CSSProperties => {
    const isSelected = isBlockSelected(block.id);
    const isPrimarySelection = block.id === selectedBlockId;
    
    if (!isSelected) {
      return {};
    }
    
    return {
      boxShadow: isPrimarySelection 
        ? '0 0 0 2px var(--color-primary), 0 0 0 4px rgba(231, 63, 12, 0.3)' 
        : '0 0 0 2px var(--color-primary-light)',
    };
  };

  return (
    <div
      className="flex-1 bg-[#1a252f] overflow-auto flex items-start justify-center p-10"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        ref={canvasRef}
        className="canvas-page bg-white shadow-xl flex-shrink-0 relative"
        style={{
          width: pageWidth * scale,
          height: pageHeight * scale,
        }}
        onClick={handleCanvasClick}
      >
        <div
          style={{
            width: pageWidth,
            height: pageHeight,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            position: 'relative',
            backgroundColor: '#ffffff',
          }}
        >
          {blocks
            .sort((a, b) => a.zIndex - b.zIndex)
            .map((block) => (
              <div
                key={block.id}
                style={{
                  position: 'absolute',
                  left: block.x,
                  top: block.y,
                  width: block.width,
                  height: block.height,
                  transform: block.rotation ? `rotate(${block.rotation}deg)` : undefined,
                  backgroundColor: block.style.backgroundColor || 'transparent',
                  border: `${block.style.borderWidth || 0}px solid ${block.style.borderColor || 'transparent'}`,
                  borderRadius: block.style.borderRadius || 0,
                  cursor: dragging === block.id ? 'grabbing' : 'grab',
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                  ...getBlockSelectionStyles(block),
                }}
                onMouseDown={(e) => handleBlockMouseDown(e, block)}
              >
                {renderBlockContent(block)}

                {isBlockSelected(block.id) && (
                  <div
                    className="absolute -right-1 -bottom-1 w-3 h-3 bg-[var(--color-primary)] cursor-nwse-resize rounded-sm border-2 border-white"
                    onMouseDown={(e) => handleResizeMouseDown(e, block)}
                  />
                )}
              </div>
            ))}
        </div>
      </div>
      
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-[var(--color-sidebar)] px-4 py-2 rounded-lg text-xs text-gray-400 shadow-lg">
        Shift+клик для множественного выбора
      </div>
    </div>
  );
};

export default DocumentCanvas;
