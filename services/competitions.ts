import { Competition } from '@/types/competition';

export async function getLatestCompetitions(): Promise<Competition[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/competitions`, {
    next: { revalidate: 3600 } // Cache for 1 hour
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch competitions');
  }

  return res.json();
}

export async function getFeaturedCompetitions(): Promise<Competition[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/competitions/featured`, {
    next: { revalidate: 3600 }
  });

  if (!res.ok) {
    throw new Error('Failed to fetch featured competitions');
  }

  return res.json();
}
