'use client';

import styled from 'styled-components';
import { useState, useEffect, useCallback } from 'react';
import { AdminGuard } from '@/hooks/useAdmin';
import { createProduct, deleteProduct } from '@/app/actions/admin';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';
import { Loader2, Upload, Plus, DollarSign, Tag, Image as ImageIcon, FileText, User, Trash2, Music, Search } from 'lucide-react';
import { Product } from '@/types';

const Container = styled.div`
  max-width: 800px;
  margin: 4rem auto;
  padding: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Form = styled.form`
  background: white;
  padding: 2.5rem;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: relative;
`;

const Label = styled.label`
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
  &:focus { outline: none; border-color: #111; }
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;
  &:focus { outline: none; border-color: #111; }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
`;

const SubmitButton = styled.button`
  background: #111;
  color: white;
  padding: 1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
  transition: background 0.2s;
  &:hover { background: #000; }
  &:disabled { opacity: 0.7; cursor: not-allowed; }
`;

const ErrorMsg = styled.span`
  color: #ef4444;
  font-size: 0.8rem;
`;

/* --- Spotify Autocomplete Dropdown --- */
const Dropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  z-index: 50;
  max-height: 280px;
  overflow-y: auto;
`;

const DropdownItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.75rem;
  border: none;
  background: none;
  cursor: pointer;
  text-align: left;
  transition: background 0.1s;
  &:hover { background: #f5f5f5; }
`;

const DropdownThumb = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  background: #eee;
`;

const AlbumThumb = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 6px;
  object-fit: cover;
  background: #eee;
`;

const DropdownText = styled.div`
  display: flex;
  flex-direction: column;
`;

const DropdownName = styled.span`
  font-weight: 600;
  font-size: 0.85rem;
  color: #111;
`;

const DropdownSub = styled.span`
  font-size: 0.75rem;
  color: #888;
`;

/* --- Selected Spotify Badge --- */
const SpotifyBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #1DB95420;
  border: 1px solid #1DB95440;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-size: 0.85rem;
  color: #1DB954;
  font-weight: 600;
`;

const ClearButton = styled.button`
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  font-size: 0.75rem;
  margin-left: auto;
  &:hover { text-decoration: underline; }
`;

/* --- Product List --- */
const ProductList = styled.div`
  margin-top: 3rem;
`;

const ProductItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: white;
  border-radius: 12px;
  margin-bottom: 0.75rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  transition: box-shadow 0.2s;
  &:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
`;

const ProductInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
`;

const ProductThumb = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
  background: #f0f0f0;
`;

const ProductMeta = styled.div`
  display: flex;
  flex-direction: column;
`;

const ProductNameStyled = styled.span`
  font-weight: 600;
  font-size: 0.95rem;
  color: #111;
`;

const ProductArtist = styled.span`
  font-size: 0.8rem;
  color: #888;
  text-transform: uppercase;
`;

const ProductPrice = styled.span`
  font-weight: 700;
  color: #10CFBD;
  margin-right: 1.5rem;
  font-size: 0.95rem;
`;

const DeleteButton = styled.button`
  background: none;
  border: 1px solid #fecaca;
  color: #ef4444;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  &:hover { background: #fef2f2; border-color: #ef4444; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const ImagePreview = styled.img`
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  margin-top: 0.5rem;
`;

/* --- Spotify types --- */
interface SpotifyArtist {
  id: string;
  name: string;
  image: string | null;
  genres: string[];
}

interface SpotifyAlbum {
  id: string;
  name: string;
  image: string | null;
  releaseDate: string;
}

export default function AdminPage() {
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [errors, setErrors] = useState<any>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Spotify autocomplete state
  const [artistQuery, setArtistQuery] = useState('');
  const [artistResults, setArtistResults] = useState<SpotifyArtist[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<SpotifyArtist | null>(null);
  const [showArtistDropdown, setShowArtistDropdown] = useState(false);
  const [kpopArtists, setKpopArtists] = useState<SpotifyArtist[]>([]);

  const [albumResults, setAlbumResults] = useState<SpotifyAlbum[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<SpotifyAlbum | null>(null);
  const [showAlbumDropdown, setShowAlbumDropdown] = useState(false);
  const [searchingArtist, setSearchingArtist] = useState(false);
  const [searchingAlbum, setSearchingAlbum] = useState(false);

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (error) console.error('Error loading products:', error);
    else setProducts(data || []);
  };

  useEffect(() => {
    fetchProducts();
    // Pre-load K-Pop artists for suggestions
    fetch('/api/spotify/kpop').then(r => r.json()).then(d => {
      // The API returns pre-formatted artists matching our local interface
      if (d.artists) setKpopArtists(d.artists);
    }).catch(() => { });
  }, []);

  // Debounced artist search
  useEffect(() => {
    if (selectedArtist) {
      setArtistResults([]);
      setShowArtistDropdown(false);
      return;
    }

    // Show K-Pop suggestions when empty
    if (artistQuery.length < 2) {
      setArtistResults(kpopArtists);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchingArtist(true);
      try {
        const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(artistQuery)}&type=artist`);
        const data = await res.json();
        setArtistResults(data.results || []);
        setShowArtistDropdown(true);
      } catch { setArtistResults([]); }
      setSearchingArtist(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [artistQuery, selectedArtist, kpopArtists]);

  // Fetch albums when artist is selected
  useEffect(() => {
    if (!selectedArtist) {
      setAlbumResults([]);
      return;
    }

    const fetchAlbums = async () => {
      setSearchingAlbum(true);
      try {
        const res = await fetch(`/api/spotify/search?artistId=${selectedArtist.id}`);
        const data = await res.json();
        setAlbumResults(data.results || []);
      } catch { setAlbumResults([]); }
      setSearchingAlbum(false);
    };

    fetchAlbums();
  }, [selectedArtist]);

  const handleSelectArtist = useCallback((artist: SpotifyArtist) => {
    setSelectedArtist(artist);
    setArtistQuery(artist.name);
    setShowArtistDropdown(false);
    setSelectedAlbum(null);
  }, []);

  const handleSelectAlbum = useCallback((album: SpotifyAlbum) => {
    setSelectedAlbum(album);
    setShowAlbumDropdown(false);
  }, []);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      let imageUrl = '';
      if (imageFile) {
        setUploading(true);
        const uploadData = new FormData();
        uploadData.append('file', imageFile);
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: uploadData });
        const uploadResult = await uploadRes.json();
        setUploading(false);
        if (!uploadRes.ok || !uploadResult.success) {
          toast.error(uploadResult.error || 'Error al subir imagen');
          setLoading(false);
          return;
        }
        imageUrl = uploadResult.imageUrl;
      } else {
        toast.error('Selecciona una imagen para el producto');
        setLoading(false);
        return;
      }

      const formData = new FormData(e.currentTarget);
      const data = {
        name: formData.get('name') as string,
        price: parseFloat(formData.get('price') as string),
        category: formData.get('category') as string,
        artist: selectedArtist?.name || artistQuery || (formData.get('artist') as string),
        image_url: imageUrl,
        description: formData.get('description') as string,
        spotify_album_id: selectedAlbum?.id || undefined,
      };

      const result = await createProduct(data);
      if (result.success) {
        toast.success('Producto creado exitosamente');
        (e.target as HTMLFormElement).reset();
        setImageFile(null);
        setImagePreview(null);
        setSelectedArtist(null);
        setSelectedAlbum(null);
        setArtistQuery('');
        fetchProducts();
      } else {
        if (typeof result.error === 'object') setErrors(result.error);
        else toast.error(result.error as string);
      }
    } catch {
      toast.error('Error inesperado');
    }
    setLoading(false);
  }

  async function handleDelete(productId: string, productName: string) {
    if (!confirm(`¿Estás seguro de eliminar "${productName}"? Esta acción no se puede deshacer.`)) return;
    setDeletingId(productId);
    const result = await deleteProduct(productId);
    if (result.success) {
      toast.success('Producto eliminado');
      setProducts(prev => prev.filter(p => p.id !== productId));
    } else {
      toast.error(result.error || 'Error al eliminar');
    }
    setDeletingId(null);
  }

  return (
    <AdminGuard>
      <Container>
        <Title><Upload size={32} /> Panel de Administrador</Title>

        <Form onSubmit={handleSubmit}>
          <h2 style={{ marginBottom: '1rem' }}>Agregar Nuevo Producto</h2>

          <FormGroup>
            <Label><Tag size={16} /> Nombre del Producto</Label>
            <Input name="name" placeholder="Ej: Lightstick Ver. 2" required />
            {errors.name && <ErrorMsg>{errors.name[0]}</ErrorMsg>}
          </FormGroup>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormGroup>
              <Label><DollarSign size={16} /> Precio (USD)</Label>
              <Input name="price" type="number" step="0.01" placeholder="0.00" required />
              {errors.price && <ErrorMsg>{errors.price[0]}</ErrorMsg>}
            </FormGroup>

            <FormGroup>
              <Label><User size={16} /> Artista / Grupo</Label>
              <div style={{ position: 'relative' }}>
                <Input
                  name="artist"
                  placeholder="Buscar en Spotify..."
                  value={artistQuery}
                  onChange={(e) => {
                    setArtistQuery(e.target.value);
                    if (selectedArtist) setSelectedArtist(null);
                  }}
                  onFocus={() => {
                    if (!selectedArtist && artistResults.length > 0) setShowArtistDropdown(true);
                  }}
                  onBlur={() => setTimeout(() => setShowArtistDropdown(false), 200)}
                  required
                  autoComplete="off"
                  style={{ width: '100%' }}
                />
                {searchingArtist && (
                  <div style={{ position: 'absolute', right: 10, top: 12 }}>
                    <Loader2 size={16} className="animate-spin" style={{ color: '#888' }} />
                  </div>
                )}
                {showArtistDropdown && artistResults.length > 0 && (
                  <Dropdown>
                    {artistResults.map(artist => (
                      <DropdownItem key={artist.id} type="button" onClick={() => handleSelectArtist(artist)}>
                        {artist.image ? <DropdownThumb src={artist.image} alt={artist.name} /> : <Search size={20} />}
                        <DropdownText>
                          <DropdownName>{artist.name}</DropdownName>
                          <DropdownSub>{artist.genres.join(', ') || 'Artista'}</DropdownSub>
                        </DropdownText>
                      </DropdownItem>
                    ))}
                  </Dropdown>
                )}
              </div>
              {selectedArtist && (
                <SpotifyBadge>
                  <Music size={14} /> {selectedArtist.name}
                  <ClearButton type="button" onClick={() => { setSelectedArtist(null); setArtistQuery(''); setSelectedAlbum(null); }}>
                    Cambiar
                  </ClearButton>
                </SpotifyBadge>
              )}
              {errors.artist && <ErrorMsg>{errors.artist[0]}</ErrorMsg>}
            </FormGroup>
          </div>

          {/* Spotify Album Selector */}
          {selectedArtist && (
            <FormGroup>
              <Label><Music size={16} /> Álbum de Spotify (opcional)</Label>
              {searchingAlbum ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#888', fontSize: '0.85rem' }}>
                  <Loader2 size={14} className="animate-spin" /> Buscando álbumes...
                </div>
              ) : selectedAlbum ? (
                <SpotifyBadge>
                  {selectedAlbum.image && <AlbumThumb src={selectedAlbum.image} alt={selectedAlbum.name} style={{ width: 24, height: 24 }} />}
                  {selectedAlbum.name}
                  <ClearButton type="button" onClick={() => { setSelectedAlbum(null); setShowAlbumDropdown(true); }}>
                    Cambiar
                  </ClearButton>
                </SpotifyBadge>
              ) : (
                <div style={{ position: 'relative' }}>
                  <Input
                    placeholder="Seleccionar álbum..."
                    onFocus={() => setShowAlbumDropdown(true)}
                    readOnly
                    style={{ cursor: 'pointer', width: '100%' }}
                  />
                  {showAlbumDropdown && albumResults.length > 0 && (
                    <Dropdown>
                      {albumResults.map(album => (
                        <DropdownItem key={album.id} type="button" onClick={() => handleSelectAlbum(album)}>
                          {album.image && <AlbumThumb src={album.image} alt={album.name} />}
                          <DropdownText>
                            <DropdownName>{album.name}</DropdownName>
                            <DropdownSub>{album.releaseDate}</DropdownSub>
                          </DropdownText>
                        </DropdownItem>
                      ))}
                    </Dropdown>
                  )}
                </div>
              )}
            </FormGroup>
          )}

          <FormGroup>
            <Label>Categoría</Label>
            <Select name="category" required>
              <option value="albums">Álbumes</option>
              <option value="merch">Merch</option>
              <option value="photocards">Photocards</option>
              <option value="clothing">Ropa</option>
            </Select>
            {errors.category && <ErrorMsg>{errors.category[0]}</ErrorMsg>}
          </FormGroup>

          <FormGroup>
            <Label><ImageIcon size={16} /> Imagen del Producto</Label>
            <Input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleImageChange}
              style={{ padding: '0.5rem' }}
            />
            {imagePreview && <ImagePreview src={imagePreview} alt="Preview" />}
            {uploading && <span style={{ color: '#888', fontSize: '0.85rem' }}>Subiendo imagen...</span>}
            {errors.image_url && <ErrorMsg>{errors.image_url[0]}</ErrorMsg>}
          </FormGroup>

          <FormGroup>
            <Label><FileText size={16} /> Descripción</Label>
            <TextArea name="description" placeholder="Detalles del producto..." required />
            {errors.description && <ErrorMsg>{errors.description[0]}</ErrorMsg>}
          </FormGroup>

          <SubmitButton type="submit" disabled={loading || uploading}>
            {loading ? <Loader2 className="animate-spin" /> : <Plus />}
            {uploading ? 'Subiendo imagen...' : loading ? 'Guardando...' : 'Crear Producto'}
          </SubmitButton>
        </Form>

        <ProductList>
          <h2 style={{ marginBottom: '1rem' }}>Productos Existentes ({products.length})</h2>
          {products.length === 0 ? (
            <p style={{ color: '#888' }}>No hay productos en la base de datos.</p>
          ) : (
            products.map(product => (
              <ProductItem key={product.id}>
                <ProductInfo>
                  <ProductThumb
                    src={product.image_url}
                    alt={product.name}
                    onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder.png'; }}
                  />
                  <ProductMeta>
                    <ProductNameStyled>{product.name}</ProductNameStyled>
                    <ProductArtist>{product.artist}</ProductArtist>
                  </ProductMeta>
                </ProductInfo>
                <ProductPrice>${product.price.toFixed(2)}</ProductPrice>
                <DeleteButton
                  onClick={() => handleDelete(product.id, product.name)}
                  disabled={deletingId === product.id}
                  title="Eliminar producto"
                >
                  {deletingId === product.id ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Trash2 size={18} />
                  )}
                </DeleteButton>
              </ProductItem>
            ))
          )}
        </ProductList>
      </Container>
    </AdminGuard>
  );
}
