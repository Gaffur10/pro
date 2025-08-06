import Siswa from '../model/siswaModel.js';
import nilai_Siswa from '../model/nilai_siswa.js';
import hasil_cluster from '../model/hasil.js';
import User from '../model/userModel.js';

export const getDashboardStats = async (req, res) => {
  try {
    // Get basic counts with error handling
    let totalSiswa = 0;
    let totalNilai = 0;
    let totalUsers = 0;
    let totalClustering = 0;

    try {
      totalSiswa = await Siswa.count();
    } catch (error) {
      console.error('Error counting siswa:', error);
    }

    try {
      totalNilai = await nilai_Siswa.count();
    } catch (error) {
      console.error('Error counting nilai:', error);
    }

    try {
      totalUsers = await User.count();
    } catch (error) {
      console.error('Error counting users:', error);
    }

    try {
      totalClustering = await hasil_cluster.count();
    } catch (error) {
      console.error('Error counting clustering:', error);
    }

    // Get nilai statistics with error handling
    let avgRataRata = null;
    let siswaBerprestasi = 0;
    let perluPerhatian = 0;

    try {
      avgRataRata = await nilai_Siswa.findOne({
        attributes: [
          [nilai_Siswa.sequelize.fn('AVG', nilai_Siswa.sequelize.col('rata_rata')), 'rata_rata_keseluruhan']
        ]
      });
    } catch (error) {
      console.error('Error getting average nilai:', error);
    }

    try {
      siswaBerprestasi = await nilai_Siswa.count({
        where: {
          rata_rata: {
            [nilai_Siswa.sequelize.Op.gte]: 80
          }
        }
      });
    } catch (error) {
      console.error('Error counting berprestasi:', error);
    }

    try {
      perluPerhatian = await nilai_Siswa.count({
        where: {
          rata_rata: {
            [nilai_Siswa.sequelize.Op.lt]: 60
          }
        }
      });
    } catch (error) {
      console.error('Error counting perlu perhatian:', error);
    }

    // Get clustering statistics with error handling
    let clusterStats = [];
    try {
      clusterStats = await hasil_cluster.findAll({
        attributes: [
          'keterangan',
          [hasil_cluster.sequelize.fn('COUNT', '*'), 'jumlah']
        ],
        group: ['keterangan']
      });
    } catch (error) {
      console.error('Error getting cluster stats:', error);
    }

    const clusterDistribution = {
      tinggi: { count: 0, percentage: '0.0' },
      sedang: { count: 0, percentage: '0.0' },
      rendah: { count: 0, percentage: '0.0' }
    };

    if (clusterStats && clusterStats.length > 0) {
      clusterStats.forEach(stat => {
        if (stat.dataValues.keterangan) {
          const label = stat.dataValues.keterangan.toLowerCase();
          if (clusterDistribution[label]) {
            clusterDistribution[label] = {
              count: parseInt(stat.dataValues.jumlah),
              percentage: totalClustering > 0 ? ((parseInt(stat.dataValues.jumlah) / totalClustering) * 100).toFixed(1) : "0.0"
            };
          }
        }
      });
    }

    // Get recent activities (simulated)
    const recentActivities = [
      {
        id: 1,
        action: "Data nilai siswa diperbarui",
        user: "Admin",
        time: "2 menit yang lalu"
      },
      {
        id: 2,
        action: "Clustering baru dibuat",
        user: "Admin", 
        time: "1 jam yang lalu"
      },
      {
        id: 3,
        action: "Siswa baru ditambahkan",
        user: "Admin",
        time: "3 jam yang lalu"
      },
      {
        id: 4,
        action: "Laporan clustering diunduh",
        user: "Admin",
        time: "1 hari yang lalu"
      }
    ];

    // Calculate changes (simulated for now)
    const changes = {
      siswa: "+15",
      nilai: "+89",
      clustering: "0",
      users: "+2"
    };

    // Ensure all values are valid numbers
    const avgNilai = parseFloat(avgRataRata?.dataValues?.rata_rata_keseluruhan || 0);
    const rataRataNilai = isNaN(avgNilai) ? "0.0" : avgNilai.toFixed(1);

    res.json({
      success: true,
      data: {
        stats: {
          total_siswa: totalSiswa || 0,
          total_nilai: totalNilai || 0,
          total_users: totalUsers || 0,
          total_clustering: totalClustering || 0,
          rata_rata_nilai: rataRataNilai,
          siswa_berprestasi: siswaBerprestasi || 0,
          perlu_perhatian: perluPerhatian || 0
        },
        changes,
        cluster_distribution: clusterDistribution,
        recent_activities: recentActivities
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server saat memuat data dashboard'
    });
  }
};

export const getChartData = async (req, res) => {
  try {
    // Get nilai distribution by range
    const nilaiRanges = [
      { min: 0, max: 59, label: '0-59' },
      { min: 60, max: 69, label: '60-69' },
      { min: 70, max: 79, label: '70-79' },
      { min: 80, max: 89, label: '80-89' },
      { min: 90, max: 100, label: '90-100' }
    ];

    const nilaiDistribution = [];
    for (const range of nilaiRanges) {
      try {
        const count = await nilai_Siswa.count({
          where: {
            rata_rata: {
              [nilai_Siswa.sequelize.Op.between]: [range.min, range.max]
            }
          }
        });
        nilaiDistribution.push({
          range: range.label,
          count: count
        });
      } catch (error) {
        console.error(`Error counting nilai for range ${range.label}:`, error);
        nilaiDistribution.push({
          range: range.label,
          count: 0
        });
      }
    }

    // Get nilai by kelas
    let nilaiByKelas = [];
    try {
      nilaiByKelas = await nilai_Siswa.findAll({
        include: [
          {
            model: Siswa,
            as: 'siswa',
            attributes: ['kelas']
          }
        ],
        attributes: [
          [nilai_Siswa.sequelize.fn('AVG', nilai_Siswa.sequelize.col('rata_rata')), 'rata_rata'],
          [nilai_Siswa.sequelize.fn('COUNT', '*'), 'jumlah']
        ],
        group: ['siswa.kelas']
      });
    } catch (error) {
      console.error('Error getting nilai by kelas:', error);
    }

    // Get siswa by gender
    let siswaByGender = [];
    try {
      siswaByGender = await Siswa.findAll({
        attributes: [
          'jenis_kelamin',
          [Siswa.sequelize.fn('COUNT', '*'), 'jumlah']
        ],
        group: ['jenis_kelamin']
      });
    } catch (error) {
      console.error('Error getting siswa by gender:', error);
    }

    // Get nilai trend by semester
    let nilaiBySemester = [];
    try {
      nilaiBySemester = await nilai_Siswa.findAll({
        attributes: [
          'semester',
          [nilai_Siswa.sequelize.fn('AVG', nilai_Siswa.sequelize.col('rata_rata')), 'rata_rata'],
          [nilai_Siswa.sequelize.fn('COUNT', '*'), 'jumlah']
        ],
        group: ['semester']
      });
    } catch (error) {
      console.error('Error getting nilai by semester:', error);
    }

    res.json({
      success: true,
      data: {
        nilai_distribution: nilaiDistribution,
        nilai_by_kelas: nilaiByKelas,
        siswa_by_gender: siswaByGender,
        nilai_by_semester: nilaiBySemester
      }
    });
  } catch (error) {
    console.error('Get chart data error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server saat memuat data chart'
    });
  }
};

