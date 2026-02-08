import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragStartEvent, DragOverEvent, DragEndEvent } from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useAtom } from 'jotai'
import { GripVertical } from 'lucide-react'
import { widgetLayoutAtom } from '@/lib/atoms'
import { widgetRegistry } from '@/lib/widgets'

type ColumnId = 'left' | 'center' | 'right'

function SortableWidget({ id }: { id: string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const widget = widgetRegistry[id]

  const Component = widget.component

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div
        {...attributes}
        {...listeners}
        className="absolute -left-2 top-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing bg-widget-background rounded p-0.5"
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>
      <Component />
    </div>
  )
}

function DroppableColumn({
  id,
  items,
  className,
}: {
  id: ColumnId
  items: string[]
  className: string
}) {
  return (
    <SortableContext items={items} strategy={verticalListSortingStrategy}>
      <div className={className} data-column={id}>
        {items.map((widgetId) => (
          <SortableWidget key={widgetId} id={widgetId} />
        ))}
      </div>
    </SortableContext>
  )
}

function findColumn(
  layout: Record<ColumnId, string[]>,
  id: string,
): ColumnId | null {
  for (const col of ['left', 'center', 'right'] as ColumnId[]) {
    if (layout[col].includes(id)) return col
  }
  return null
}

export function WidgetGrid() {
  const [layout, setLayout] = useAtom(widgetLayoutAtom)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeWidgetId = active.id as string
    const overId = over.id as string

    const activeCol = findColumn(layout, activeWidgetId)
    let overCol = findColumn(layout, overId)

    // If overId is a column id itself (empty column droppable), handle it
    if (!overCol && ['left', 'center', 'right'].includes(overId)) {
      overCol = overId as ColumnId
    }

    if (!activeCol || !overCol || activeCol === overCol) return

    setLayout((prev) => {
      const activeItems = [...prev[activeCol]]
      const overItems = [...prev[overCol]]

      const activeIndex = activeItems.indexOf(activeWidgetId)
      activeItems.splice(activeIndex, 1)

      const overIndex = overItems.indexOf(overId)
      const insertIndex = overIndex >= 0 ? overIndex : overItems.length

      overItems.splice(insertIndex, 0, activeWidgetId)

      return {
        ...prev,
        [activeCol]: activeItems,
        [overCol]: overItems,
      }
    })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeWidgetId = active.id as string
    const overId = over.id as string

    const activeCol = findColumn(layout, activeWidgetId)
    const overCol = findColumn(layout, overId)

    if (!activeCol || !overCol) return

    if (activeCol === overCol) {
      const items = layout[activeCol]
      const oldIndex = items.indexOf(activeWidgetId)
      const newIndex = items.indexOf(overId)

      if (oldIndex !== newIndex) {
        setLayout((prev) => ({
          ...prev,
          [activeCol]: arrayMove(prev[activeCol], oldIndex, newIndex),
        }))
      }
    }
  }

  const activeWidget = activeId ? widgetRegistry[activeId] : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="text-highlight grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <DroppableColumn
          id="left"
          items={layout.left}
          className="col-span-1 min-w-[258px] gap-4 flex flex-col"
        />
        <DroppableColumn
          id="center"
          items={layout.center}
          className="md:col-span-2 gap-4 flex flex-col"
        />
        <DroppableColumn
          id="right"
          items={layout.right}
          className="col-span-1 gap-4 flex flex-col"
        />
      </div>

      <DragOverlay>
        {activeWidget ? (
          <div className="opacity-80 rotate-2 scale-105">
            <activeWidget.component />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
