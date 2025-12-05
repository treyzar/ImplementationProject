import React, { useState, useEffect } from 'react';
import { DocumentTemplateListDTO } from './types';
import { getTemplates } from '../../api/documentBuilderApi';

interface ToolbarProps {
  templateTitle: string;
  templateDescription: string;
  zoom: number;
  canUndo: boolean;
  canRedo: boolean;
  isDirty: boolean;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onSave: () => void;
  onLoadTemplate: (templateId: number) => void;
  onUploadFile: (file: File) => void;
  onUndo: () => void;
  onRedo: () => void;
  onZoomChange: (zoom: number) => void;
  onNewTemplate: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  templateTitle,
  templateDescription,
  zoom,
  canUndo,
  canRedo,
  isDirty,
  onTitleChange,
  onDescriptionChange,
  onSave,
  onLoadTemplate,
  onUploadFile,
  onUndo,
  onRedo,
  onZoomChange,
  onNewTemplate,
}) => {
  const [templates, setTemplates] = useState<DocumentTemplateListDTO[]>([]);
  const [showLoadDropdown, setShowLoadDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTemplatesList();
  }, []);

  const loadTemplatesList = async () => {
    try {
      setLoading(true);
      const data = await getTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Ошибка загрузки списка шаблонов:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadFile(file);
      e.target.value = '';
    }
  };

  const handleLoadClick = () => {
    setShowLoadDropdown(!showLoadDropdown);
    if (!showLoadDropdown) {
      loadTemplatesList();
    }
  };

  const handleSelectTemplate = (templateId: number) => {
    onLoadTemplate(templateId);
    setShowLoadDropdown(false);
  };

  return (
    <div style={styles.toolbar}>
      <div style={styles.leftSection}>
        <button style={styles.button} onClick={onNewTemplate} title="Новый шаблон">
          📄 Новый
        </button>
        
        <div style={styles.inputGroup}>
          <input
            type="text"
            value={templateTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Название шаблона"
            style={styles.titleInput}
          />
        </div>

        <button
          style={{
            ...styles.button,
            ...styles.saveButton,
            opacity: isDirty ? 1 : 0.7,
          }}
          onClick={onSave}
          title="Сохранить шаблон"
        >
          💾 Сохранить {isDirty ? '*' : ''}
        </button>

        <div style={styles.dropdownContainer}>
          <button
            style={styles.button}
            onClick={handleLoadClick}
            title="Загрузить шаблон"
          >
            📂 Загрузить {loading ? '...' : '▼'}
          </button>
          
          {showLoadDropdown && (
            <div style={styles.dropdown}>
              {templates.length === 0 ? (
                <div style={styles.dropdownItem}>Нет сохранённых шаблонов</div>
              ) : (
                templates.map((template) => (
                  <div
                    key={template.id}
                    style={styles.dropdownItem}
                    onClick={() => handleSelectTemplate(template.id)}
                  >
                    {template.title}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <div style={styles.centerSection}>
        <button
          style={{
            ...styles.button,
            opacity: canUndo ? 1 : 0.5,
          }}
          onClick={onUndo}
          disabled={!canUndo}
          title="Отменить"
        >
          ↩️ Отменить
        </button>
        
        <button
          style={{
            ...styles.button,
            opacity: canRedo ? 1 : 0.5,
          }}
          onClick={onRedo}
          disabled={!canRedo}
          title="Повторить"
        >
          ↪️ Повторить
        </button>

        <div style={styles.separator} />

        <label style={styles.fileLabel}>
          📎 Загрузить файл
          <input
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileChange}
            style={styles.fileInput}
          />
        </label>
      </div>

      <div style={styles.rightSection}>
        <div style={styles.zoomControl}>
          <button
            style={styles.zoomButton}
            onClick={() => onZoomChange(Math.max(50, zoom - 10))}
            title="Уменьшить"
          >
            −
          </button>
          <span style={styles.zoomValue}>{zoom}%</span>
          <button
            style={styles.zoomButton}
            onClick={() => onZoomChange(Math.min(200, zoom + 10))}
            title="Увеличить"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 16px',
    backgroundColor: '#2c3e50',
    borderBottom: '1px solid #1a252f',
    height: '56px',
    boxSizing: 'border-box',
  },
  leftSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  centerSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  button: {
    padding: '8px 12px',
    backgroundColor: '#34495e',
    color: '#ecf0f1',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    transition: 'background-color 0.2s',
  },
  saveButton: {
    backgroundColor: '#27ae60',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  titleInput: {
    padding: '8px 12px',
    backgroundColor: '#34495e',
    color: '#ecf0f1',
    border: '1px solid #4a6278',
    borderRadius: '4px',
    fontSize: '14px',
    width: '200px',
  },
  dropdownContainer: {
    position: 'relative',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: '0',
    backgroundColor: '#34495e',
    border: '1px solid #4a6278',
    borderRadius: '4px',
    minWidth: '200px',
    maxHeight: '300px',
    overflowY: 'auto',
    zIndex: 1000,
    marginTop: '4px',
  },
  dropdownItem: {
    padding: '10px 12px',
    cursor: 'pointer',
    color: '#ecf0f1',
    borderBottom: '1px solid #4a6278',
    transition: 'background-color 0.2s',
  },
  separator: {
    width: '1px',
    height: '24px',
    backgroundColor: '#4a6278',
    margin: '0 8px',
  },
  fileLabel: {
    padding: '8px 12px',
    backgroundColor: '#34495e',
    color: '#ecf0f1',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  fileInput: {
    display: 'none',
  },
  zoomControl: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: '#34495e',
    borderRadius: '4px',
    padding: '4px',
  },
  zoomButton: {
    width: '28px',
    height: '28px',
    backgroundColor: 'transparent',
    color: '#ecf0f1',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomValue: {
    color: '#ecf0f1',
    fontSize: '13px',
    minWidth: '50px',
    textAlign: 'center',
  },
};

export default Toolbar;
