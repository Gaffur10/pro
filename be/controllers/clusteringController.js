import hasil_cluster from '../model/hasil.js';
import nilai_Siswa from '../model/nilai_siswa.js';
import Siswa from '../model/siswaModel.js';

// Simple K-Means implementation
function kMeans(data, k, maxIterations = 100) {
  if (data.length === 0) return { clusters: [], centroids: [] };

  // Initialize centroids randomly
  let centroids = [];
  for (let i = 0; i < k; i++) {
    const randomIndex = Math.floor(Math.random() * data.length);
    centroids.push(data[randomIndex].rata_rata);
  }

  let clusters = [];
  let iterations = 0;

  while (iterations < maxIterations) {
    // Assign points to nearest centroid
    clusters = data.map(point => {
      let minDistance = Infinity;
      let clusterIndex = 0;

      centroids.forEach((centroid, index) => {
        const distance = Math.abs(point.rata_rata - centroid);
        if (distance < minDistance) {
          minDistance = distance;
          clusterIndex = index;
        }
      });

      return {
        ...point,
        cluster: clusterIndex,
        distance: minDistance
      };
    });

    // Calculate new centroids
    const newCentroids = [];
    for (let i = 0; i < k; i++) {
      const clusterPoints = clusters.filter(p => p.cluster === i);
      if (clusterPoints.length > 0) {
        const avg = clusterPoints.reduce((sum, p) => sum + p.rata_rata, 0) / clusterPoints.length;
        newCentroids.push(avg);
      } else {
        newCentroids.push(centroids[i]);
      }
    }

    // Check convergence
    const centroidChange = centroids.every((centroid, i) => 
      Math.abs(centroid - newCentroids[i]) < 0.001
    );

    if (centroidChange) break;

    centroids = newCentroids;
    iterations++;
  }

  return { clusters, centroids };
}