export const getQuickStats = async (req, res) => {
  try {
    // Get today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let siswaHariIni = 0;
    let nilaiHariIni = 0;
    let clusteringHariIni = 0;

    try {
      siswaHariIni = await Siswa.count({
        where: {
          created_at: {
            [Siswa.sequelize.Op.gte]: today
          }
        }
      });
    } catch (error) {
      console.error('Error counting today siswa:', error);
    }

    try {
      nilaiHariIni = await nilai_Siswa.count({
        where: {
          created_at: {
            [nilai_Siswa.sequelize.Op.gte]: today
          }
        }
      });
    } catch (error) {
      console.error('Error counting today nilai:', error);
    }

    try {
      clusteringHariIni = await hasil_cluster.count({
        where: {
          created_at: {
            [hasil_cluster.sequelize.Op.gte]: today
          }
        }
      });
    } catch (error) {
      console.error('Error counting today clustering:', error);
    }

    // Get top performing students
    let topStudents = [];
    try {
      topStudents = await nilai_Siswa.findAll({
        include: [
          {
            model: Siswa,
            as: 'siswa',
            attributes: ['nama', 'nis', 'kelas']
          }
        ],
        attributes: ['rata_rata'],
        order: [['rata_rata', 'DESC']],
        limit: 5
      });
    } catch (error) {
      console.error('Error getting top students:', error);
    }

    // Get recent nilai entries
    let recentNilai = [];
    try {
      recentNilai = await nilai_Siswa.findAll({
        include: [
          {
            model: Siswa,
            as: 'siswa',
            attributes: ['nama', 'nis', 'kelas']
          }
        ],
        attributes: ['rata_rata', 'semester', 'created_at'],
        order: [['created_at', 'DESC']],
        limit: 10
      });
    } catch (error) {
      console.error('Error getting recent nilai:', error);
    }

    res.json({
      success: true,
      data: {
        today_stats: {
          siswa_baru: siswaHariIni,
          nilai_baru: nilaiHariIni,
          clustering_baru: clusteringHariIni
        },
        top_students: topStudents,
        recent_nilai: recentNilai
      }
    });
  } catch (error) {
    console.error('Get quick stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server saat memuat quick stats'
    });
  }
}; 