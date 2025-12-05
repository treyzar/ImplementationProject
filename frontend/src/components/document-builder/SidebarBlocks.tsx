import React from 'react';
import { BlockType } from './types';

interface SidebarBlocksProps {
  onAddBlock: (type: BlockType) => void;
}

interface BlockOption {
  type: BlockType;
  icon: string;
  label: string;
  description: string;
}

const blockOptions: BlockOption[] = [
  {
    type: 'text',
    icon: '📝',
    label: 'Текст',
    description: 'Текстовый блок',
  },
  {
    type: 'table',
    icon: '📊',
    label: 'Таблица',
    description: 'Табличный блок',
  },
  {
    type: 'image',
    icon: '🖼️',
    label: 'Изображение',
    description: 'Блок изображения',
  },
  {
    type: 'signature',
    icon: '✍️',
    label: 'Подпись',
    description: 'Поле для подписи',
  },
  {
    type: 'rectangle',
    icon: '⬜',
    label: 'Прямоугольник',
    description: 'Геометрическая фигура',
  },
];

export const SidebarBlocks: React.FC<SidebarBlocksProps> = ({ onAddBlock }) => {
  return (
    <div style={styles.sidebar}>
      <div style={styles.header}>
        <h3 style={styles.title}>Блоки</h3>
      </div>
      
      <div style={styles.blocksList}>
        {blockOptions.map((option) => (
          <div
            key={option.type}
            style={styles.blockItem}
            onClick={() => onAddBlock(option.type)}
            title={option.description}
          >
            <span style={styles.blockIcon}>{option.icon}</span>
            <span style={styles.blockLabel}>{option.label}</span>
          </div>
        ))}
      </div>
      
      <div style={styles.hint}>
        Нажмите на блок, чтобы добавить его на холст
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: '180px',
    backgroundColor: '#2c3e50',
    borderRight: '1px solid #1a252f',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  header: {
    padding: '16px',
    borderBottom: '1px solid #1a252f',
  },
  title: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 600,
    color: '#ecf0f1',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  blocksList: {
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1,
    overflowY: 'auto',
  },
  blockItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px',
    backgroundColor: '#34495e',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: '1px solid transparent',
  },
  blockIcon: {
    fontSize: '20px',
  },
  blockLabel: {
    color: '#ecf0f1',
    fontSize: '13px',
    fontWeight: 500,
  },
  hint: {
    padding: '12px',
    fontSize: '11px',
    color: '#7f8c8d',
    textAlign: 'center',
    borderTop: '1px solid #1a252f',
  },
};

export default SidebarBlocks;
