import { Close, Delete, Edit } from '@mui/icons-material'
import { Alert, Avatar, Box, Button, CircularProgress, IconButton, Stack, TextField, Typography } from '@mui/material'
import { type PointerEvent as ReactPointerEvent, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { resolveAssetUrl } from '@/shared/config/env'
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog'
import { FlipCard } from '@/shared/ui/FlipCard'
import { useAdminGenres, useDeleteGenre, useUpdateGenre } from '../model/useAdminGenres'
import { useAdminProducts } from '../model/useAdminProducts'
import type { AdminProduct, Genre } from '../model/types'

function pluralizeAlbums(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return 'альбом'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'альбома'
  return 'альбомов'
}

export function GenresTab() {
  const genres = useAdminGenres()
  const products = useAdminProducts()
  const deleteGenre = useDeleteGenre()

  const [selectedGenreId, setSelectedGenreId] = useState<number | null>(null)
  const [editingGenre, setEditingGenre] = useState<Genre | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Genre | null>(null)

  const countByGenre = useMemo(() => {
    const counts = new Map<number, number>()
    for (const product of products.data ?? []) {
      if (product.genre) counts.set(product.genre.id, (counts.get(product.genre.id) ?? 0) + 1)
    }
    return counts
  }, [products.data])

  // First cover found for each genre, used as the tile's artwork — most
  // genres won't have one yet (covers are uploaded per-product separately),
  // so the tile falls back to a plain text face when there's nothing to show.
  const coverByGenre = useMemo(() => {
    const covers = new Map<number, string>()
    for (const product of products.data ?? []) {
      if (product.genre && product.cover_url && !covers.has(product.genre.id)) {
        covers.set(product.genre.id, product.cover_url)
      }
    }
    return covers
  }, [products.data])

  const genreAlbums = useMemo(
    () => (products.data ?? []).filter((product) => product.genre?.id === selectedGenreId),
    [products.data, selectedGenreId],
  )
  const selectedGenre = genres.data?.find((genre) => genre.id === selectedGenreId) ?? null

  const confirmDelete = () => {
    if (!pendingDelete) return
    deleteGenre.mutate(pendingDelete.id, {
      onSuccess: () => {
        if (selectedGenreId === pendingDelete.id) setSelectedGenreId(null)
        setPendingDelete(null)
      },
    })
  }

  // Animates the panel's height instead of letting it snap to its new size —
  // without this, picking a genre with a different album count instantly
  // resizes the page and the footer jumps, which (on a page that just got
  // shorter than the current scroll position) can flash bare browser
  // background below it for a frame.
  const contentRef = useRef<HTMLDivElement>(null)
  const [panelHeight, setPanelHeight] = useState(0)
  useLayoutEffect(() => {
    setPanelHeight(contentRef.current?.scrollHeight ?? 0)
  }, [selectedGenreId, genreAlbums.length])

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
    <Stack spacing={3}>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 200px)', gap: 3 }}>
        {genres.data?.map((genre) => (
          <GenreTile
            key={genre.id}
            genre={genre}
            count={countByGenre.get(genre.id) ?? 0}
            coverUrl={coverByGenre.get(genre.id) ?? null}
            selected={selectedGenreId === genre.id}
            editing={editingGenre?.id === genre.id}
            onSelect={() => setSelectedGenreId((id) => (id === genre.id ? null : genre.id))}
            onStartEdit={() => setEditingGenre(genre)}
            onStopEdit={() => setEditingGenre(null)}
            onDelete={() => setPendingDelete(genre)}
          />
        ))}
        {genres.data?.length === 0 && (
          <Typography color="text.secondary" sx={{ gridColumn: '1 / -1', py: 2, textAlign: 'center' }}>
            Жанров пока нет
          </Typography>
        )}
      </Box>

      <Box sx={{ height: panelHeight, overflow: 'hidden', transition: 'height 320ms cubic-bezier(0.22, 1, 0.36, 1)' }}>
        <Box ref={contentRef}>
          {selectedGenre && (
            <Box
              sx={{
                bgcolor: 'background.paper',
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 2px 16px rgba(23,20,15,0.05)',
                p: 2,
              }}
            >
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography sx={{ fontWeight: 700 }}>Альбомы «{selectedGenre.name}»</Typography>
                <IconButton size="small" onClick={() => setSelectedGenreId(null)} aria-label="Закрыть" sx={{ borderRadius: 999 }}>
                  <Close fontSize="small" />
                </IconButton>
              </Stack>

              {genreAlbums.length === 0 ? (
                <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                  В этом жанре пока нет альбомов
                </Typography>
              ) : (
                <Stack spacing={0.5}>
                  {genreAlbums.map((album: AdminProduct) => (
                    <Stack key={album.id} direction="row" spacing={2} sx={{ alignItems: 'center', borderRadius: 2, px: 1, py: 0.75 }}>
                      <Avatar
                        variant="rounded"
                        src={resolveAssetUrl(album.cover_url) ?? undefined}
                        sx={{ width: 36, height: 36, borderRadius: 1.5 }}
                      />
                      <Stack sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                          {album.artist}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {album.title}
                        </Typography>
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                        {album.price} ₽
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              )}
            </Box>
          )}
        </Box>
      </Box>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Удалить жанр?"
        description={pendingDelete ? `У товаров с жанром «${pendingDelete.name}» он будет просто очищен.` : undefined}
        loading={deleteGenre.isPending}
        onConfirm={confirmDelete}
        onClose={() => setPendingDelete(null)}
      />
    </Stack>
  )
}

interface GenreTileProps {
  genre: Genre
  count: number
  coverUrl: string | null
  selected: boolean
  editing: boolean
  onSelect: () => void
  onStartEdit: () => void
  onStopEdit: () => void
  onDelete: () => void
}

function GenreTile({ genre, count, coverUrl, selected, editing, onSelect, onStartEdit, onStopEdit, onDelete }: GenreTileProps) {
  const updateGenre = useUpdateGenre()
  const [name, setName] = useState(genre.name)
  const hasCover = coverUrl !== null
  const resolvedCover = resolveAssetUrl(coverUrl)

  const commit = () => {
    const trimmed = name.trim()
    if (trimmed !== '' && trimmed !== genre.name) {
      updateGenre.mutate({ id: genre.id, name: trimmed })
    } else {
      setName(genre.name)
    }
    onStopEdit()
  }

  // FlipCard drives its flip off raw pointerdown/pointerup on the root, not
  // click — stopping propagation only on click (as a plain tile would) isn't
  // enough to keep these controls from also triggering a flip underneath them.
  const stopPointer = (e: ReactPointerEvent) => e.stopPropagation()

  const iconSx = hasCover
    ? { borderRadius: 999, bgcolor: 'rgba(23,20,15,0.4)', color: '#fff', '&:hover': { bgcolor: 'rgba(23,20,15,0.6)' } }
    : { borderRadius: 999, '&:hover': { bgcolor: 'rgba(140,47,39,0.1)', color: '#8C2F27' } }

  const front = (
    <Box
      sx={{
        position: 'relative',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: hasCover ? 'flex-end' : 'center',
        ...(hasCover
          ? {
              backgroundImage: `linear-gradient(180deg, rgba(23,20,15,0) 40%, rgba(23,20,15,0.85) 100%), url(${resolvedCover})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : {}),
        p: 2.5,
      }}
    >
      <Stack direction="row" spacing={0.25} sx={{ position: 'absolute', top: 8, right: 8 }} onPointerDown={stopPointer}>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation()
            onStartEdit()
          }}
          aria-label="Переименовать"
          sx={iconSx}
        >
          <Edit sx={{ fontSize: 16 }} />
        </IconButton>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          aria-label="Удалить жанр"
          sx={iconSx}
        >
          <Delete sx={{ fontSize: 16 }} />
        </IconButton>
      </Stack>

      {editing ? (
        <TextField
          autoFocus
          size="small"
          value={name}
          onPointerDown={stopPointer}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => setName(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
          }}
          sx={hasCover ? { '& .MuiOutlinedInput-root': { bgcolor: 'background.paper' } } : undefined}
        />
      ) : (
        <>
          <Typography sx={{ fontWeight: 700, fontSize: 20, color: hasCover ? '#fff' : 'text.primary' }} noWrap>
            {genre.name}
          </Typography>
          <Typography variant="body2" sx={{ color: hasCover ? 'rgba(255,255,255,0.8)' : 'text.secondary' }}>
            {count} {pluralizeAlbums(count)}
          </Typography>
        </>
      )}
    </Box>
  )

  const back = (
    <Box
      sx={{
        position: 'relative',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: 0.5,
        ...(hasCover
          ? {
              backgroundImage: `linear-gradient(rgba(23,20,15,0.72), rgba(23,20,15,0.72)), url(${resolvedCover})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : {}),
      }}
    >
      <Typography sx={{ fontWeight: 800, fontSize: 36, lineHeight: 1, color: hasCover ? '#fff' : '#8C2F27' }}>{count}</Typography>
      <Typography variant="body2" sx={{ color: hasCover ? 'rgba(255,255,255,0.8)' : 'text.secondary' }}>
        {pluralizeAlbums(count)}
      </Typography>
      <Button
        size="small"
        variant={selected ? 'outlined' : 'contained'}
        onPointerDown={stopPointer}
        onClick={(e) => {
          e.stopPropagation()
          onSelect()
        }}
        sx={{
          borderRadius: 999,
          mt: 1,
          ...(hasCover && !selected ? { bgcolor: '#fff', color: '#17140F', '&:hover': { bgcolor: '#fff' } } : {}),
          ...(hasCover && selected ? { borderColor: '#fff', color: '#fff' } : {}),
        }}
      >
        {selected ? 'Скрыть' : 'Показать'}
      </Button>
    </Box>
  )

  return (
    <Box
      sx={{
        borderRadius: '20px',
        boxShadow: selected ? '0 0 0 2px #8C2F27' : 'none',
        transition: 'box-shadow 200ms ease',
        width: 200,
      }}
    >
      <FlipCard
        front={front}
        back={back}
        width={200}
        height={280}
        radius={20}
        background="#FFFFFF"
        color="#17140F"
        shadowColor="#17140F"
        shadowOpacity={0.12}
        tiltMax={8}
        glareOpacity={0.12}
        ariaLabel={`Жанр ${genre.name}`}
      />
    </Box>
  )
}
