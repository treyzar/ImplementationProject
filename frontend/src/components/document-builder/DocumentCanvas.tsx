import React, { useRef, useState, useCallback } from 'react';
import { DocumentBlock, TableData } from './types';

interface DocumentCanvasProps {
  blocks: DocumentBlock[];
  selectedBlockId: string | null;
  zoom: number;
  pageWidth: number;
  pageHeight: number;
  onSelectBlock: (id: string | null) => void;
  onUpdateBlock: (id: string, updates: Partial<DocumentBlock>) => void;
}

export const DocumentCanvas: React.FC<DocumentCanvasProps> = ({
  blocks,
  selectedBlockId,
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

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).classList.contains('canvas-page')) {
      onSelectBlock(null);
    }
  };

  const handleBlockMouseDown = (e: React.MouseEvent, block: DocumentBlock) => {
    e.stopPropagation();
    onSelectBlock(block.id);

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const offsetX = (e.clientX - rect.left) / scale - block.x;
    const offsetY = (e.clientY - rect.top) / scale - block.y;

    setDragging(block.id);
    setDragOffset({ x: offsetX, y: offsetY });
  };

  const handleResizeMouseDown = (e: React.MouseEvent, block: DocumentBlock) => {
    e.stopPropagation();
    onSelectBlock(block.id);

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
              '🖼️ Изображение'
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

  return (
    <div
      style={styles.canvasContainer}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        ref={canvasRef}
        className="canvas-page"
        style={{
          ...styles.page,
          width: pageWidth * scale,
          height: pageHeight * scale,
          transform: `scale(1)`,
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
                  boxShadow: selectedBlockId === block.id ? '0 0 0 2px #3498db' : 'none',
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                }}
                onMouseDown={(e) => handleBlockMouseDown(e, block)}
              >
                {renderBlockContent(block)}

                {selectedBlockId === block.id && (
                  <div
                    style={styles.resizeHandle}
                    onMouseDown={(e) => handleResizeMouseDown(e, block)}
                  />
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  canvasContainer: {
    flex: 1,
    backgroundColor: '#1a252f',
    overflow: 'auto',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: '40px',
  },
  page: {
    backgroundColor: '#ffffff',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
    position: 'relative',
    flexShrink: 0,
  },
  resizeHandle: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 12,
    height: 12,
    backgroundColor: '#3498db',
    cursor: 'nwse-resize',
    borderRadius: '2px',
    border: '2px solid white',
  },
};

export default DocumentCanvas;