export const runClustering = async (req, res) => {
  try {
    let { algoritma = 'kmeans', jumlah_cluster = 3, semester = '' } = req.body;

    // Normalize algoritma parameter
    if (algoritma === 'k-means') algoritma = 'kmeans';
    

    // Validate jumlah_cluster
    jumlah_cluster = parseInt(jumlah_cluster);
    if (isNaN(jumlah_cluster) || jumlah_cluster <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Jumlah cluster harus berupa angka positif'
      });
    }

    // Get all nilai data
    const whereClause = {};
    if (semester) {
      whereClause.semester = semester;
    }

    const nilaiData = await nilai_Siswa.findAll({
      where: whereClause,
      include: [
        {
          model: Siswa,
          as: 'siswa',
          attributes: ['id', 'nis', 'nama', 'kelas']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    if (nilaiData.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tidak ada data nilai untuk diproses'
      });
    }

    // Prepare data for clustering
    const data = nilaiData.map(item => ({
      id: item.id,
      siswa_id: item.siswa_id,
      rata_rata: parseFloat(item.rata_rata),
      nis: item.siswa.nis,
      nama: item.siswa.nama,
      kelas: item.siswa.kelas,
      semester: item.semester,
      tahun_ajaran: item.tahun_ajaran
    }));

    if (!data || data.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Tidak ada data siswa/nilai untuk clustering"
      });
    }
    if (data.length < jumlah_cluster) {
      return res.status(400).json({
        success: false,
        message: "Jumlah cluster melebihi jumlah data siswa"
      });
    }

    // Run clustering
    const { clusters, centroids } = kMeans(data, jumlah_cluster);

    // Determine cluster labels based on average values descending
    const indexedCentroids = centroids.map((value, index) => ({ value, originalIndex: index }));
    indexedCentroids.sort((a, b) => b.value - a.value);

    const clusterLabels = {};
    const clusterNumberMap = {}; // Map original centroid index to new cluster number (1-based)
    indexedCentroids.forEach((indexedCentroid, newIndex) => {
      const { originalIndex } = indexedCentroid;
      clusterNumberMap[originalIndex] = newIndex + 1; // cluster number: 1 is highest centroid
      if (newIndex === 0) clusterLabels[originalIndex] = 'Tinggi';
      else if (newIndex === 1) clusterLabels[originalIndex] = 'Sedang';
      else clusterLabels[originalIndex] = 'Rendah';
    });

    // Clear previous clustering results
    await hasil_cluster.destroy({ where: {} });

    // Save clustering results
    const clusteringResults = clusters.map(cluster => {
      const newClusterNumber = clusterNumberMap[cluster.cluster];
      return {
        siswa_id: cluster.siswa_id,
        cluster: newClusterNumber,
        keterangan: clusterLabels[cluster.cluster],
        semester: cluster.semester,
        tahun_ajaran: cluster.tahun_ajaran,
        jarak_centroid: cluster.distance,
        algoritma,
        jumlah_cluster
      };
    });

    await hasil_cluster.bulkCreate(clusteringResults);

    // Prepare response data
    const responseData = clusters.map(cluster => {
      const newClusterNumber = clusterNumberMap[cluster.cluster];
      return {
        id: cluster.id,
        siswa_id: cluster.siswa_id,
        nis: cluster.nis,
        nama: cluster.nama,
        kelas: cluster.kelas,
        rata_rata: cluster.rata_rata,
        cluster: newClusterNumber,
        keterangan: clusterLabels[cluster.cluster],
        semester: cluster.semester,
        tahun_ajaran: cluster.tahun_ajaran,
        jarak_centroid: cluster.distance
      };
    });

    // Calculate cluster statistics
    const clusterStats = {};
    Object.values(clusterLabels).forEach(label => {
      const clusterData = responseData.filter(item => item.keterangan === label);
      clusterStats[label.toLowerCase()] = {
        count: clusterData.length,
        percentage: ((clusterData.length / responseData.length) * 100).toFixed(1),
        avg_rata_rata: clusterData.length > 0 
          ? (clusterData.reduce((sum, item) => sum + item.rata_rata, 0) / clusterData.length).toFixed(2)
          : 0
      };
    });

    res.json({
      success: true,
      message: 'Clustering berhasil dijalankan',
      data: {
        results: responseData,
        statistics: {
          total_siswa: responseData.length,
          jumlah_cluster,
          algoritma,
          cluster_stats: clusterStats,
          centroids: centroids.map(c => c.toFixed(2))
        }
      }
    });
  } catch (error) {
    console.error('Run clustering error:', error.message);
    console.error(error.stack);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

export const getClusteringResults = async (req, res) => {
  try {
    const { page = 1, limit = 10, cluster = '', all = false } = req.query;
    
    const whereClause = {};
    if (cluster) {
      whereClause.keterangan = cluster;
    }

    // If all=true or limit is very high, return all clustering results without pagination
    if (all === 'true' || parseInt(limit) >= 1000) {
      const results = await hasil_cluster.findAll({
        where: whereClause,
        include: [
          {
            model: Siswa,
            as: 'siswa',
            attributes: ['id', 'nis', 'nama', 'kelas']
          }
        ],
        order: [['created_at', 'DESC']]
      });

      const totalCount = await hasil_cluster.count({
        where: whereClause
      });

      const formattedResults = results.map(row => ({
        id: row.id,
        siswa_id: row.siswa_id,
        nis: row.siswa.nis,
        nama: row.siswa.nama,
        kelas: row.siswa.kelas,
        cluster: row.cluster,
        keterangan: row.keterangan,
        jarak_centroid: row.jarak_centroid,
        algoritma: row.algoritma,
        jumlah_cluster: row.jumlah_cluster
      }));

      return res.json({
        success: true,
        data: formattedResults,
        pagination: {
          current_page: 1,
          total_pages: 1,
          total_items: totalCount,
          items_per_page: totalCount
        }
      });
    }

    // Normal pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await hasil_cluster.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Siswa,
          as: 'siswa',
          attributes: ['id', 'nis', 'nama', 'kelas']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    const results = rows.map(row => ({
      id: row.id,
      siswa_id: row.siswa_id,
      nis: row.siswa.nis,
      nama: row.siswa.nama,
      kelas: row.siswa.kelas,
      cluster: row.cluster,
      keterangan: row.keterangan,
      jarak_centroid: row.jarak_centroid,
      algoritma: row.algoritma,
      jumlah_cluster: row.jumlah_cluster
    }));

    res.json({
      success: true,
      data: results,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(count / parseInt(limit)),
        total_items: count,
        items_per_page: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get clustering results error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

export const getClusteringStats = async (req, res) => {
  try {
    const totalResults = await hasil_cluster.count();
    
    const clusterStats = await hasil_cluster.findAll({
      attributes: [
        'keterangan',
        [hasil_cluster.sequelize.fn('COUNT', '*'), 'jumlah']
      ],
      group: ['keterangan']
    });

    const latestClustering = await hasil_cluster.findOne({
      order: [['created_at', 'DESC']],
      attributes: ['algoritma', 'jumlah_cluster', 'created_at']
    });

    const stats = {};
    clusterStats.forEach(stat => {
      const label = stat.dataValues.keterangan.toLowerCase();
      stats[label] = {
        count: parseInt(stat.dataValues.jumlah),
        percentage: ((parseInt(stat.dataValues.jumlah) / totalResults) * 100).toFixed(1)
      };
    });

    // Calculate average distance from latest clustering results
    let averageDistance = 0;
    if (latestClustering) {
      const distances = await hasil_cluster.findAll({
        attributes: ['jarak_centroid']
      });
      if (distances.length > 0) {
        const totalDistance = distances.reduce((sum, d) => sum + parseFloat(d.jarak_centroid), 0);
        averageDistance = totalDistance / distances.length;
      }
    }

    res.json({
      success: true,
      data: {
        total_results: totalResults,
        cluster_distribution: stats,
        average_distance: averageDistance,
        algorithm_used: latestClustering ? latestClustering.algoritma : "K-Means",
        clusters_count: latestClustering ? latestClustering.jumlah_cluster : 3
      }
    });
  } catch (error) {
    console.error('Get clustering stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

export const clearClusteringResults = async (req, res) => {
  try {
    await hasil_cluster.destroy({ where: {} });

    res.json({
      success: true,
      message: 'Hasil clustering berhasil dihapus'
    });
  } catch (error) {
    console.error('Clear clustering results error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};