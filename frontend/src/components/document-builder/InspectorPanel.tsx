import React from 'react';
import { DocumentBlock, BlockStyle } from './types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Trash2 } from 'lucide-react';

interface InspectorPanelProps {
  selectedBlock: DocumentBlock | null;
  onUpdateBlock: (updates: Partial<DocumentBlock>) => void;
  onDeleteBlock: () => void;
}

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

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  selectedBlock,
  onUpdateBlock,
  onDeleteBlock,
}) => {
  if (!selectedBlock) {
    return (
      <Card className="w-[260px] h-full rounded-none border-l border-r-0 border-t-0 border-b-0 flex flex-col">
        <CardHeader className="border-b border-[var(--color-border-dark)] pb-4">
          <CardTitle className="tracking-wider">Свойства</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <p className="text-gray-500 text-sm text-center px-4">
            Выберите блок для редактирования
          </p>
        </CardContent>
      </Card>
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
    <Card className="w-[260px] h-full rounded-none border-l border-r-0 border-t-0 border-b-0 flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 border-b border-[var(--color-border-dark)]">
        <CardTitle className="text-sm">Свойства</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDeleteBlock}
          className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-900/20"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>

      <ScrollArea className="flex-1">
        <CardContent className="p-4 space-y-5">
          <div>
            <div className="text-xs font-semibold text-[var(--color-primary)] uppercase tracking-wide mb-3">
              Тип: {getBlockTypeLabel(selectedBlock.type)}
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="text-xs font-semibold text-[var(--color-primary)] uppercase tracking-wide">
              Позиция
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="pos-x" className="text-xs text-gray-400">X</Label>
                <Input
                  id="pos-x"
                  type="number"
                  value={Math.round(selectedBlock.x)}
                  onChange={(e) => handlePositionChange('x', parseInt(e.target.value) || 0)}
                  className="h-8"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pos-y" className="text-xs text-gray-400">Y</Label>
                <Input
                  id="pos-y"
                  type="number"
                  value={Math.round(selectedBlock.y)}
                  onChange={(e) => handlePositionChange('y', parseInt(e.target.value) || 0)}
                  className="h-8"
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="text-xs font-semibold text-[var(--color-primary)] uppercase tracking-wide">
              Размер
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="width" className="text-xs text-gray-400">Ширина</Label>
                <Input
                  id="width"
                  type="number"
                  value={Math.round(selectedBlock.width)}
                  onChange={(e) => handlePositionChange('width', parseInt(e.target.value) || 50)}
                  min={20}
                  className="h-8"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="height" className="text-xs text-gray-400">Высота</Label>
                <Input
                  id="height"
                  type="number"
                  value={Math.round(selectedBlock.height)}
                  onChange={(e) => handlePositionChange('height', parseInt(e.target.value) || 20)}
                  min={20}
                  className="h-8"
                />
              </div>
            </div>
          </div>

          {(selectedBlock.type === 'text' || selectedBlock.type === 'signature') && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="text-xs font-semibold text-[var(--color-primary)] uppercase tracking-wide">
                  Текст
                </div>
                <Textarea
                  value={selectedBlock.content}
                  onChange={(e) => onUpdateBlock({ content: e.target.value })}
                  rows={3}
                  className="resize-none"
                />
              </div>
            </>
          )}

          <Separator />

          <div className="space-y-3">
            <div className="text-xs font-semibold text-[var(--color-primary)] uppercase tracking-wide">
              Шрифт
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-400">Семейство</Label>
              <Select
                value={selectedBlock.style.fontFamily || 'Arial'}
                onValueChange={(value) => handleStyleChange('fontFamily', value)}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Arial">Arial</SelectItem>
                  <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                  <SelectItem value="Courier New">Courier New</SelectItem>
                  <SelectItem value="Georgia">Georgia</SelectItem>
                  <SelectItem value="Verdana">Verdana</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="font-size" className="text-xs text-gray-400">Размер</Label>
                <Input
                  id="font-size"
                  type="number"
                  value={selectedBlock.style.fontSize || 14}
                  onChange={(e) => handleStyleChange('fontSize', parseInt(e.target.value) || 14)}
                  min={8}
                  max={72}
                  className="h-8"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="font-color" className="text-xs text-gray-400">Цвет</Label>
                <div className="flex items-center gap-2">
                  <input
                    id="font-color"
                    type="color"
                    value={selectedBlock.style.color || '#000000'}
                    onChange={(e) => handleStyleChange('color', e.target.value)}
                    className="w-8 h-8 rounded border border-[var(--color-border-dark)] cursor-pointer"
                  />
                  <span className="text-xs text-gray-400">{selectedBlock.style.color || '#000000'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="font-bold" className="text-xs text-gray-400">Жирный</Label>
              <Switch
                id="font-bold"
                checked={selectedBlock.style.fontWeight === 'bold'}
                onCheckedChange={(checked) => handleStyleChange('fontWeight', checked ? 'bold' : 'normal')}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="font-italic" className="text-xs text-gray-400">Курсив</Label>
              <Switch
                id="font-italic"
                checked={selectedBlock.style.fontStyle === 'italic'}
                onCheckedChange={(checked) => handleStyleChange('fontStyle', checked ? 'italic' : 'normal')}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-gray-400">Выравнивание</Label>
              <Select
                value={selectedBlock.style.textAlign || 'left'}
                onValueChange={(value) => handleStyleChange('textAlign', value)}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">По левому краю</SelectItem>
                  <SelectItem value="center">По центру</SelectItem>
                  <SelectItem value="right">По правому краю</SelectItem>
                  <SelectItem value="justify">По ширине</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="text-xs font-semibold text-[var(--color-primary)] uppercase tracking-wide">
              Рамка и фон
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="border-color" className="text-xs text-gray-400">Цвет рамки</Label>
                <div className="flex items-center gap-2">
                  <input
                    id="border-color"
                    type="color"
                    value={selectedBlock.style.borderColor || '#000000'}
                    onChange={(e) => handleStyleChange('borderColor', e.target.value)}
                    className="w-8 h-8 rounded border border-[var(--color-border-dark)] cursor-pointer"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="border-width" className="text-xs text-gray-400">Толщина</Label>
                <Input
                  id="border-width"
                  type="number"
                  value={selectedBlock.style.borderWidth || 0}
                  onChange={(e) => handleStyleChange('borderWidth', parseInt(e.target.value) || 0)}
                  min={0}
                  max={10}
                  className="h-8"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="border-radius" className="text-xs text-gray-400">Скругление</Label>
                <Input
                  id="border-radius"
                  type="number"
                  value={selectedBlock.style.borderRadius || 0}
                  onChange={(e) => handleStyleChange('borderRadius', parseInt(e.target.value) || 0)}
                  min={0}
                  max={50}
                  className="h-8"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bg-color" className="text-xs text-gray-400">Фон</Label>
                <div className="flex items-center gap-2">
                  <input
                    id="bg-color"
                    type="color"
                    value={selectedBlock.style.backgroundColor || '#ffffff'}
                    onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                    className="w-8 h-8 rounded border border-[var(--color-border-dark)] cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </ScrollArea>
    </Card>
  );
};

export default InspectorPanel;
