import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const CATEGORY_MAP = {
  // direct
  rings: 'rings',
  earrings: 'earrings',
  necklaces: 'necklaces',
  pendants: 'pendants',
  bracelets: 'bracelets',
  sets: 'sets',
  wedding: 'wedding',
  // mapped
  bangles: 'bangles',
  kadas: 'kadas',
  anklets: 'anklets',
  chains: 'chains',
  mangalsutra: 'mangalsutra',
  'nose-pins': 'nose-pins',
  'toe-rings': 'toe-rings',
  'engagement-rings': 'rings',
  all: '',
};

export default function CategoryRedirect() {
  const navigate = useNavigate();
  const { material, slug } = useParams();

  useEffect(() => {
    const mat = String(material || '').toLowerCase();
    const rawSlug = String(slug || '').toLowerCase();
    const category = CATEGORY_MAP[rawSlug];

    // Build query string
    const params = new URLSearchParams();
    if (mat) params.set('material', mat);
    if (category) params.set('category', category);

    // Fallback to products if unknown slug
    navigate(`/products${params.toString() ? `?${params.toString()}` : ''}`);
  }, [material, slug, navigate]);

  return null;
}
