import React, { useState, useEffect, useRef } from 'react';
import { DocumentTemplateListDTO } from './types';
import { getTemplates } from '../../api/documentBuilderApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  FilePlus,
  Save,
  FolderOpen,
  Undo2,
  Redo2,
  Upload,
  Minus,
  Plus,
  ChevronDown,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  AlignHorizontalSpaceAround,
  AlignVerticalSpaceAround,
} from 'lucide-react';

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
  onAlignLeft?: () => void;
  onAlignCenter?: () => void;
  onAlignRight?: () => void;
  onAlignTop?: () => void;
  onAlignMiddle?: () => void;
  onAlignBottom?: () => void;
  onDistributeHorizontal?: () => void;
  onDistributeVertical?: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  templateTitle,
  zoom,
  canUndo,
  canRedo,
  isDirty,
  onTitleChange,
  onSave,
  onLoadTemplate,
  onUploadFile,
  onUndo,
  onRedo,
  onZoomChange,
  onNewTemplate,
  onAlignLeft,
  onAlignCenter,
  onAlignRight,
  onAlignTop,
  onAlignMiddle,
  onAlignBottom,
  onDistributeHorizontal,
  onDistributeVertical,
}) => {
  const [templates, setTemplates] = useState<DocumentTemplateListDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleDropdownOpen = (open: boolean) => {
    setIsDropdownOpen(open);
    if (open) {
      loadTemplatesList();
    }
  };

  const handleSelectTemplate = (templateId: number) => {
    onLoadTemplate(templateId);
    setIsDropdownOpen(false);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center justify-between px-4 py-2 bg-[var(--color-sidebar)] border-b border-[var(--color-border-dark)] h-14">
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={onNewTemplate}>
                <FilePlus className="h-4 w-4" />
                <span className="hidden sm:inline">Новый</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Новый шаблон</TooltipContent>
          </Tooltip>

          <Input
            type="text"
            value={templateTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Название шаблона"
            className="w-40 sm:w-52"
          />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="default"
                size="sm"
                onClick={onSave}
                className={isDirty ? 'opacity-100' : 'opacity-70'}
              >
                <Save className="h-4 w-4" />
                <span className="hidden sm:inline">
                  Сохранить{isDirty ? ' *' : ''}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Сохранить шаблон</TooltipContent>
          </Tooltip>

          <DropdownMenu open={isDropdownOpen} onOpenChange={handleDropdownOpen}>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <FolderOpen className="h-4 w-4" />
                    <span className="hidden sm:inline">Загрузить</span>
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Загрузить шаблон</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="start" className="min-w-[200px] max-h-[300px] overflow-y-auto">
              {loading ? (
                <DropdownMenuItem disabled>Загрузка...</DropdownMenuItem>
              ) : templates.length === 0 ? (
                <DropdownMenuItem disabled>
                  Нет сохранённых шаблонов
                </DropdownMenuItem>
              ) : (
                templates.map((template) => (
                  <DropdownMenuItem
                    key={template.id}
                    onClick={() => handleSelectTemplate(template.id)}
                    className="cursor-pointer"
                  >
                    {template.title}
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onUndo}
                disabled={!canUndo}
              >
                <Undo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Отменить</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onRedo}
                disabled={!canRedo}
              >
                <Redo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Повторить</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-6 mx-1" />

          <div className="hidden md:flex items-center gap-1">
            <ToggleGroup type="single" size="sm" variant="outline">
              <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem
                    value="align-left"
                    onClick={onAlignLeft}
                    aria-label="Выровнять по левому краю"
                  >
                    <AlignLeft className="h-4 w-4" />
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent>По левому краю</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem
                    value="align-center"
                    onClick={onAlignCenter}
                    aria-label="Выровнять по центру"
                  >
                    <AlignCenter className="h-4 w-4" />
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent>По центру</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem
                    value="align-right"
                    onClick={onAlignRight}
                    aria-label="Выровнять по правому краю"
                  >
                    <AlignRight className="h-4 w-4" />
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent>По правому краю</TooltipContent>
              </Tooltip>
            </ToggleGroup>

            <ToggleGroup type="single" size="sm" variant="outline">
              <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem
                    value="align-top"
                    onClick={onAlignTop}
                    aria-label="Выровнять по верхнему краю"
                  >
                    <AlignStartVertical className="h-4 w-4" />
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent>По верхнему краю</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem
                    value="align-middle"
                    onClick={onAlignMiddle}
                    aria-label="Выровнять по середине"
                  >
                    <AlignCenterVertical className="h-4 w-4" />
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent>По середине</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem
                    value="align-bottom"
                    onClick={onAlignBottom}
                    aria-label="Выровнять по нижнему краю"
                  >
                    <AlignEndVertical className="h-4 w-4" />
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent>По нижнему краю</TooltipContent>
              </Tooltip>
            </ToggleGroup>

            <ToggleGroup type="single" size="sm" variant="outline">
              <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem
                    value="distribute-h"
                    onClick={onDistributeHorizontal}
                    aria-label="Распределить по горизонтали"
                  >
                    <AlignHorizontalSpaceAround className="h-4 w-4" />
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent>Распределить по горизонтали</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem
                    value="distribute-v"
                    onClick={onDistributeVertical}
                    aria-label="Распределить по вертикали"
                  >
                    <AlignVerticalSpaceAround className="h-4 w-4" />
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent>Распределить по вертикали</TooltipContent>
              </Tooltip>
            </ToggleGroup>
          </div>

          <Separator orientation="vertical" className="h-6 mx-1 hidden md:block" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={handleUploadClick}>
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Загрузить файл</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Загрузить PDF или DOCX файл</TooltipContent>
          </Tooltip>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <div className="flex items-center gap-1 bg-[var(--color-sidebar-accent)] rounded-lg p-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onZoomChange(Math.max(50, zoom - 10))}
              >
                <Minus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Уменьшить</TooltipContent>
          </Tooltip>

          <span className="text-sm text-gray-200 min-w-[50px] text-center">
            {zoom}%
          </span>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onZoomChange(Math.min(200, zoom + 10))}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Увеличить</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Toolbar;
