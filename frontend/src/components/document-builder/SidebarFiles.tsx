import React, { useState, useEffect } from 'react';
import { SourceFileListDTO, SourceFileDTO, ParsedPage } from './types';
import { getSourceFiles, getSourceFile } from '../../api/documentBuilderApi';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FileText, FileType2, File, RefreshCw } from 'lucide-react';

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

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) {
      return <FileText className="w-6 h-6 text-[var(--color-primary)] flex-shrink-0" />;
    }
    if (mimeType.includes('word') || mimeType.includes('docx')) {
      return <FileType2 className="w-6 h-6 text-blue-400 flex-shrink-0" />;
    }
    return <File className="w-6 h-6 text-gray-400 flex-shrink-0" />;
  };

  return (
    <Card className="w-[220px] h-full rounded-none border-l border-r-0 border-t-0 border-b-0 flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 border-b border-[var(--color-border-dark)]">
        <CardTitle className="text-sm">Файлы</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={loadFiles}
          title="Обновить"
          className="h-8 w-8"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-3 flex flex-col gap-2">
            {loading && (
              <div className="text-gray-500 text-center py-5">
                Загрузка...
              </div>
            )}

            {error && (
              <div className="text-red-400 text-center py-5 text-sm">
                {error}
              </div>
            )}

            {!loading && !error && files.length === 0 && (
              <div className="text-gray-500 text-center py-5 text-sm">
                Нет загруженных файлов
              </div>
            )}

            {files.map((file) => (
              <div
                key={file.id}
                onClick={() => handleFileClick(file.id)}
                className="flex items-start gap-3 p-3 bg-[var(--color-sidebar-accent)] rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-600 hover:shadow-md hover:scale-[1.02] group"
              >
                {getFileIcon(file.mime_type)}
                <div className="flex-1 min-w-0">
                  <div className="text-gray-100 text-sm font-medium truncate group-hover:text-white">
                    {file.original_name}
                  </div>
                  <div className="text-gray-500 text-xs mt-1">
                    {formatFileSize(file.file_size)} • {formatDate(file.uploaded_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {selectedFile?.original_name}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1 mt-4">
            <div className="pr-4">
              {selectedFile?.parsed_content.length === 0 ? (
                <div className="text-gray-500 text-center py-10">
                  Нет содержимого
                </div>
              ) : (
                selectedFile?.parsed_content.map((page: ParsedPage) => (
                  <div key={page.page} className="mb-6">
                    <div className="text-[var(--color-primary)] text-sm font-semibold mb-2 pb-2 border-b border-[var(--color-sidebar-accent)]">
                      Страница {page.page}
                    </div>
                    <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-mono">
                      {page.text}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default SidebarFiles;
