import React from 'react';
import { DocumentBlock, BlockStyle, TableData } from './types';

interface InspectorPanelProps {
  selectedBlock: DocumentBlock | null;
  onUpdateBlock: (updates: Partial<DocumentBlock>) => void;
  onDeleteBlock: () => void;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  selectedBlock,
  onUpdateBlock,
  onDeleteBlock,
}) => {
  if (!selectedBlock) {
    return (
      <div style={styles.panel}>
        <div style={styles.header}>
          <h3 style={styles.title}>Свойства</h3>
        </div>
        <div style={styles.emptyState}>
          Выберите блок для редактирования
        </div>
      </div>
    );
  }

  const handleStyleChange = (key: keyof BlockStyle, value: string | number) => {
    onUpdateBlock({
      style: {
        ...selectedBlock.style,
        [key]: value,
      },
    });
  };

  const handlePositionChange = (key: 'x' | 'y' | 'width' | 'height' | 'rotation', value: number) => {
    onUpdateBlock({ [key]: value });
  };

  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <h3 style={styles.title}>Свойства</h3>
        <button style={styles.deleteButton} onClick={onDeleteBlock} title="Удалить блок">
          🗑️
        </button>
      </div>

      <div style={styles.content}>
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Тип: {getBlockTypeLabel(selectedBlock.type)}</div>
        </div>

        <div style={styles.section}>
          <div style={styles.sectionTitle}>Позиция</div>
          <div style={styles.row}>
            <label style={styles.label}>X:</label>
            <input
              type="number"
              value={Math.round(selectedBlock.x)}
              onChange={(e) => handlePositionChange('x', parseInt(e.target.value) || 0)}
              style={styles.input}
            />
          </div>
          <div style={styles.row}>
            <label style={styles.label}>Y:</label>
            <input
              type="number"
              value={Math.round(selectedBlock.y)}
              onChange={(e) => handlePositionChange('y', parseInt(e.target.value) || 0)}
              style={styles.input}
            />
          </div>
        </div>

        <div style={styles.section}>
          <div style={styles.sectionTitle}>Размер</div>
          <div style={styles.row}>
            <label style={styles.label}>Ширина:</label>
            <input
              type="number"
              value={Math.round(selectedBlock.width)}
              onChange={(e) => handlePositionChange('width', parseInt(e.target.value) || 50)}
              style={styles.input}
              min={20}
            />
          </div>
          <div style={styles.row}>
            <label style={styles.label}>Высота:</label>
            <input
              type="number"
              value={Math.round(selectedBlock.height)}
              onChange={(e) => handlePositionChange('height', parseInt(e.target.value) || 20)}
              style={styles.input}
              min={20}
            />
          </div>
        </div>

        {(selectedBlock.type === 'text' || selectedBlock.type === 'signature') && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Текст</div>
            <textarea
              value={selectedBlock.content}
              onChange={(e) => onUpdateBlock({ content: e.target.value })}
              style={styles.textarea}
              rows={3}
            />
          </div>
        )}

        <div style={styles.section}>
          <div style={styles.sectionTitle}>Шрифт</div>
          <div style={styles.row}>
            <label style={styles.label}>Семейство:</label>
            <select
              value={selectedBlock.style.fontFamily || 'Arial'}
              onChange={(e) => handleStyleChange('fontFamily', e.target.value)}
              style={styles.select}
            >
              <option value="Arial">Arial</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Courier New">Courier New</option>
              <option value="Georgia">Georgia</option>
              <option value="Verdana">Verdana</option>
            </select>
          </div>
          <div style={styles.row}>
            <label style={styles.label}>Размер:</label>
            <input
              type="number"
              value={selectedBlock.style.fontSize || 14}
              onChange={(e) => handleStyleChange('fontSize', parseInt(e.target.value) || 14)}
              style={styles.input}
              min={8}
              max={72}
            />
          </div>
          <div style={styles.row}>
            <label style={styles.label}>Цвет:</label>
            <input
              type="color"
              value={selectedBlock.style.color || '#000000'}
              onChange={(e) => handleStyleChange('color', e.target.value)}
              style={styles.colorInput}
            />
          </div>
          <div style={styles.row}>
            <label style={styles.label}>Жирный:</label>
            <input
              type="checkbox"
              checked={selectedBlock.style.fontWeight === 'bold'}
              onChange={(e) => handleStyleChange('fontWeight', e.target.checked ? 'bold' : 'normal')}
              style={styles.checkbox}
            />
          </div>
          <div style={styles.row}>
            <label style={styles.label}>Курсив:</label>
            <input
              type="checkbox"
              checked={selectedBlock.style.fontStyle === 'italic'}
              onChange={(e) => handleStyleChange('fontStyle', e.target.checked ? 'italic' : 'normal')}
              style={styles.checkbox}
            />
          </div>
          <div style={styles.row}>
            <label style={styles.label}>Выравнивание:</label>
            <select
              value={selectedBlock.style.textAlign || 'left'}
              onChange={(e) => handleStyleChange('textAlign', e.target.value)}
              style={styles.select}
            >
              <option value="left">По левому краю</option>
              <option value="center">По центру</option>
              <option value="right">По правому краю</option>
              <option value="justify">По ширине</option>
            </select>
          </div>
        </div>

        <div style={styles.section}>
          <div style={styles.sectionTitle}>Рамка и фон</div>
          <div style={styles.row}>
            <label style={styles.label}>Цвет рамки:</label>
            <input
              type="color"
              value={selectedBlock.style.borderColor || '#000000'}
              onChange={(e) => handleStyleChange('borderColor', e.target.value)}
              style={styles.colorInput}
            />
          </div>
          <div style={styles.row}>
            <label style={styles.label}>Толщина:</label>
            <input
              type="number"
              value={selectedBlock.style.borderWidth || 0}
              onChange={(e) => handleStyleChange('borderWidth', parseInt(e.target.value) || 0)}
              style={styles.input}
              min={0}
              max={10}
            />
          </div>
          <div style={styles.row}>
            <label style={styles.label}>Скругление:</label>
            <input
              type="number"
              value={selectedBlock.style.borderRadius || 0}
              onChange={(e) => handleStyleChange('borderRadius', parseInt(e.target.value) || 0)}
              style={styles.input}
              min={0}
              max={50}
            />
          </div>
          <div style={styles.row}>
            <label style={styles.label}>Фон:</label>
            <input
              type="color"
              value={selectedBlock.style.backgroundColor || '#ffffff'}
              onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
              style={styles.colorInput}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

function getBlockTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    text: 'Текст',
    table: 'Таблица',
    image: 'Изображение',
    signature: 'Подпись',
    rectangle: 'Прямоугольник',
  };
  return labels[type] || type;
}

const styles: Record<string, React.CSSProperties> = {
  panel: {
    width: '260px',
    backgroundColor: '#2c3e50',
    borderLeft: '1px solid #1a252f',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  header: {
    padding: '16px',
    borderBottom: '1px solid #1a252f',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 600,
    color: '#ecf0f1',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  deleteButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '4px 8px',
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px',
  },
  emptyState: {
    padding: '40px 20px',
    color: '#7f8c8d',
    textAlign: 'center',
    fontSize: '13px',
  },
  section: {
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '1px solid #34495e',
  },
  sectionTitle: {
    color: '#3498db',
    fontSize: '12px',
    fontWeight: 600,
    marginBottom: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '8px',
    gap: '8px',
  },
  label: {
    color: '#bdc3c7',
    fontSize: '12px',
    minWidth: '80px',
  },
  input: {
    flex: 1,
    padding: '6px 8px',
    backgroundColor: '#34495e',
    border: '1px solid #4a6278',
    borderRadius: '4px',
    color: '#ecf0f1',
    fontSize: '12px',
  },
  select: {
    flex: 1,
    padding: '6px 8px',
    backgroundColor: '#34495e',
    border: '1px solid #4a6278',
    borderRadius: '4px',
    color: '#ecf0f1',
    fontSize: '12px',
  },
  textarea: {
    width: '100%',
    padding: '8px',
    backgroundColor: '#34495e',
    border: '1px solid #4a6278',
    borderRadius: '4px',
    color: '#ecf0f1',
    fontSize: '12px',
    resize: 'vertical',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  colorInput: {
    width: '40px',
    height: '28px',
    padding: '2px',
    backgroundColor: '#34495e',
    border: '1px solid #4a6278',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  checkbox: {
    width: '16px',
    height: '16px',
    cursor: 'pointer',
  },
};

export default InspectorPanel;
