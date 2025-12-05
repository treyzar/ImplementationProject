import React, { useState, useEffect } from 'react';
import { SourceFileListDTO, SourceFileDTO, ParsedPage } from './types';
import { getSourceFiles, getSourceFile } from '../../api/documentBuilderApi';

interface SidebarFilesProps {
  onRefresh?: () => void;
}

export const SidebarFiles: React.FC<SidebarFilesProps> = ({ onRefresh }) => {
  const [files, setFiles] = useState<SourceFileListDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<SourceFileDTO | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSourceFiles();
      setFiles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки файлов');
    } finally {
      setLoading(false);
    }
  };

  const handleFileClick = async (fileId: number) => {
    try {
      const file = await getSourceFile(fileId);
      setSelectedFile(file);
      setShowModal(true);
    } catch (err) {
      console.error('Ошибка загрузки файла:', err);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} Б`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFileIcon = (mimeType: string): string => {
    if (mimeType.includes('pdf')) return '📕';
    if (mimeType.includes('word') || mimeType.includes('docx')) return '📘';
    return '📄';
  };

  return (
    <div style={styles.sidebar}>
      <div style={styles.header}>
        <h3 style={styles.title}>Файлы</h3>
        <button style={styles.refreshButton} onClick={loadFiles} title="Обновить">
          🔄
        </button>
      </div>

      <div style={styles.filesList}>
        {loading && <div style={styles.loading}>Загрузка...</div>}
        
        {error && <div style={styles.error}>{error}</div>}
        
        {!loading && !error && files.length === 0 && (
          <div style={styles.empty}>
            Нет загруженных файлов
          </div>
        )}
        
        {files.map((file) => (
          <div
            key={file.id}
            style={styles.fileItem}
            onClick={() => handleFileClick(file.id)}
          >
            <span style={styles.fileIcon}>{getFileIcon(file.mime_type)}</span>
            <div style={styles.fileInfo}>
              <div style={styles.fileName}>{file.original_name}</div>
              <div style={styles.fileMeta}>
                {formatFileSize(file.file_size)} • {formatDate(file.uploaded_at)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && selectedFile && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>{selectedFile.original_name}</h3>
              <button
                style={styles.closeButton}
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div style={styles.modalContent}>
              {selectedFile.parsed_content.length === 0 ? (
                <div style={styles.noContent}>Нет содержимого</div>
              ) : (
                selectedFile.parsed_content.map((page: ParsedPage) => (
                  <div key={page.page} style={styles.pageBlock}>
                    <div style={styles.pageHeader}>Страница {page.page}</div>
                    <div style={styles.pageText}>{page.text}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: '220px',
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
  refreshButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '4px',
  },
  filesList: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  loading: {
    color: '#7f8c8d',
    textAlign: 'center',
    padding: '20px',
  },
  error: {
    color: '#e74c3c',
    textAlign: 'center',
    padding: '20px',
    fontSize: '13px',
  },
  empty: {
    color: '#7f8c8d',
    textAlign: 'center',
    padding: '20px',
    fontSize: '13px',
  },
  fileItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '10px',
    backgroundColor: '#34495e',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  fileIcon: {
    fontSize: '24px',
    flexShrink: 0,
  },
  fileInfo: {
    flex: 1,
    minWidth: 0,
  },
  fileName: {
    color: '#ecf0f1',
    fontSize: '13px',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  fileMeta: {
    color: '#7f8c8d',
    fontSize: '11px',
    marginTop: '4px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
  },
  modal: {
    backgroundColor: '#2c3e50',
    borderRadius: '8px',
    width: '80%',
    maxWidth: '800px',
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid #1a252f',
  },
  modalTitle: {
    margin: 0,
    fontSize: '16px',
    color: '#ecf0f1',
    fontWeight: 600,
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: '#7f8c8d',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '4px 8px',
  },
  modalContent: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
  },
  noContent: {
    color: '#7f8c8d',
    textAlign: 'center',
    padding: '40px',
  },
  pageBlock: {
    marginBottom: '24px',
  },
  pageHeader: {
    color: '#3498db',
    fontSize: '14px',
    fontWeight: 600,
    marginBottom: '8px',
    paddingBottom: '8px',
    borderBottom: '1px solid #34495e',
  },
  pageText: {
    color: '#bdc3c7',
    fontSize: '13px',
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap',
    fontFamily: 'monospace',
  },
};

export default SidebarFiles;
