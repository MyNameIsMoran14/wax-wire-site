import { Button, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import type { ProductType } from '@/entities/product'
import type { CatalogFiltersState } from '../model/useCatalogFilters'

const TYPE_OPTIONS: { value: CatalogFiltersState['type']; label: string }[] = [
  { value: 'all', label: 'Всё' },
  { value: 'vinyl', label: 'Пластинки' },
  { value: 'cd', label: 'CD' },
  { value: 'equipment', label: 'Оборудование' },
]

interface CatalogFiltersProps {
  filters: CatalogFiltersState
  onFilterChange: <K extends keyof CatalogFiltersState>(key: K, value: CatalogFiltersState[K]) => void
  onReset: () => void
}

export function CatalogFilters({ filters, onFilterChange, onReset }: CatalogFiltersProps) {
  return (
    <Stack spacing={4} sx={{ width: { xs: '100%', md: 220 }, flexShrink: 0 }}>
      <TextField
        label="Поиск"
        placeholder="Исполнитель, название…"
        size="small"
        value={filters.q}
        onChange={(e) => onFilterChange('q', e.target.value)}
        fullWidth
      />

      <Stack spacing={1.5}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Тип
        </Typography>
        <ToggleButtonGroup
          value={filters.type}
          exclusive
          orientation="vertical"
          onChange={(_, value: ProductType | 'all' | null) => {
            if (value !== null) onFilterChange('type', value)
          }}
          sx={{ alignItems: 'stretch' }}
        >
          {TYPE_OPTIONS.map((option) => (
            <ToggleButton
              key={option.value}
              value={option.value}
              size="small"
              sx={{ justifyContent: 'flex-start', border: 'none', textTransform: 'none' }}
            >
              {option.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Stack>

      <Stack spacing={1.5}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Цена, ₽
        </Typography>
        <Stack direction="row" spacing={1.5}>
          <TextField
            label="от"
            type="number"
            size="small"
            value={filters.priceMin}
            onChange={(e) => onFilterChange('priceMin', e.target.value)}
            fullWidth
          />
          <TextField
            label="до"
            type="number"
            size="small"
            value={filters.priceMax}
            onChange={(e) => onFilterChange('priceMax', e.target.value)}
            fullWidth
          />
        </Stack>
      </Stack>

      <Button onClick={onReset} variant="text" size="small" sx={{ alignSelf: 'flex-start' }}>
        Сбросить фильтры
      </Button>
    </Stack>
  )
}
