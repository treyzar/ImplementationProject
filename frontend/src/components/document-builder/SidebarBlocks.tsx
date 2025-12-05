import React from 'react';
import { Type, Table2, Image, PenLine, Square } from 'lucide-react';
import { BlockType } from './types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SidebarBlocksProps {
  onAddBlock: (type: BlockType) => void;
}

interface BlockOption {
  type: BlockType;
  icon: React.ReactNode;
  label: string;
  description: string;
}

const blockOptions: BlockOption[] = [
  {
    type: 'text',
    icon: <Type className="w-5 h-5" />,
    label: 'Текст',
    description: 'Текстовый блок',
  },
  {
    type: 'table',
    icon: <Table2 className="w-5 h-5" />,
    label: 'Таблица',
    description: 'Табличный блок',
  },
  {
    type: 'image',
    icon: <Image className="w-5 h-5" />,
    label: 'Изображение',
    description: 'Блок изображения',
  },
  {
    type: 'signature',
    icon: <PenLine className="w-5 h-5" />,
    label: 'Подпись',
    description: 'Поле для подписи',
  },
  {
    type: 'rectangle',
    icon: <Square className="w-5 h-5" />,
    label: 'Прямоугольник',
    description: 'Геометрическая фигура',
  },
];

export const SidebarBlocks: React.FC<SidebarBlocksProps> = ({ onAddBlock }) => {
  return (
    <Card className="w-[180px] h-full rounded-none border-t-0 border-b-0 border-l-0 flex flex-col">
      <CardHeader className="border-b border-[var(--color-border-dark)] pb-4">
        <CardTitle className="tracking-wider">Блоки</CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full">
          <TooltipProvider delayDuration={300}>
            <div className="flex flex-col gap-2 p-3">
              {blockOptions.map((option) => (
                <Tooltip key={option.type}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      onClick={() => onAddBlock(option.type)}
                      className="flex items-center justify-start gap-3 w-full h-auto p-3 rounded-lg bg-[var(--color-sidebar-accent)] border border-transparent text-gray-100 cursor-pointer transition-all duration-200 hover:bg-[var(--color-primary)] hover:border-[var(--color-primary)] hover:shadow-md"
                    >
                      <span className="text-gray-300">
                        {option.icon}
                      </span>
                      <span className="text-[13px] font-medium">
                        {option.label}
                      </span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-gray-900 text-gray-100">
                    {option.description}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TooltipProvider>
        </ScrollArea>
      </CardContent>
      
      <div className="p-3 text-[11px] text-gray-500 text-center border-t border-[var(--color-border-dark)]">
        Нажмите на блок, чтобы добавить его на холст
      </div>
    </Card>
  );
};

export default SidebarBlocks;
