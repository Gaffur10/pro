import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ClusteringPage from './page';
import * as api from '@/lib/api';

jest.mock('@/lib/api');

describe('ClusteringPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('menampilkan judul dan loading saat awal render', () => {
    render(<ClusteringPage />);
    expect(screen.getByText(/Clustering Nilai/i)).toBeInTheDocument();
    expect(screen.getByText(/Memuat data/i)).toBeInTheDocument();
  });

  it('memanggil API getClusteringResults dan getClusteringStats', async () => {
    (api.getClusteringResults as jest.Mock).mockResolvedValue({ data: [] });
    (api.getClusteringStats as jest.Mock).mockResolvedValue({ data: { total_results: 0, algorithm_used: 'kmeans', clusters_count: 3 } });
    render(<ClusteringPage />);
    await waitFor(() => {
      expect(api.getClusteringResults).toHaveBeenCalled();
      expect(api.getClusteringStats).toHaveBeenCalled();
    });
  });
}); 