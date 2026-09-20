import { Delete } from '@mui/icons-material'
import { Alert, Box, CircularProgress, IconButton, Stack, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { useAdminGenres, useDeleteGenre, useUpdateGenre } from '../model/useAdminGenres'
import type { Genre } from '../model/types'

export function GenresTab() {
  const genres = useAdminGenres()
  const deleteGenre = useDeleteGenre()

  if (genres.isLoading) {
    return (
      <Stack sx={{ alignItems: 'center', py: 8 }}>
        <CircularProgress />
      </Stack>
    )
  }

  if (genres.isError) {
    return <Alert severity="error">Не удалось загрузить жанры</Alert>
  }

  return (
    <Stack
      spacing={1}
      sx={{
        maxWidth: 480,
        bgcolor: 'background.paper',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 2px 16px rgba(23,20,15,0.05)',
        p: 1,
      }}
    >
      {genres.data?.map((genre) => (
        <GenreRow key={genre.id} genre={genre} onDelete={() => deleteGenre.mutate(genre.id)} deleting={deleteGenre.isPending} />
      ))}
      {genres.data?.length === 0 && (
        <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
          Жанров пока нет
        </Typography>
      )}
    </Stack>
  )
}

function GenreRow({ genre, onDelete, deleting }: { genre: Genre; onDelete: () => void; deleting: boolean }) {
  const updateGenre = useUpdateGenre()
  const [name, setName] = useState(genre.name)

  const commit = () => {
    const trimmed = name.trim()
    if (trimmed === '' || trimmed === genre.name) {
      setName(genre.name)
      return
    }
    updateGenre.mutate({ id: genre.id, name: trimmed })
  }

  const handleDelete = () => {
    if (window.confirm(`Удалить жанр «${genre.name}»? У товаров с этим жанром он просто будет очищен.`)) {
      onDelete()
    }
  }

  return (
    <Stack
      direction="row"
      spacing={1.5}
      sx={{
        alignItems: 'center',
        borderRadius: 999,
        px: 1,
        py: 0.5,
        transition: 'background-color 200ms ease',
        '&:hover': { bgcolor: 'rgba(140,47,39,0.04)' },
      }}
    >
      <TextField
        variant="standard"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
        }}
        fullWidth
        slotProps={{ input: { disableUnderline: true } }}
      />
      <Box sx={{ width: 20 }}>{updateGenre.isPending && <CircularProgress size={16} />}</Box>
      <IconButton
        size="small"
        onClick={handleDelete}
        disabled={deleting}
        aria-label="Удалить жанр"
        sx={{
          borderRadius: 999,
          transition: 'background-color 200ms ease, color 200ms ease',
          '&:hover': { bgcolor: 'rgba(140,47,39,0.1)', color: '#8C2F27' },
        }}
      >
        <Delete fontSize="small" />
      </IconButton>
    </Stack>
  )
}
